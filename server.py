"""Local app server and secure Gemini food-analysis proxy.

Run with:  $env:GEMINI_API_KEY='...'; python server.py
Never commit or place the key in browser JavaScript.
"""
import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


def load_local_env(path=".env"):
    """Load simple KEY=value lines for local development without extra packages."""
    if not os.path.exists(path):
        return
    try:
        with open(path, "r", encoding="utf-8") as env_file:
            for raw_line in env_file:
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value
    except OSError:
        pass


load_local_env()

from scan_food_core import DailyQuota, SlidingWindowLimiter, handle_scan_request


class AppHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Development assets change frequently. Prevent an older JS catalogue
        # from surviving a refresh and restoring obsolete exercise videos.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Permissions-Policy", "camera=(self), microphone=(), geolocation=()")
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src https:; connect-src 'self' https://cdn.jsdelivr.net https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'")
        super().end_headers()

    def send_json(self, status, payload):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        if self.path != "/api/scan-food":
            return self.send_json(404, {"error": "Not found"})
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length)
        status, payload = handle_scan_request(body, length, self.client_address[0])
        return self.send_json(status, payload)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"KINETIQ running at http://localhost:{port}")
    print("For phone testing, open http://YOUR-PC-IP:%s on the same Wi-Fi" % port)
    print("Gemini scanner:", "configured" if os.environ.get("GEMINI_API_KEY") else "missing GEMINI_API_KEY")
    ThreadingHTTPServer((host, port), AppHandler).serve_forever()
