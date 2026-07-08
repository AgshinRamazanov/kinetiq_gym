# KINETIQ release checklist

## Required before a public launch

- Deploy behind HTTPS. Do not expose `server.py` directly to the internet; use a managed host or reverse proxy with TLS.
- Store `GEMINI_API_KEY` only in deployment secrets. Never place it in browser JavaScript.
- Set `GEMINI_DAILY_LIMIT` to an affordable daily budget and configure provider billing alerts.
- Keep Supabase Row Level Security enabled and run `supabase-schema.sql` after every schema change.
- Add the production HTTPS URL under Supabase Authentication > URL Configuration.
- Connect structured server logs to an error-monitoring service and configure alerts for HTTP 5xx and Gemini failures.
- Replace IP-only limits with authenticated user limits when scanner requests carry Supabase access tokens.
- Run `python -m unittest discover -s tests` and JavaScript syntax checks before deployment.
- Test account deletion, data export, privacy policy, terms, consent and recovery flows.
- Test on current Safari/iOS and Chrome/Android using a staging deployment.

## Current protections

- Request-size validation and supported-image validation.
- Burst and daily IP scanning limits.
- Global daily Gemini usage guard.
- Security headers and restrictive Content Security Policy.
- Row-level database security and per-user records.
- Client-side image compression.
- Structured server event/error logs.
