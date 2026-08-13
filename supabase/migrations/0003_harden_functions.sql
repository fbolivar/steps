-- ============================================================================
-- STEPS SEGUROS · Endurecer funciones (search_path fijo)
-- Migración 0003
--
-- Recuperada del estado de producción: se había aplicado a la base sin quedar
-- versionada en el repositorio (ver supabase/migrations/README.md).
--
-- Por qué importa: una función sin `search_path` fijo resuelve los nombres de
-- tabla con el search_path de quien la llama. En una función `security definer`
-- eso permite que un esquema controlado por el atacante secuestre a qué tabla
-- apunta realmente `tenants` o `quote_requests`. Todas las demás funciones ya
-- nacen con `set search_path = public` en la migración 0001; `set_updated_at`
-- se quedó fuera.
--
-- Idempotente: `create or replace` sobre la misma firma.
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
