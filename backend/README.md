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
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/profile`
- `POST /api/payments/checkout`
- `POST /api/import/kolky?from=2026-07-01&query=Hlohovec`

Default demo/admin login:

- `admin@kkhlohovec.sk` / `admin123`
- `michaela@kkhlohovec.sk` / `michaela123`

