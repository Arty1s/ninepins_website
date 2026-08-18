# KK Hlohovec FastAPI Backend

Local backend for club data, admin CRUD, tournament registrations, profile data, Stripe checkout preparation, and kolky.sk import.

## Run locally

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Health check:

```powershell
Invoke-WebRequest http://127.0.0.1:8000/health
```

## Important endpoints

- `GET /api/club-data`
- `GET /api/admin/live-data`
- `PUT /api/admin/live-data`
- `GET /api/tournament-registrations?tournamentId=1`
- `POST /api/tournament-registrations`
- `DELETE /api/tournament-registrations/{id}`
- `GET /api/admin/tournaments/{id}/registrations`
- `DELETE /api/admin/tournament-registrations/{id}`
- `POST /api/members/ensure`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/profile`
- `POST /api/payments/checkout`
- `POST /api/import/kolky?from=2025-09-01&query=Hlohovec`
- `POST /api/admin/sync?from=2025-09-01&to=2027-06-30&mode=live&full_refresh=true`

Kolky import runs only when the endpoint/admin button is called, or from the optional runtime cron loop. It does not need network during build. Useful modes:

- `POST /api/admin/sync?from=2025-09-01&to=2027-06-30&mode=live&full_refresh=true` runs the live crawler from the running FastAPI backend and preserves existing rows if discovery looks incomplete.
- `POST /api/import/kolky?mode=fixture&from=2025-09-01&query=Hlohovec` loads bundled development data.
- `POST /api/import/kolky?mode=cache&cacheFile=fixtures/kolky-hlohovec-matches.json` loads a project-relative JSON file only.

## Production data

Apply `supabase/schema.sql` in Supabase SQL editor, then set these in `backend/.env`:

```powershell
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-key
SUPABASE_LIVE_STATE_TABLE=kkhc_live_state
SUPABASE_STORAGE_BUCKET=gallery
```

The backend writes club data and tournament registrations to Supabase when those variables are present. Without them, it falls back to local `.data` JSON files.

Imported matches are merged by source URL. If an admin edits a match and it is marked `importStatus: "edited"` or `adminLocked: true`, later imports will not overwrite it.

Paid tournament cancellations are marked as refund-eligible only when cancelled at least 48 hours before the tournament start.

FastAPI also starts a 24h background import loop when `KOLKY_AUTO_IMPORT_ENABLED=true`.

Default demo/admin login:

- `admin@kkhlohovec.sk` / `admin123`
- `michaela@kkhlohovec.sk` / `michaela123`
