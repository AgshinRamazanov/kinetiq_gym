# KINETIQ prototype

## Run with the Gemini food scanner

The API key stays on the server and is never included in browser code.

Easiest local setup: create a `.env` file in this project folder:

```text
GEMINI_API_KEY=YOUR_KEY_HERE
```

Then run:

```powershell
python server.py
```

Alternative one-session setup:

```powershell
$env:GEMINI_API_KEY="YOUR_KEY_HERE"
python server.py
```

Then open `http://localhost:8000`. Do not commit the key or paste it into `scanner.js`. The `.env` file is already ignored by Git.

For phone testing, connect the phone and computer to the same Wi-Fi and open
`http://YOUR-PC-IP:8000` on the phone. The server listens on the local network by default.

The food result is an image-based estimate. Portion weight, oils, sauces, and hidden ingredients can change the real nutritional values.

## PWA install/offline shell

KINETIQ includes a web app manifest and service worker. On supported mobile browsers it can be added to the home screen and launched in standalone mode. The service worker caches the app shell for faster reloads and basic offline access to saved local views; live scanner requests still need the Python server and network access.

## Deploy on Vercel

The app is ready for Vercel as a static frontend plus a Python serverless scanner endpoint. `vercel.json` rewrites `/api/scan-food` to `api/scan_food.py`, so the existing browser code keeps working.

Before sharing the deployed URL:

- Add `GEMINI_API_KEY` as a Vercel environment variable.
- Optionally set `GEMINI_MODEL` and `GEMINI_DAILY_LIMIT` in Vercel.
- Add the Vercel HTTPS URL in Supabase Authentication > URL Configuration if cloud sync is enabled.
- Redeploy after changing environment variables.

Your friends can open the Vercel HTTPS URL from anywhere and install the PWA from their phone. The scanner will work as long as the Vercel function has `GEMINI_API_KEY` configured.

Run the release smoke checks with:

```powershell
python -m unittest discover -s tests
```

## Supabase accounts and synchronization

After pulling a schema change, run `supabase-schema.sql` in Supabase Dashboard >
SQL Editor before deploying the frontend. The schema enables per-user RLS,
versioned records, conflict detection, and the protected `delete_own_account`
function. Never place a service-role key in browser code.

For public signup, email verification, and password recovery, configure a custom
SMTP provider under Supabase Authentication. The built-in sender is suitable only
for limited development testing. Add every production and preview URL to Supabase
Authentication > URL Configuration so verification and recovery links return to
the correct app.
