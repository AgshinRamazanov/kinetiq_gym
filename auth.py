import json
import os
import urllib.error
import urllib.request


def authenticated_user_id(authorization):
    """Validate a Supabase access token server-side and return its user id."""
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    anon_key = os.environ.get("SUPABASE_ANON_KEY", "")
    if not url or not anon_key:
        return None
    token = authorization.split(None, 1)[1].strip()
    request = urllib.request.Request(
        f"{url}/auth/v1/user",
        headers={"Authorization": f"Bearer {token}", "apikey": anon_key},
    )
    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            return json.loads(response.read()).get("id")
    except (urllib.error.URLError, ValueError, KeyError):
        return None
