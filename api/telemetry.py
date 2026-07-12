import json
from http.server import BaseHTTPRequestHandler

from scan_food_core import log_event


ALLOWED_EVENTS = {"page_view", "feature_open", "client_error"}


class handler(BaseHTTPRequestHandler):
    def send_json(self, status, payload):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        try:
            length = int(self.headers.get("content-length", "0"))
            if length <= 0 or length > 4096:
                return self.send_json(400, {"error": "Invalid event"})
            payload = json.loads(self.rfile.read(length))
            event = payload.get("event")
            if event not in ALLOWED_EVENTS:
                return self.send_json(400, {"error": "Invalid event"})
            log_event("error" if event == "client_error" else "info", event, page=str(payload.get("page", ""))[:80], feature=str(payload.get("feature", ""))[:80])
            return self.send_json(202, {"accepted": True})
        except Exception:
            return self.send_json(400, {"error": "Invalid event"})
