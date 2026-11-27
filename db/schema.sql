-- GRAVL B2B · Esquema propuesto (PostgreSQL 16)
-- ---------------------------------------------------------------
-- Base del Partner API. NO contiene datos de entrenamiento: esos viven
-- en el core de GRAVL y se leen por api.gravl.ai con los scopes que el
-- socio concede (OAuth 2.0). Acá solo vive lo que es del negocio B2B.
--
-- Aislamiento: Row-Level Security por partner. El backend setea
--   SET app.partner_id = '<uuid del token>'
-- al abrir cada transacción; ninguna consulta puede ver otro partner.
-- ---------------------------------------------------------------

create extension if not exists pgcrypto;

-- Partners y su red ------------------------------------------------
create table partner (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  vertical      text not null check (vertical in ('GYM_CHAIN','CORPORATE_WELLNESS','COACH_STUDIO')),
  market        char(2) not null,                -- AR, BR, MX...
  data_region   text not null default 'sa-east',  -- residencia de datos
  created_at    timestamptz not null default now()
);

create table location (
  id            uuid primary key default gen_random_uuid(),
  partner_id    uuid not null references partner(id),
  name          text not null,
  tier          text,                            -- SportClub: Flex / Plus / Total / Elite
  region        text,
  external_id   text,                            -- ID de la sede en el ERP del partner
  unique (partner_id, external_id)
);

create table machine (
  id            uuid primary key default gen_random_uuid(),
  partner_id    uuid not null references partner(id),
  location_id   uuid not null references location(id),
  catalog_code  text not null,                   -- código del catálogo de equipos de GRAVL
  quantity      int  not null default 1,
  status        text not null default 'OPERATIONAL' check (status in ('OPERATIONAL','MAINTENANCE'))
);

-- Acuerdo comercial (lo edita solo GRAVL desde la consola) ---------
create table deal (
  id                uuid primary key default gen_random_uuid(),
  partner_id        uuid not null references partner(id),
  segment           text not null,
  pricing_model     text not null,
  unit_price_usd    numeric(10,2),
  minimum_monthly   numeric(10,2),
  rev_share_pct     numeric(5,2) default 0,
  term_months       int not null,
  signed_at         date,
  renews_at         date,
  special_terms     text[] default '{}'
);

-- Política por plan de membresía (Flex se reactiva; Plus/Total no) --
create table plan_policy (
  partner_id              uuid not null references partner(id),
  plan_code               text not null,           -- 'flex', 'plus', 'total'
  billing                 text not null check (billing in ('FIXED','BASE_PLUS_USAGE')),
  monetization            text not null check (monetization in ('ATTENDANCE','BREAKAGE','SPONSORED','SERVICE')),
  contact_dormant_payers  boolean not null,
  dormant_after_days      int not null,
  max_nudges_per_30d      int not null,
  cancel_intent_handler   text not null check (cancel_intent_handler in ('PUSH','STAFF')),
  primary key (partner_id, plan_code)
);

-- Vínculo socio ↔ partner (la cuenta es del socio, vive en GRAVL) ---
create table membership (
  id                 uuid primary key default gen_random_uuid(),
  partner_id         uuid not null references partner(id),
  gravl_user_id      uuid not null,               -- cuenta en el core de GRAVL
  external_member_id text,                        -- ID en el ERP (ej. nro de carnet SportClub)
  location_id        uuid references location(id),
  plan_code          text,
  scopes             text[] not null,             -- ACTIVITY, PERFORMANCE, WELLNESS, PARTNER_MESSAGING, PUBLIC_PROFILE
  source             text not null check (source in ('QR_SCAN','ERP_SYNC','CORPORATE_SSO','COACH_INVITE')),
  linked_at          timestamptz not null default now(),
  revoked_at         timestamptz,                 -- baja del gimnasio o revocación del socio
  unique (partner_id, gravl_user_id)
);

-- Señales del ERP (pagos, intención de baja) -----------------------
create table member_signal (
  id            bigserial primary key,
  partner_id    uuid not null references partner(id),
  membership_id uuid not null references membership(id),
  kind          text not null check (kind in ('CANCEL_PAGE_VISIT','PAYMENT_FAILED','FREEZE_REQUEST','DOWNGRADE_ASKED')),
  occurred_at   timestamptz not null
);

-- Contactos realizados (auditable; base de la atribución) ----------
create table nudge (
  id             bigserial primary key,
  partner_id     uuid not null references partner(id),
  membership_id  uuid not null references membership(id),
  channel        text not null check (channel in ('PUSH','STAFF')),
  template_code  text,
  decided_reason text not null,                   -- la salida de nudgeDecision(), tal cual
  sent_at        timestamptz not null default now(),
  returned_at    timestamptz,                     -- volvió a entrenar dentro de las 72 h
  control_group  boolean not null default false   -- grupo de control del piloto: no se envía
);

-- Agregados diarios (read model: el panel nunca lee el core) --------
create table daily_location_stats (
  partner_id        uuid not null references partner(id),
  location_id       uuid not null references location(id),
  day               date not null,
  active_members    int not null,
  workouts_started  int not null,
  sets_logged       int not null,
  busy_swaps        int not null,                 -- "¿máquina ocupada? → cambiar ejercicio"
  primary key (location_id, day)
);

-- Auditoría: toda acción de staff GRAVL o del partner queda registrada
create table audit_log (
  id          bigserial primary key,
  actor       text not null,                      -- 'gravl:<email>' | 'partner:<user>'
  partner_id  uuid,
  action      text not null,
  reason      text,
  at          timestamptz not null default now()
);

-- Row-Level Security ------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['location','machine','deal','plan_policy','membership','member_signal','nudge','daily_location_stats']
  loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy partner_isolation on %I using (partner_id = current_setting(''app.partner_id'')::uuid)', t);
  end loop;
end $$;
