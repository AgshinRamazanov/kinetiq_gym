import json
from http.server import BaseHTTPRequestHandler

from scan_food_core import handle_scan_request
from auth import authenticated_user_id


class handler(BaseHTTPRequestHandler):
    def send_json(self, status, payload):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length)
        forwarded_for = self.headers.get("x-forwarded-for", "")
        client_ip = forwarded_for.split(",", 1)[0].strip() or self.client_address[0]
        user_id = authenticated_user_id(self.headers.get("authorization"))
        status, payload = handle_scan_request(body, length, client_ip, user_id)
        return self.send_json(status, payload)

    def do_GET(self):
        return self.send_json(405, {"error": "Use POST to scan a food photo."})
