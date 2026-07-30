# ninepins_website

Moderný full-stack web pre Kolkársky klub Hlohovec postavený v Next.js, TypeScript, Tailwind CSS a FastAPI.

## Spustenie frontendu

```bash
npm install
npm run dev
```

Lokálne:

```text
http://127.0.0.1:3003
```

## Spustenie FastAPI backendu

```powershell
cd backend
.\run_backend.ps1
```

Backend beží na:

```text
http://127.0.0.1:8000
```

## Dôležité trasy

```text
/
/timy
/timy/[slug]
/zapasy
/turnaje
/cennik
/kontakt
/galeria
/prihlasenie
/registracia
/profile
/admin
```

## Lokálne účty

```text
Admin: admin@kkhlohovec.sk / admin123
Člen:  michaela@kkhlohovec.sk / michaela123
```

## Konfigurácia

Použi `.env.example` a `backend/.env.example` ako šablóny. Produkčné prihlasovanie cez Google/Facebook potrebuje Supabase OAuth nastavenia. Platby cez Stripe potrebujú `STRIPE_SECRET_KEY`.
