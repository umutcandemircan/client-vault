-- ClientVault: initial schema (portals, portal_items) with RLS.
--
-- Access model:
--   * Freelancer/admin operations run server-side with the service_role key,
--     which bypasses RLS by design. No policy is required for it.
--   * Clients have no account. They authenticate with the portal access_token,
--     sent on every request as the `x-portal-token` HTTP header. PostgREST
--     exposes request headers to Postgres, so policies can match against it.
--     Without a matching token, anon/authenticated roles see nothing.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.portals (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  title        text not null,
  description  text,
  client_name  text not null,
  client_email text not null,
  status       text not null default 'active'
               check (status in ('draft', 'active', 'completed')),
  access_token text not null unique
               check (char_length(access_token) >= 32)
);

create table public.portal_items (
  id          uuid primary key default gen_random_uuid(),
  portal_id   uuid not null references public.portals (id) on delete cascade,
  title       text not null,
  description text,
  file_type   text not null,
  is_required boolean not null default true,
  status      text not null default 'pending'
              check (status in ('pending', 'uploaded', 'approved', 'rejected')),
  file_url    text,
  created_at  timestamptz not null default now()
);

create index portal_items_portal_id_idx on public.portal_items (portal_id);

-- ---------------------------------------------------------------------------
-- Token helper
-- ---------------------------------------------------------------------------

create or replace function public.request_portal_token()
returns text
language sql
stable
set search_path = ''
as $$
  select nullif(
    current_setting('request.headers', true)::json ->> 'x-portal-token',
    ''
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.portals      enable row level security;
alter table public.portal_items enable row level security;

-- Clients may read their own portal once it is published (not a draft).
create policy "portals_select_by_token"
  on public.portals
  for select
  to anon, authenticated
  using (
    status <> 'draft'
    and access_token = public.request_portal_token()
  );

-- Clients may read the checklist items of their own published portal.
create policy "portal_items_select_by_token"
  on public.portal_items
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.portals p
      where p.id = portal_items.portal_id
        and p.status <> 'draft'
        and p.access_token = public.request_portal_token()
    )
  );

-- Clients may submit uploads only while the portal is active, and may only
-- move an item to 'pending' or 'uploaded'. Approval/rejection is reserved for
-- the service role.
create policy "portal_items_update_by_token"
  on public.portal_items
  for update
  to anon, authenticated
  using (
    status in ('pending', 'uploaded', 'rejected')
    and exists (
      select 1
      from public.portals p
      where p.id = portal_items.portal_id
        and p.status = 'active'
        and p.access_token = public.request_portal_token()
    )
  )
  with check (status in ('pending', 'uploaded'));

-- ---------------------------------------------------------------------------
-- Column-level privileges
-- ---------------------------------------------------------------------------

-- RLS filters rows; column grants restrict which fields a client may write.
-- Supabase grants ALL by default, including TRUNCATE, which is not subject to
-- RLS, so start from zero and grant back only what clients need.
revoke all on public.portals, public.portal_items from anon, authenticated;

grant select on public.portals, public.portal_items to anon, authenticated;
grant update (status, file_url) on public.portal_items to anon, authenticated;

grant execute on function public.request_portal_token() to anon, authenticated;
