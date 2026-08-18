create table if not exists public.kkhc_live_state (
  key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.kkhc_payment_events (
  id bigint generated always as identity primary key,
  stripe_event_id text unique,
  member_email text,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists kkhc_payment_events_member_email_idx
  on public.kkhc_payment_events (member_email);

-- Keep RLS enabled for browser safety. The Next.js server writes with SUPABASE_SERVICE_ROLE_KEY.
alter table public.kkhc_live_state enable row level security;
alter table public.kkhc_payment_events enable row level security;

-- Optional gallery storage bucket used by the FastAPI backend/admin gallery uploader.
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;
