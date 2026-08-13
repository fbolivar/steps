-- ============================================================================
-- STEPS SEGUROS · Pruebas de aislamiento multitenant (RLS)
-- ----------------------------------------------------------------------------
-- Qué prueba: que un usuario de un tenant NO pueda leer ni tocar datos de otro,
-- y que `anon` (la clave pública que viaja en el navegador) no pueda leer
-- ninguna cotización de ningún tenant.
--
-- Cómo funciona: no necesita contraseñas ni sesiones reales. Suplanta a un
-- usuario poniendo su `sub` en `request.jwt.claims` y cambiando a rol
-- `authenticated`, que es exactamente lo que hace PostgREST cuando llega una
-- petición con un JWT. A partir de ahí las políticas RLS se evalúan igual que
-- en producción. Como `postgres` es dueño de las tablas, RLS NO aplica: el
-- `set role` es imprescindible, sin él todas las pruebas pasarían en falso.
--
-- Seguridad: todo corre dentro de una transacción que termina en ROLLBACK.
-- Ninguna prueba deja rastro, ni siquiera las que escriben (escalada de
-- privilegios). Es seguro ejecutarlo contra producción.
--
-- Cómo ejecutarlo:
--   psql "$SUPABASE_DB_URL" -f supabase/tests/rls_isolation.sql
-- (SUPABASE_DB_URL = Dashboard > Project Settings > Database > Connection
--  string, modo "Session". Requiere la contraseña de la base, no el service
--  role.) También se puede pegar entero en el SQL Editor del Dashboard.
--
-- Cómo se lee el resultado: cada prueba imprime `ok   ...`. La primera que
-- falla lanza una excepción con el prefijo `FUGA:` o `FALLO:` y aborta el
-- script — no hay resúmenes que haya que interpretar.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Identidades bajo prueba. Se resuelven por correo/slug, no por UUID fijo: los
-- UUID cambian si alguien recrea la base y un test con UUID muerto pasa vacío.
-- ---------------------------------------------------------------------------
do $$
declare
  v_steps uuid; v_demo uuid; v_u_steps uuid; v_u_demo uuid;
begin
  select id into v_steps from public.tenants where slug = 'steps';
  select id into v_demo  from public.tenants where slug = 'demo';
  select id into v_u_steps from auth.users where email = 'stepsseguros@gmail.com';
  select id into v_u_demo  from auth.users where email = 'agente@demoseguros.co';

  if v_steps is null or v_demo is null then
    raise exception 'FALLO: faltan los tenants steps/demo; no hay nada que aislar';
  end if;
  if v_u_steps is null or v_u_demo is null then
    raise exception 'FALLO: faltan los usuarios de prueba (steps=%, demo=%)', v_u_steps, v_u_demo;
  end if;

  perform set_config('test.tenant_steps', v_steps::text, false);
  perform set_config('test.tenant_demo',  v_demo::text,  false);
  perform set_config('test.user_steps',   v_u_steps::text, false);
  perform set_config('test.user_demo',    v_u_demo::text,  false);
end $$;

-- Afirmación reutilizable: cuenta filas del tenant ajeno y explota si hay alguna.
create or replace function pg_temp.assert_sin_fugas(p_tabla text, p_tenant_ajeno uuid, p_quien text)
returns void language plpgsql as $$
declare n integer;
begin
  execute format('select count(*) from public.%I where tenant_id = $1', p_tabla)
    into n using p_tenant_ajeno;
  if n <> 0 then
    raise exception 'FUGA: % ve % fila(s) de %s ajenas en public.%', p_quien, n, p_tabla;
  end if;
  raise notice 'ok   % no ve ninguna fila ajena en public.%', p_quien, p_tabla;
end $$;

-- ===========================================================================
-- CASO 1 · Usuario del tenant DEMO mirando datos de STEPS
-- ===========================================================================
select set_config(
  'request.jwt.claims',
  json_build_object('sub', current_setting('test.user_demo'), 'role', 'authenticated')::text,
  false
);
set role authenticated;

