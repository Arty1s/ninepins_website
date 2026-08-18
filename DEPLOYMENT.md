# KK Hlohovec Production Deployment

Canonical URL: `https://kolkyhlohovec.com`

## Architecture

- Frontend: Next.js 14, TypeScript, Tailwind CSS.
- Backend: FastAPI, Python 3.11.
- Database/state: Supabase is the production target. Local `.data` JSON is development fallback only.
- Payments: Stripe variables are prepared but Stripe can stay disabled until products/webhooks are configured.

This is not a static-only site. The frontend uses Next.js server routes, middleware and API proxy routes, while the crawler/admin API runs in FastAPI. The FastAPI backend must be hosted separately from Cloudflare Pages.

## GitHub

- Repository: `https://github.com/Arty1s/ninepins_website`
- Production branch: `main`
- Project root: repository root

## Frontend on Cloudflare Pages

Recommended Cloudflare Pages settings:

- Framework preset: `Next.js`
- Root directory: `/`
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `.next`
- Node version: `20`

Environment variables:

```text
NEXT_PUBLIC_SITE_URL=https://kolkyhlohovec.com
NEXT_PUBLIC_API_URL=https://api.kolkyhlohovec.com
FASTAPI_URL=https://api.kolkyhlohovec.com
NEXT_PUBLIC_SUPABASE_URL=<your Supabase project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your Supabase publishable/anon key>
SUPABASE_SERVICE_ROLE_KEY=<server-only Supabase service role key>
ADMIN_EMAIL=admin@kkhlohovec.sk
ADMIN_SESSION_SECRET=<long random secret>
USER_SESSION_SECRET=<long random secret>
ADMIN_COOKIE_SECURE=true
KOLKY_IMPORT_SECRET=<long random secret>
STRIPE_SECRET_KEY=<optional for payments>
STRIPE_WEBHOOK_SECRET=<optional for payments>
RESEND_API_KEY=<optional for email>
RESEND_FROM_EMAIL=<optional for email>
```

If Cloudflare's Next.js preset asks for an adapter build command, use the current Cloudflare-recommended OpenNext/Next adapter in the dashboard. Do not use a static export for this project.

## Backend Hosting

Host the FastAPI backend on a persistent Python/container host such as Render, Railway, Fly.io, Google Cloud Run, or a VPS. Cloudflare Pages is not appropriate for this backend.

Backend build/start:

```text
pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
```

Docker:

```text
docker build -t kkhc-api ./backend
docker run -p 8000:8000 --env-file backend/.env kkhc-api
```

Production backend environment:

```text
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
FRONTEND_ORIGIN=https://kolkyhlohovec.com
FRONTEND_ORIGINS=https://kolkyhlohovec.com,https://www.kolkyhlohovec.com
COOKIE_SECURE=true
NEXT_PUBLIC_SUPABASE_URL=<your Supabase project URL>
SUPABASE_SERVICE_ROLE_KEY=<server-only Supabase service role key>
SUPABASE_LIVE_STATE_TABLE=kkhc_live_state
SUPABASE_STORAGE_BUCKET=gallery
KOLKY_IMPORT_SECRET=<same secret as frontend>
KOLKY_IMPORT_FROM=2025-09-01
KOLKY_IMPORT_TO=2027-06-30
KOLKY_AUTO_IMPORT_ENABLED=true
STRIPE_SECRET_KEY=<optional for payments>
STRIPE_WEBHOOK_SECRET=<optional for payments>
```

Expose it as `https://api.kolkyhlohovec.com`, then set Cloudflare DNS to point `api` to the backend host.

## Cloudflare DNS

Create these records after the backend host provides its target:

- `kolkyhlohovec.com` -> Cloudflare Pages custom domain.
- `www.kolkyhlohovec.com` -> redirect to `https://kolkyhlohovec.com`.
- `api.kolkyhlohovec.com` -> backend host CNAME/A record.

Use a Cloudflare Redirect Rule:

```text
When hostname equals www.kolkyhlohovec.com
Forwarding URL: 301 https://kolkyhlohovec.com/$1
```

## Supabase Auth URLs

Set these in Supabase Auth:

- Site URL: `https://kolkyhlohovec.com`
- Redirect URL: `https://kolkyhlohovec.com/api/auth/callback`
- Add local redirect for development: `http://127.0.0.1:3003/api/auth/callback`

## Verification

Before deploying:

```powershell
npm ci
npm run build
.\backend\.venv-run\Scripts\python.exe -m pytest backend/tests
```

After deploying:

```powershell
Invoke-WebRequest https://kolkyhlohovec.com
Invoke-WebRequest https://api.kolkyhlohovec.com/health
```
