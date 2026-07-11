import json
import os
import sys
import threading
import time
import urllib.error
import urllib.request
from collections import defaultdict, deque


MAX_REQUEST = 15 * 1024 * 1024
SUPPORTED_MIME_TYPES = ("image/jpeg", "image/png", "image/webp")
MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_DAILY_LIMIT = int(os.environ.get("GEMINI_DAILY_LIMIT", "200"))


class SlidingWindowLimiter:
    def __init__(self, limit, window_seconds):
        self.limit, self.window = limit, window_seconds
        self.events, self.lock = defaultdict(deque), threading.Lock()

    def allow(self, identity, now=None):
        now = time.time() if now is None else now
        with self.lock:
            events = self.events[identity]
            while events and events[0] <= now - self.window:
                events.popleft()
            if len(events) >= self.limit:
                return False
            events.append(now)
            return True


class DailyQuota:
    def __init__(self, limit):
        self.limit, self.day, self.used, self.lock = limit, None, 0, threading.Lock()

    def consume(self, now=None):
        current_day = time.strftime("%Y-%m-%d", time.gmtime(time.time() if now is None else now))
        with self.lock:
            if current_day != self.day:
                self.day, self.used = current_day, 0
            if self.used >= self.limit:
                return False
            self.used += 1
            return True


burst_limiter = SlidingWindowLimiter(8, 60)
daily_ip_limiter = SlidingWindowLimiter(40, 86400)
gemini_quota = DailyQuota(GEMINI_DAILY_LIMIT)


def log_event(level, event, **details):
    record = {"time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "level": level, "event": event, **details}
    print(json.dumps(record, ensure_ascii=False), file=sys.stderr, flush=True)


SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "name": {"type": "STRING"},
        "items": {"type": "ARRAY", "items": {"type": "STRING"}},
        "calories": {"type": "INTEGER"},
        "protein": {"type": "INTEGER"},
        "carbs": {"type": "INTEGER"},
        "fat": {"type": "INTEGER"},
        "confidence": {"type": "STRING", "enum": ["low", "medium", "high"]},
        "assumptions": {"type": "STRING"},
    },
    "required": ["name", "items", "calories", "protein", "carbs", "fat", "confidence", "assumptions"],
}


def handle_scan_request(body, content_length, client_ip, user_id=None):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        return 503, {"error": "Scanner is not configured. Set GEMINI_API_KEY on the server."}

    try:
        identity = f"user:{user_id}" if user_id else f"ip:{client_ip}"
        if not burst_limiter.allow(identity):
            log_event("warning", "scan_rate_limited", identity_type="user" if user_id else "ip", limit="burst")
            return 429, {"error": "Too many scans. Please wait one minute and try again."}
        if not daily_ip_limiter.allow(identity):
            log_event("warning", "scan_rate_limited", identity_type="user" if user_id else "ip", limit="daily")
            return 429, {"error": "Daily scanning limit reached. Please try again tomorrow."}
        if content_length <= 0 or content_length > MAX_REQUEST:
            return 413, {"error": "Image request must be smaller than 15 MB."}

        incoming = json.loads(body)
        image = incoming.get("image", "")
        mime = incoming.get("mimeType", "")
        if mime not in SUPPORTED_MIME_TYPES or not image:
            return 400, {"error": "A JPEG, PNG, or WebP food photo is required."}
        if not gemini_quota.consume():
            log_event("warning", "gemini_budget_reached")
            return 503, {"error": "The scanner has reached today's usage budget."}

        result = analyze_food_image(key, image, mime)
        log_event("info", "scan_complete", identity_type="user" if user_id else "ip", confidence=result.get("confidence"))
        return 200, result
    except urllib.error.HTTPError as error:
        detail = "Gemini could not analyze this image."
        try:
            upstream = json.loads(error.read())
            detail = upstream.get("error", {}).get("message", detail)
        except Exception:
            pass
        log_event("error", "gemini_http_error", status=error.code)
        return 502, {"error": detail}
    except Exception as error:
        log_event("error", "scan_unhandled_error", error_type=type(error).__name__)
        return 500, {"error": "The photo could not be analyzed. Please try another image."}


def analyze_food_image(key, image, mime):
    prompt = (
        "Analyze the food visible in this image. Estimate the entire visible serving's calories, protein, "
        "carbohydrates, and fat. Identify ingredients. Be conservative about certainty: photos cannot reveal "
        "exact weight, hidden oils, sauces, or recipes. Return integers in kcal and grams. If this is not food, "
        "use confidence low and explain that in assumptions. Do not provide medical advice."
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}, {"inlineData": {"mimeType": mime, "data": image}}]}],
        "generationConfig": {"responseMimeType": "application/json", "responseSchema": SCHEMA, "temperature": 0.1},
    }
    request = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
        method="POST",
    )
    gemini = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                gemini = json.loads(response.read())
            break
        except urllib.error.HTTPError as upstream_error:
            if upstream_error.code not in (429, 503) or attempt == 2:
                raise
            time.sleep(1.5 * (attempt + 1))
    text = gemini["candidates"][0]["content"]["parts"][0]["text"]
    result = json.loads(text)
    for field in ("calories", "protein", "carbs", "fat"):
        result[field] = max(0, int(result[field]))
    return result