do $$
declare v_steps uuid := current_setting('test.tenant_steps')::uuid;
begin
  if auth.uid()::text <> current_setting('test.user_demo') then
    raise exception 'FALLO: la suplantación no funcionó (auth.uid()=%)', auth.uid();
  end if;

  perform pg_temp.assert_sin_fugas('quote_requests',  v_steps, 'usuario demo');
  perform pg_temp.assert_sin_fugas('agents',          v_steps, 'usuario demo');
  perform pg_temp.assert_sin_fugas('tenant_members',  v_steps, 'usuario demo');
end $$;

-- Las funciones SECURITY DEFINER son el único puente entre tenants: si mienten,
-- todas las políticas de arriba mienten con ellas.
do $$
declare v_steps uuid := current_setting('test.tenant_steps')::uuid;
begin
  if public.is_super_admin() then
    raise exception 'FUGA: el usuario demo se identifica como super_admin de la plataforma';
  end if;
  if public.has_tenant_access(v_steps) then
    raise exception 'FUGA: has_tenant_access() concede a demo acceso al tenant steps';
  end if;
  if public.has_tenant_role(v_steps, array['tenant_admin','agente']::app_role[]) then
    raise exception 'FUGA: has_tenant_role() concede a demo un rol dentro de steps';
  end if;
  raise notice 'ok   las funciones SECURITY DEFINER no conceden nada de steps al usuario demo';
end $$;

-- El catálogo activo (insurance_lines) es público a propósito: lo pinta el sitio
-- de marketing sin sesión. Lo que NO debe verse es lo despublicado de otro tenant.
do $$
declare n integer; v_steps uuid := current_setting('test.tenant_steps')::uuid;
begin
  select count(*) into n from public.insurance_lines
    where tenant_id = v_steps and not is_active;
  if n <> 0 then
    raise exception 'FUGA: el usuario demo ve % línea(s) despublicada(s) de steps', n;
  end if;
  raise notice 'ok   el usuario demo no ve líneas despublicadas de steps (las activas son públicas por diseño)';
end $$;

reset role;

-- ===========================================================================
-- CASO 2 · Usuario del tenant STEPS mirando datos de DEMO (simetría)
-- ===========================================================================
-- Se prueba el sentido contrario a propósito: una política mal escrita puede
-- aislar en una dirección y no en la otra.
select set_config(
  'request.jwt.claims',
  json_build_object('sub', current_setting('test.user_steps'), 'role', 'authenticated')::text,
  false
);
set role authenticated;

do $$
declare v_demo uuid := current_setting('test.tenant_demo')::uuid;
begin
  perform pg_temp.assert_sin_fugas('quote_requests', v_demo, 'usuario steps');
  perform pg_temp.assert_sin_fugas('agents',         v_demo, 'usuario steps');
  perform pg_temp.assert_sin_fugas('tenant_members', v_demo, 'usuario steps');
end $$;

reset role;

-- ===========================================================================
-- CASO 3 · `anon` — la clave que viaja en el navegador de cualquier visitante
-- ===========================================================================
-- Requisito duro del proyecto: ningún dato de cotización puede llegar al
-- cliente final. Esta es la prueba que lo respalda.
select set_config('request.jwt.claims', json_build_object('role', 'anon')::text, false);
set role anon;

do $$
declare n integer;
begin
  begin
    select count(*) into n from public.quote_requests;
  exception when insufficient_privilege then
    n := 0;  -- sin GRANT ni llega a RLS: también es aislamiento válido
  end;
  if n <> 0 then
    raise exception 'FUGA CRÍTICA: anon lee % cotización(es)', n;
  end if;
  raise notice 'ok   anon no lee ninguna cotización de ningún tenant';

  begin
    select count(*) into n from public.agents;
  exception when insufficient_privilege then n := 0; end;
  if n <> 0 then
    raise exception 'FUGA: anon lee % fila(s) de public.agents', n;
  end if;

  begin
    select count(*) into n from public.tenant_members;
  exception when insufficient_privilege then n := 0; end;
  if n <> 0 then
    raise exception 'FUGA: anon lee % fila(s) de public.tenant_members', n;
  end if;
  raise notice 'ok   anon no lee agents ni tenant_members';

  -- El tenant `demo` está desactivado (migración 0015). `tenants_public_read` es
  -- `(is_active or has_tenant_access(id))`, así que un visitante no debe poder
  -- resolverlo: sin fila, `demo.<dominio>` no sirve sitio alguno.
  select count(*) into n from public.tenants where slug = 'demo';
  if n <> 0 then
    raise exception 'FALLO: anon todavía resuelve el tenant demo; sigue expuesto en producción';
  end if;
  raise notice 'ok   anon no resuelve el tenant demo (desactivado)';
