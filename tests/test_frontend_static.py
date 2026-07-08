import json
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEXT_EXTENSIONS = {".html", ".css", ".js", ".json", ".webmanifest", ".md", ".svg"}
MOJIBAKE_TOKENS = ("вЂ", "Г—", "пј", "вњ", "в†", "В·", "в–", "вЊ", "вЂў", "вЂ¦")


class AssetParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.assets = []
        self.manifest = None

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag in {"script", "img"} and values.get("src"):
            self.assets.append(values["src"])
        if tag == "link" and values.get("href"):
            rel = values.get("rel", "")
            href = values["href"]
            if "manifest" in rel:
                self.manifest = href
            if any(item in rel for item in ("stylesheet", "icon", "apple-touch-icon")):
                self.assets.append(href)


def local_asset_path(reference):
    if re.match(r"^[a-z]+:", reference) or reference.startswith("//") or reference.startswith("#"):
        return None
    return reference.split("?", 1)[0].split("#", 1)[0].lstrip("./")


class FrontendStaticTests(unittest.TestCase):
    def test_index_referenced_local_assets_exist(self):
        parser = AssetParser()
        parser.feed((ROOT / "index.html").read_text(encoding="utf-8"))
        missing = []
        for reference in parser.assets:
            path = local_asset_path(reference)
            if path and not (ROOT / path).exists():
                missing.append(reference)
        self.assertEqual([], missing)

    def test_pwa_manifest_and_service_worker_are_wired(self):
        parser = AssetParser()
        parser.feed((ROOT / "index.html").read_text(encoding="utf-8"))
        self.assertEqual("manifest.webmanifest", parser.manifest)
        self.assertIn("pwa.js?v=20260708-1", parser.assets)
        self.assertIn("i18n.js?v=20260709-3", parser.assets)

        manifest = json.loads((ROOT / "manifest.webmanifest").read_text(encoding="utf-8"))
        self.assertEqual("KINETIQ", manifest["short_name"])
        self.assertEqual("standalone", manifest["display"])
        self.assertTrue(manifest["icons"])
        for icon in manifest["icons"]:
            self.assertTrue((ROOT / local_asset_path(icon["src"])).exists())

        service_worker = (ROOT / "sw.js").read_text(encoding="utf-8")
        self.assertIn("const APP_SHELL", service_worker)
        self.assertIn("./index.html", service_worker)
        self.assertIn("./manifest.webmanifest", service_worker)
        self.assertIn("./pwa.js", service_worker)
        self.assertIn("./i18n.js", service_worker)
        self.assertIn("request.mode === 'navigate'", service_worker)

    def test_language_selector_and_dictionaries_exist(self):
        index = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn("data-language-select", index)
        self.assertLess(index.index("i18n.js?v=20260709-3"), index.index("app.js"))

        i18n = (ROOT / "i18n.js").read_text(encoding="utf-8")
        self.assertIn("ru:", i18n)
        self.assertIn("tr:", i18n)
        self.assertIn("'Good morning,': 'Доброе утро,'", i18n)
        self.assertIn("'Good morning,': 'Günaydın,'", i18n)

    def test_vercel_scanner_route_is_configured(self):
        config = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))
        self.assertIn({"source": "/api/scan-food", "destination": "/api/scan_food"}, config["rewrites"])
        self.assertIn("api/scan_food.py", config["functions"])
        self.assertIn("server.py", (ROOT / ".vercelignore").read_text(encoding="utf-8"))

        api_file = ROOT / "api" / "scan_food.py"
        self.assertTrue(api_file.exists())
        api_source = api_file.read_text(encoding="utf-8")
        self.assertIn("class handler(BaseHTTPRequestHandler)", api_source)
        self.assertIn("handle_scan_request", api_source)

    def test_text_files_do_not_contain_common_mojibake(self):
        offenders = []
        for path in ROOT.rglob("*"):
            if "tests" in path.parts or ".git" in path.parts or "__pycache__" in path.parts:
                continue
            if path.is_file() and path.suffix in TEXT_EXTENSIONS:
                text = path.read_text(encoding="utf-8")
                found = [token for token in MOJIBAKE_TOKENS if token in text]
                if found:
                    offenders.append(f"{path.relative_to(ROOT)}: {', '.join(found)}")
        self.assertEqual([], offenders)


if __name__ == "__main__":
    unittest.main()
