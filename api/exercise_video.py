import re
import shutil
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler


VIDEO_BASE = "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/"
SAFE_FILE = re.compile(r"^[a-z0-9][a-z0-9-]*\.mp4$")


class handler(BaseHTTPRequestHandler):
    def send_text(self, status, message):
        data = message.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)

    def do_HEAD(self):
        return self.proxy_video(head_only=True)

    def do_GET(self):
        return self.proxy_video(head_only=False)

    def proxy_video(self, head_only=False):
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        filename = query.get("file", [""])[0]
        if not SAFE_FILE.fullmatch(filename):
            return self.send_text(400, "Invalid video file.")

        request = urllib.request.Request(VIDEO_BASE + filename, method="HEAD" if head_only else "GET")
        request.add_header("User-Agent", "Kinetiq/1.0")
        request.add_header("Accept", "video/mp4,*/*")
        range_header = self.headers.get("Range")
        if range_header:
            request.add_header("Range", range_header)

        try:
            with urllib.request.urlopen(request, timeout=20) as response:
                self.send_response(response.status)
                self.send_header("Content-Type", response.headers.get("Content-Type", "video/mp4"))
                self.send_header("Accept-Ranges", response.headers.get("Accept-Ranges", "bytes"))
                self.send_header("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800")
                for header in ("Content-Length", "Content-Range", "ETag", "Last-Modified"):
                    value = response.headers.get(header)
                    if value:
                        self.send_header(header, value)
                self.end_headers()
                if not head_only:
                    shutil.copyfileobj(response, self.wfile)
        except urllib.error.HTTPError as error:
            return self.send_text(error.code, "Video unavailable.")
        except Exception:
            return self.send_text(502, "Video unavailable.")