end $$;

reset role;

-- ===========================================================================
-- CASO 4 · Escalada de privilegios desde tenant_admin
-- ===========================================================================
-- Un tenant_admin manda dentro de su tenant. La pregunta es si puede usar ese
-- poder para reescribir su propia membresía y convertirse en super_admin de la
-- plataforma, que es lo que abre TODOS los tenants (is_super_admin() no mira
-- el tenant, solo si existe alguna fila con role='super_admin').
select set_config(
  'request.jwt.claims',
  json_build_object('sub', current_setting('test.user_demo'), 'role', 'authenticated')::text,
  false
);
set role authenticated;

do $$
declare n integer;
begin
  -- 4a · Auto-promoción: el vector original (cerrado en la migración 0014).
  begin
    update public.tenant_members
       set role = 'super_admin'
     where user_id = auth.uid();
    get diagnostics n = row_count;
  exception when insufficient_privilege or check_violation then
    n := 0;
  end;
  if n <> 0 then
    raise exception 'FUGA: un tenant_admin de demo se auto-promovió a super_admin (% fila[s]); con eso lee todos los tenants', n;
  end if;
  raise notice 'ok   un tenant_admin no puede auto-promoverse a super_admin';

  -- 4b · Auto-edición: ni siquiera a un rol permitido. Un admin gestiona a los
  -- demás, no a sí mismo; si puede degradarse también puede maquillar su rastro.
  begin
    update public.tenant_members
       set role = 'agente'
     where user_id = auth.uid();
    get diagnostics n = row_count;
  exception when insufficient_privilege or check_violation then
    n := 0;
  end;
  if n <> 0 then
    raise exception 'FUGA: un tenant_admin editó su propia membresía (% fila[s])', n;
  end if;
  raise notice 'ok   un tenant_admin no puede editar su propia membresía';
end $$;

reset role;

-- ===========================================================================
-- CASO 5 · La gestión legítima de roles NO se rompió
-- ===========================================================================
-- Un fix de RLS que cierra el agujero cerrando también la puerta de al lado es
-- un fix a medias: se rompe en producción y alguien lo revierte entero. Estas
-- pruebas fijan lo que SÍ debe seguir funcionando.
--
-- El tenant demo tiene un solo miembro, así que se le añade uno temporal para
-- tener a quién gestionar. Se inserta como `postgres` (fuera de RLS, igual que
-- hace la app con el cliente service-role) y desaparece en el ROLLBACK.
insert into public.tenant_members (tenant_id, user_id, role)
values (
  current_setting('test.tenant_demo')::uuid,
  current_setting('test.user_steps')::uuid,
  'agente'
);

set role authenticated;

do $$
declare n integer; v_otro uuid := current_setting('test.user_steps')::uuid;
begin
  -- 5a · Operación legítima: cambiar el rol de OTRO miembro del propio tenant.
  update public.tenant_members
     set role = 'editor_contenido'
   where user_id = v_otro
     and tenant_id = current_setting('test.tenant_demo')::uuid;
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'FALLO: el fix rompió la gestión legítima de roles (% fila[s] afectada[s], se esperaba 1)', n;
  end if;
  raise notice 'ok   un tenant_admin sigue gestionando los roles de su tenant';

  -- 5b · Lo que no puede es promover a OTRO a super_admin: sería la misma fuga
  -- con un cómplice.
  begin
    update public.tenant_members
       set role = 'super_admin'
     where user_id = v_otro
       and tenant_id = current_setting('test.tenant_demo')::uuid;
    get diagnostics n = row_count;
  exception when insufficient_privilege or check_violation then
    n := 0;
  end;
  if n <> 0 then
    raise exception 'FUGA: un tenant_admin promovió a otro miembro a super_admin (% fila[s])', n;
  end if;
  raise notice 'ok   un tenant_admin no puede promover a nadie a super_admin';
end $$;

reset role;

-- Nada de lo anterior se persiste.
rollback;
