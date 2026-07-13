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
    def test_shared_core_modules_load_before_features(self):
        index = (ROOT / "index.html").read_text(encoding="utf-8")
        storage_position = index.index('src="core/storage.js')
        ui_position = index.index('src="core/ui.js')
        home_position = index.index('src="home.js')
        self.assertLess(storage_position, home_position)
        self.assertLess(ui_position, home_position)

        storage = (ROOT / "core" / "storage.js").read_text(encoding="utf-8")
        ui = (ROOT / "core" / "ui.js").read_text(encoding="utf-8")
        self.assertIn("global.readLocal = readLocal", storage)
        self.assertIn("global.writeLocal = writeLocal", storage)
        self.assertIn("global.navigate = navigate", ui)

        service_worker = (ROOT / "sw.js").read_text(encoding="utf-8")
        self.assertIn("'./core/storage.js'", service_worker)
        self.assertIn("'./core/ui.js'", service_worker)
        self.assertIn("'./core/sync-queue.js'", service_worker)

    def test_account_recovery_deletion_and_versioned_sync_are_wired(self):
        index = (ROOT / "index.html").read_text(encoding="utf-8")
        cloud = (ROOT / "cloud.js").read_text(encoding="utf-8")
        schema = (ROOT / "supabase-schema.sql").read_text(encoding="utf-8")
        self.assertIn('id="forgot-password"', index)
        self.assertIn('id="password-reset-form"', index)
        self.assertIn('id="delete-account"', index)
        self.assertIn('id="resend-verification"', index)
        self.assertIn("resetPasswordForEmail", cloud)
        self.assertIn("supabase.auth.resend", cloud)
        self.assertIn("kinetiq-pending-verification", cloud)
        self.assertIn("delete_own_account", cloud)
        self.assertIn("revision bigint", schema)
        self.assertIn("function public.delete_own_account", schema)

    def test_production_legal_telemetry_and_authenticated_limits_are_wired(self):
        index = (ROOT / "index.html").read_text(encoding="utf-8")
        cloud = (ROOT / "cloud.js").read_text(encoding="utf-8")
        scanner = (ROOT / "scanner.js").read_text(encoding="utf-8")
        core = (ROOT / "scan_food_core.py").read_text(encoding="utf-8")
        self.assertIn('src="legal.js"', index)
        self.assertIn('src="telemetry.js"', index)
        self.assertIn("terms_version", cloud)
        self.assertIn("getCloudAccessToken", cloud)
        self.assertIn("headers.Authorization", scanner)
        self.assertIn('f"user:{user_id}"', core)

    def test_editorial_concept_ui_is_wired(self):
        index = (ROOT / "index.html").read_text(encoding="utf-8")
        service_worker = (ROOT / "sw.js").read_text(encoding="utf-8")
        concept = (ROOT / "concept-ui.js").read_text(encoding="utf-8")
        self.assertIn('concept-ui.css', index)
        self.assertIn('concept-ui.js', index)
        self.assertIn("./concept-ui.css", service_worker)
        self.assertIn("form-wellness-log", concept)
        self.assertIn("form-progress-photos", concept)
        dynamic_i18n = (ROOT / "dynamic-i18n.js").read_text(encoding="utf-8")
        self.assertIn("registerTranslations", dynamic_i18n)
        self.assertIn("Privacy Policy", dynamic_i18n)
        self.assertIn("Workout Plan", dynamic_i18n)
        train = (ROOT / "train.js").read_text(encoding="utf-8")
        self.assertIn('class="session-thumb"', train)
        self.assertIn("push: ['Barbell Bench Press'", train)
        self.assertIn("pull: ['Pull-Up / Chin-Up'", train)
        substitutions = (ROOT / "substitutions.js").read_text(encoding="utf-8")
        self.assertIn("const substitutionCatalog", substitutions)
        self.assertIn("exerciseGroup", substitutions)
        self.assertIn("Start from any exercise", substitutions)
        for name in ("lower.png", "upper.png", "push.png", "pull.png", "full-body.png"):
            self.assertTrue((ROOT / "assets" / "training-split" / name).exists())
        self.assertTrue((ROOT / "assets" / "training-split" / "muscle-groups.png").exists())
        for name in ("lower.png", "upper.png", "push.png", "pull.png", "full.png", "core.png"):
            self.assertTrue((ROOT / "assets" / "training-split" / "transparent" / name).exists())
        self.assertIn("split-cutout", concept)

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
        self.assertIn("pwa.js?v=20260714-1", parser.assets)
        self.assertIn("i18n.js?v=20260714-1", parser.assets)
        self.assertIn("styles.css?v=20260709-7", parser.assets)
        self.assertIn("train.css?v=20260709-6", parser.assets)

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
        self.assertNotIn("location.reload()", (ROOT / "pwa.js").read_text(encoding="utf-8"))
        self.assertIn("./i18n.js", service_worker)
        self.assertIn("request.mode === 'navigate'", service_worker)
        self.assertRegex(service_worker, r"kinetiq-shell-v\d{8}-\d+")

    def test_language_selector_and_dictionaries_exist(self):
        index = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn("data-language-select", index)
        self.assertLess(index.index("i18n.js?v=20260714-1"), index.index("app.js"))

        i18n = (ROOT / "i18n.js").read_text(encoding="utf-8")
        self.assertIn("ru:", i18n)
        self.assertIn("tr:", i18n)
        self.assertIn("'Good morning,': 'Доброе утро,'", i18n)
        self.assertIn("'Good morning,': 'Günaydın,'", i18n)

    def test_training_sessions_require_generated_daily_plan(self):
        index = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn('data-exercise-name="Barbell Bench Press"', index)
        self.assertNotIn('class="session today" data-open="workout"', index)
        self.assertIn("train.js?v=20260714-1", index)

        train = (ROOT / "train.js").read_text(encoding="utf-8")
        self.assertIn("function bindSessionVideoButtons", train)
        self.assertIn("function todayWorkoutKey", train)
        self.assertIn("function requireTodayWorkoutGenerated", train)
        self.assertIn("Generate today\\'s workout first.", train)
        self.assertIn("openExercise(button.dataset.exerciseName", train)

    def test_app_tracks_date_changes_for_today_views(self):
        home = (ROOT / "home.js").read_text(encoding="utf-8")
        self.assertIn("function appDateTimeSnapshot", home)
        self.assertIn("appDateChanged", home)

        train = (ROOT / "train.js").read_text(encoding="utf-8")
        scanner = (ROOT / "scanner.js").read_text(encoding="utf-8")
        self.assertIn("window.addEventListener('appDateChanged', setTrainPlanReadyState)", train)
        self.assertIn("window.addEventListener('appDateChanged',renderTrackedIntake)", scanner)

    def test_logged_out_home_has_no_stale_user_or_rhythm_numbers(self):
        index = (ROOT / "index.html").read_text(encoding="utf-8")
        home = (ROOT / "home.js").read_text(encoding="utf-8")
        train = (ROOT / "train.js").read_text(encoding="utf-8")
        self.assertNotIn("Senan", index)
        self.assertNotIn("<em>Senan.</em>", train)
        self.assertIn('id="rhythm-section-title" hidden', index)
        self.assertIn('id="rhythm-grid" hidden', index)
        self.assertIn("function renderRhythmAccess", home)
        self.assertIn("renderRhythmAccess(null)", home)

    def test_today_streak_uses_saved_exercise_completions(self):
        index = (ROOT / "index.html").read_text(encoding="utf-8")
        home = (ROOT / "home.js").read_text(encoding="utf-8")
        self.assertIn('id="training-streak">0</strong>', index)
        self.assertNotIn("<strong>12</strong><small>days</small>", index)
        self.assertIn("function calculateTrainingStreak", home)
        self.assertIn("form-exercise-completions", home)
        self.assertIn("window.addEventListener('exerciseCompleted', renderTrainingStreak)", home)

    def test_new_users_start_training_program_from_beginning(self):
        index = (ROOT / "index.html").read_text(encoding="utf-8")
        train = (ROOT / "train.js").read_text(encoding="utf-8")
        self.assertIn('id="home-program-position">WEEK 1 · DAY 1</span>', index)
        self.assertIn('id="program-week-number">01</b>', index)
        self.assertIn('id="profile-training-week">1 of 8</strong>', index)
        self.assertIn('id="profile-workouts">0 completed</strong>', index)
        self.assertNotIn("WEEK 3 · DAY 2", index)
        self.assertIn("function currentProgramPosition", train)
        self.assertIn("completedDays + 1", train)

    def test_dynamic_reminder_ui_translates(self):
        index = (ROOT / "index.html").read_text(encoding="utf-8")
        reminders = (ROOT / "reminders.js").read_text(encoding="utf-8")
        self.assertIn("reminders.js?v=20260710-1", index)
        self.assertIn("const reminderCopy", reminders)
        self.assertIn("function renderReminderLanguage", reminders)
        self.assertIn("window.addEventListener('languageChanged', renderReminderLanguage)", reminders)
        self.assertIn("data-reminder-copy=\"configure\"", reminders)

    def test_train_builder_styles_have_main_stylesheet_fallback(self):
        styles = (ROOT / "styles.css").read_text(encoding="utf-8")
        self.assertIn(".workout-builder{margin-top:15px", styles)
        self.assertIn(".choice-row,.body-choice{display:grid", styles)
        self.assertIn(".generate-button{width:100%", styles)

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

    def test_exercise_videos_are_proxied_through_app(self):
        train = (ROOT / "train.js").read_text(encoding="utf-8")
        index = (ROOT / "index.html").read_text(encoding="utf-8")
        config = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))

        self.assertIn("/api/exercise-video?file=", train)
        self.assertNotIn("github.com/amiinwani/free-exercise-db-with-videos", train)
        self.assertNotIn("Verified source", index)
        self.assertIn({"source": "/api/exercise-video", "destination": "/api/exercise_video"}, config["rewrites"])
        self.assertIn("api/exercise_video.py", config["functions"])
        self.assertIn("media-src 'self' https:", json.dumps(config))

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
