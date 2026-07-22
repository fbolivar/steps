-- ============================================================================
-- STEPS SEGUROS · Fundación multitenant (marca blanca)
-- Migración 0001 — modelo de datos + Row Level Security
-- ----------------------------------------------------------------------------
-- Principio de aislamiento: cada tabla de negocio lleva tenant_id y el acceso
-- se decide por MEMBRESÍA (tenant_members), no por una variable de sesión que
-- pudiera falsificarse. El middleware de Next.js resuelve QUÉ tenant se muestra
-- por dominio/subdominio; RLS garantiza que un usuario JAMÁS lea datos de un
-- tenant al que no pertenece.
-- ============================================================================

-- 1. TIPOS -------------------------------------------------------------------
create type public.app_role as enum (
  'super_admin',      -- STEPS: administra TODOS los tenants
  'tenant_admin',     -- administra su propio tenant
  'agente',           -- recibe y gestiona cotizaciones
  'editor_contenido'  -- solo textos/imágenes del sitio informativo
);

create type public.quote_status as enum (
  'nueva', 'contactado', 'en_negociacion', 'emitida', 'perdida'
);

create type public.insurance_segment as enum ('personas', 'empresas');

-- 2. UTILIDAD: updated_at ----------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3. TABLAS ------------------------------------------------------------------

-- tenants: cada agencia/intermediario que "renta" la plataforma
create table public.tenants (
  id                       uuid primary key default gen_random_uuid(),
  slug                     text not null unique,
  nombre_comercial         text not null,
  razon_social             text,
  nit                      text,
  logo_url                 text,
  color_primary            text not null default '#1A1F4E',
  color_secondary          text not null default '#2A3170',
  color_accent             text not null default '#A8C5A8',
  custom_domain            text unique,   -- ej. cotiza.otraagencia.com
  subdomain                text unique,   -- ej. otraagencia (=> otraagencia.stepsseguros.app)
  whatsapp_number          text,
  contact_email            text,
  address                  text,
  uses_shared_quote_engine boolean not null default true,
  is_active                boolean not null default true,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create trigger trg_tenants_updated before update on public.tenants
  for each row execute function public.set_updated_at();

-- profiles ("users"): 1:1 con auth.users
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text,
  phone      text,
  created_at timestamptz not null default now()
);

-- tenant_members ("roles"): qué usuario pertenece a qué tenant y con qué rol
create table public.tenant_members (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.app_role not null default 'agente',
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);
create index idx_tenant_members_user on public.tenant_members(user_id);
create index idx_tenant_members_tenant on public.tenant_members(tenant_id);

-- agents: datos de enrutamiento del agente dentro de un tenant
create table public.agents (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenants(id) on delete cascade,
  user_id            uuid not null references auth.users(id) on delete cascade,
  display_name       text,
  whatsapp_number    text,
  email              text,
  is_accepting_leads boolean not null default true,
  active_leads_count integer not null default 0,
  created_at         timestamptz not null default now(),
  unique (tenant_id, user_id)
);
create index idx_agents_tenant on public.agents(tenant_id);

-- insurance_lines: catálogo CMS-lite de líneas de producto (un template param.)
create table public.insurance_lines (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,
  slug              text not null,
  segment           public.insurance_segment not null,
  name              text not null,
  short_description text,
  body_mdx          text,
  icon              text,
  sort_order        integer not null default 0,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (tenant_id, slug)
);
create index idx_lines_tenant_segment on public.insurance_lines(tenant_id, segment);
create trigger trg_lines_updated before update on public.insurance_lines
  for each row execute function public.set_updated_at();

-- quote_requests: solicitudes de cotización.
-- quote_result NUNCA es visible para el cliente final ni para anon; solo
-- agentes/admins del tenant autenticados (ver políticas RLS más abajo).
create table public.quote_requests (
  id                      uuid primary key default gen_random_uuid(),
  tenant_id               uuid not null references public.tenants(id) on delete cascade,
  insurance_line_id       uuid references public.insurance_lines(id) on delete set null,
  segment                 public.insurance_segment,
  -- datos del cliente final (SENSIBLES · Ley 1581 de 2012 Habeas Data)
  contact_name            text not null,
  contact_document        text,
  contact_email           text,
  contact_phone           text,
  -- datos del riesgo a asegurar (flexible por línea)
  risk_payload            jsonb not null default '{}'::jsonb,
  -- resultado interno (NUNCA se expone al cliente)
  provider                text,          -- 'agentemotor_api' | 'manual' | 'rpa'
  provider_reference      text,
  quote_result            jsonb,
  status                  public.quote_status not null default 'nueva',
  assigned_agent_id       uuid references public.agents(id) on delete set null,
  consent_data_processing boolean not null default false,
  consent_timestamp       timestamptz,
  source                  text not null default 'web_form',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index idx_quotes_tenant_status on public.quote_requests(tenant_id, status);
create index idx_quotes_assigned on public.quote_requests(assigned_agent_id);
create trigger trg_quotes_updated before update on public.quote_requests
  for each row execute function public.set_updated_at();

-- 4. HELPERS DE AUTORIZACIÓN (SECURITY DEFINER: evitan recursión en RLS) ------

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.tenant_members m
    where m.user_id = auth.uid() and m.role = 'super_admin' and m.is_active
  );
$$;

