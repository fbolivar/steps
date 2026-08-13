-- ============================================================================
-- STEPS SEGUROS · Rate limiting por ventana fija
-- Migración 0004
--
-- Recuperada del estado de producción: se había aplicado a la base sin quedar
-- versionada en el repositorio (ver supabase/migrations/README.md).
--
-- ⚠️ Esta migración es un PRERREQUISITO de la 0005: `submit_quote_request`
-- llama a `public.rate_limit_hit(...)`. Sin ella, aplicar el repositorio desde
-- cero deja el cotizador público sin ningún control de abuso.
--
-- De ella dependen también, en caliente:
--   · el formulario de cotización y el de contacto (src/shared/lib/rate-limit.ts)
--   · el endpoint del chat con IA  (src/app/api/chat/route.ts)
--
-- Diseño: ventana fija, no deslizante. Es menos preciso en los bordes pero
-- cuesta una sola fila por (bucket, identificador, ventana) y no requiere
-- barrido de histórico para contar. Suficiente para frenar abuso de formularios.
-- ============================================================================

-- 1. Contador ---------------------------------------------------------------
-- Sin columna id: la clave primaria compuesta ES la identidad de la ventana, y
-- es lo que permite que el contador suba con un solo INSERT ... ON CONFLICT.
create table if not exists public.rate_limits (
  bucket       text        not null,
  identifier   text        not null,
  window_start timestamptz not null,
  count        integer     not null default 0,
  primary key (bucket, identifier, window_start)
);

-- RLS activo y SIN políticas, a propósito: nadie llega a esta tabla por la API
-- REST. El único acceso es a través de rate_limit_hit(), que es `security
-- definer` y por tanto pasa por encima de RLS de forma controlada.
alter table public.rate_limits enable row level security;

-- 2. Registrar un intento ----------------------------------------------------
-- Devuelve true si la petición está DENTRO del límite (debe permitirse).
create or replace function public.rate_limit_hit(
  p_bucket         text,
  p_identifier     text,
  p_max            integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_window timestamptz; v_count integer;
begin
  if p_identifier is null or p_identifier = '' then
    return true; -- sin identificador no limitamos (evita falsos positivos)
  end if;

  -- Inicio de la ventana actual, truncado al múltiplo de p_window_seconds.
  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into public.rate_limits (bucket, identifier, window_start, count)
  values (p_bucket, p_identifier, v_window, 1)
  on conflict (bucket, identifier, window_start)
  do update set count = public.rate_limits.count + 1
  returning count into v_count;

  return v_count <= p_max;
end;
$$;

-- 3. Limpieza ----------------------------------------------------------------
-- Las ventanas viejas no se consultan nunca; sin esto la tabla crece sin fin.
-- No se auto-ejecuta: conviene programarla (pg_cron o tarea externa).
create or replace function public.rate_limit_gc()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.rate_limits where window_start < now() - interval '1 day';
$$;
