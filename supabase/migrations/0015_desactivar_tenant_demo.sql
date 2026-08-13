-- ============================================================================
-- STEPS SEGUROS · Retirar el tenant `demo` de la superficie pública
-- Migración 0015
--
-- `demo` (Demo Seguros) se creó para validar el aislamiento multitenant y la
-- resolución por host. No debe ser alcanzable en producción.
--
-- POR QUÉ DESACTIVAR Y NO BORRAR
-- ------------------------------
-- Borrarlo (`delete from tenants where slug = 'demo'`) arrastra en cascada sus
-- cotizaciones, agentes, líneas y membresías — y con ellas **la suite de
-- aislamiento**: `supabase/tests/rls_isolation.sql` necesita dos tenants reales
-- para probar que uno no ve al otro. Sin `demo`, la suite aborta con "faltan los
-- tenants steps/demo" y el proyecto se queda sin la prueba que detectó la
-- escalada de privilegios de la migración 0014.
--
-- Desactivarlo consigue el objetivo —que no se sirva a nadie— sin perder el
-- banco de pruebas, y es reversible con un update.
--
-- QUÉ IMPLICA `is_active = false`
-- -------------------------------
-- La política `tenants_public_read` es `(is_active or has_tenant_access(id))`:
-- un visitante anónimo deja de poder leer la fila, así que la resolución por
-- host de `demo.<dominio>` no encuentra tenant y no se sirve el sitio. Los
-- miembros del tenant sí lo siguen viendo, que es lo que permite seguir
-- probando.
--
-- SI SE QUIERE BORRAR DE VERDAD (decisión del cliente, no técnica)
-- ---------------------------------------------------------------
--   delete from public.tenants where slug = 'demo';   -- cascada
--   -- y eliminar su usuario en Auth > Users (agente@demoseguros.co)
-- Antes de hacerlo hay que decidir con qué se prueba el aislamiento: lo natural
-- es crear un tenant de pruebas en un proyecto Supabase aparte.
--
-- Idempotente: el `where` la deja sin efecto si ya está desactivado.
-- ============================================================================

update public.tenants
   set is_active = false
 where slug = 'demo'
   and is_active;