create or replace function public.has_tenant_access(p_tenant uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_super_admin() or exists (
    select 1 from public.tenant_members m
    where m.user_id = auth.uid() and m.tenant_id = p_tenant and m.is_active
  );
$$;

create or replace function public.has_tenant_role(p_tenant uuid, p_roles public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_super_admin() or exists (
    select 1 from public.tenant_members m
    where m.user_id = auth.uid() and m.tenant_id = p_tenant
      and m.is_active and m.role = any(p_roles)
  );
$$;

-- 5. TRIGGER: crear profile al registrarse un usuario -------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. RLS ---------------------------------------------------------------------
alter table public.tenants         enable row level security;
alter table public.profiles        enable row level security;
alter table public.tenant_members  enable row level security;
alter table public.agents          enable row level security;
alter table public.insurance_lines enable row level security;
alter table public.quote_requests  enable row level security;

-- tenants: branding público legible (logo, colores, datos de agencia);
-- solo super_admin escribe.
create policy tenants_public_read on public.tenants
  for select using (is_active or public.has_tenant_access(id));
create policy tenants_super_write on public.tenants
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- profiles: cada quien ve/edita el suyo; super_admin ve todo.
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid() or public.is_super_admin());
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- tenant_members: visibles para miembros del mismo tenant; administra
-- tenant_admin (de ese tenant) o super_admin.
create policy members_read on public.tenant_members
  for select using (public.has_tenant_access(tenant_id));
create policy members_admin_write on public.tenant_members
  for all using (public.has_tenant_role(tenant_id, array['tenant_admin']::public.app_role[]))
  with check (public.has_tenant_role(tenant_id, array['tenant_admin']::public.app_role[]));

-- agents: legibles por miembros del tenant; escribe tenant_admin/super_admin.
create policy agents_read on public.agents
  for select using (public.has_tenant_access(tenant_id));
create policy agents_admin_write on public.agents
  for all using (public.has_tenant_role(tenant_id, array['tenant_admin']::public.app_role[]))
  with check (public.has_tenant_role(tenant_id, array['tenant_admin']::public.app_role[]));

-- insurance_lines: catálogo público (sitio informativo) cuando is_active;
-- escribe tenant_admin o editor_contenido de ese tenant.
create policy lines_public_read on public.insurance_lines
  for select using (is_active or public.has_tenant_access(tenant_id));
create policy lines_editor_write on public.insurance_lines
  for all using (public.has_tenant_role(tenant_id, array['tenant_admin','editor_contenido']::public.app_role[]))
  with check (public.has_tenant_role(tenant_id, array['tenant_admin','editor_contenido']::public.app_role[]));

-- quote_requests: EL CONTROL CRÍTICO.
-- · Sin política para anon => el cliente final NUNCA puede SELECT (ni el result).
-- · Solo agentes/tenant_admin/super_admin del tenant leen y gestionan.
-- · editor_contenido NO ve cotizaciones.
-- · La creación pública se hace vía RPC submit_quote_request (abajo), no por
--   INSERT directo, para no exponer columnas internas.
create policy quotes_agent_read on public.quote_requests
  for select using (
    public.has_tenant_role(tenant_id, array['agente','tenant_admin']::public.app_role[])
  );
create policy quotes_agent_update on public.quote_requests
  for update using (
    public.has_tenant_role(tenant_id, array['agente','tenant_admin']::public.app_role[])
  ) with check (
    public.has_tenant_role(tenant_id, array['agente','tenant_admin']::public.app_role[])
  );

-- 7. RPC PÚBLICA DE ENVÍO DE COTIZACIÓN --------------------------------------
-- Único camino por el que anon puede crear una solicitud. Acepta SOLO campos
-- del cliente, exige consentimiento (Ley 1581) y jamás devuelve el resultado:
-- retorna únicamente el id de la solicitud creada.
create or replace function public.submit_quote_request(
  p_tenant_slug        text,
  p_segment            public.insurance_segment,
  p_insurance_line_slug text,
  p_contact_name       text,
  p_contact_document   text,
  p_contact_email      text,
  p_contact_phone      text,
  p_risk_payload       jsonb,
  p_consent            boolean
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_tenant uuid;
  v_line   uuid;
  v_id     uuid;
begin
  if p_consent is not true then
    raise exception 'Se requiere el consentimiento de tratamiento de datos (Ley 1581 de 2012)';
  end if;
  if coalesce(trim(p_contact_name), '') = '' then
    raise exception 'El nombre de contacto es obligatorio';
  end if;

  select id into v_tenant from public.tenants where slug = p_tenant_slug and is_active;
  if v_tenant is null then
    raise exception 'Tenant no encontrado o inactivo';
  end if;

  select id into v_line from public.insurance_lines
    where tenant_id = v_tenant and slug = p_insurance_line_slug;

  insert into public.quote_requests (
    tenant_id, insurance_line_id, segment, contact_name, contact_document,
    contact_email, contact_phone, risk_payload, consent_data_processing,
    consent_timestamp, status, source
  ) values (
    v_tenant, v_line, p_segment, p_contact_name, p_contact_document,
    p_contact_email, p_contact_phone, coalesce(p_risk_payload, '{}'::jsonb), true,
    now(), 'nueva', 'web_form'
  ) returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_quote_request(
  text, public.insurance_segment, text, text, text, text, text, jsonb, boolean
) from public;
grant execute on function public.submit_quote_request(
  text, public.insurance_segment, text, text, text, text, text, jsonb, boolean
) to anon, authenticated;
