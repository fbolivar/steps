-- ============================================================================
-- STEPS SEGUROS · Cierre de la escalada tenant_admin → super_admin
-- Migración 0014
--
-- EL FALLO
-- --------
-- `members_admin_write` era una política `FOR ALL` con
--     using (has_tenant_role(tenant_id, array['tenant_admin']))
-- y **sin `with check` propio**. Cuando falta el `with check`, Postgres reutiliza
-- el `using` para validar la fila resultante — y ese `using` solo pregunta
-- "¿mandas en este tenant?", nunca "¿a qué rol la estás cambiando?". La fila
-- modificada sigue perteneciendo al mismo tenant, así que pasaba el filtro:
--
--     update tenant_members set role = 'super_admin' where user_id = auth.uid();
--     -- UPDATE 1
--
-- Por qué era grave: `is_super_admin()` NO mira el tenant, le basta una fila con
-- ese rol en cualquiera de ellos; y `has_tenant_access()` / `has_tenant_role()`
-- empiezan las dos con `is_super_admin() or ...`. El rol se escribía dentro de un
-- tenant pero se leía a nivel de plataforma: quien se auto-promoviera quedaba con
-- lectura y escritura sobre TODOS los tenants, cotizaciones incluidas.
--
-- EL ARREGLO
-- ----------
-- Se sustituye el `FOR ALL` por políticas separadas por operación, cada una con
-- su `with check` explícito. Tres invariantes, iguales en todas:
--
--   1. `super_admin` no se escribe desde aquí salvo que YA seas super_admin.
--      Es un rol de plataforma; no debe poder nacer dentro de un tenant.
--   2. Nadie toca su propia membresía (`user_id <> auth.uid()`), ni siquiera
--      para un cambio permitido. Un admin gestiona a los demás, no a sí mismo.
--   3. Sigue funcionando la gestión legítima: un tenant_admin puede dar de alta,
--      cambiar entre agente/editor_contenido/tenant_admin y quitar a OTROS
--      miembros de SU tenant.
--
-- Se separa el UPDATE en dos políticas permisivas (se combinan con OR) para poder
-- expresar "el resultado puede ser super_admin solo si la fila YA lo era", que en
-- una sola política no se puede: `with check` ve la fila nueva, nunca la vieja.
-- La segunda política exige `is_super_admin()`, de modo que un tenant_admin nunca
-- la satisface y el vector queda cerrado.
--
-- Nota de compatibilidad: ninguna ruta de la aplicación escribe en esta tabla con
-- la sesión del usuario. `src/features/admin/services/actions.ts:82` y
-- `agent-actions.ts:68` usan el cliente service-role, que se salta RLS. Esta
-- migración no rompe ningún flujo existente.
--
-- Este es el arreglo mínimo (opción 1). El endurecimiento de fondo —sacar
-- `super_admin` a su propia tabla, sin escritura por API— queda en backlog y es
-- compatible con esto. Ver AUDITORIA_FASES_2_3_4.md §7.6.
--
-- Idempotente: `drop policy if exists` antes de cada `create policy`.
-- ============================================================================

drop policy if exists members_admin_write  on public.tenant_members;
drop policy if exists members_admin_insert on public.tenant_members;
drop policy if exists members_admin_update on public.tenant_members;
drop policy if exists members_super_update on public.tenant_members;
drop policy if exists members_admin_delete on public.tenant_members;

-- ALTA de un miembro -------------------------------------------------------
-- `or public.is_super_admin()` deja que un super_admin nombre a otro; a un
-- tenant_admin la condición le resulta falsa y no puede crear super_admins.
create policy members_admin_insert on public.tenant_members
for insert
with check (
  public.has_tenant_role(tenant_id, array['tenant_admin']::public.app_role[])
  and tenant_members.user_id <> auth.uid()
  and (tenant_members.role <> 'super_admin' or public.is_super_admin())
);

-- CAMBIO de rol dentro del tenant ------------------------------------------
-- `using` acota qué filas se pueden tocar (nunca una super_admin, nunca la
-- propia); `with check` acota en qué se pueden convertir (nunca super_admin).
create policy members_admin_update on public.tenant_members
for update
using (
  public.has_tenant_role(tenant_id, array['tenant_admin']::public.app_role[])
  and tenant_members.user_id <> auth.uid()
  and tenant_members.role <> 'super_admin'
)
with check (
  public.has_tenant_role(tenant_id, array['tenant_admin']::public.app_role[])
  and tenant_members.user_id <> auth.uid()
  and tenant_members.role <> 'super_admin'
);

-- Mantenimiento de filas que YA son super_admin ----------------------------
-- Permite a un super_admin editarlas (p. ej. desactivar `is_active`) y nombrar
-- otro super_admin, que es lo que la política anterior deja fuera. Un
-- tenant_admin no la satisface nunca porque `is_super_admin()` le da false.
create policy members_super_update on public.tenant_members
for update
using (
  public.is_super_admin()
  and tenant_members.role = 'super_admin'
  and tenant_members.user_id <> auth.uid()
)
with check (
  public.is_super_admin()
  and tenant_members.role = 'super_admin'
  and tenant_members.user_id <> auth.uid()
);

-- BAJA de un miembro -------------------------------------------------------
-- Un tenant_admin no puede borrar la membresía de un super_admin: no escalaría
-- privilegios, pero dejaría a la plataforma sin administrador desde dentro de un
-- tenant. Tampoco puede borrarse a sí mismo.
create policy members_admin_delete on public.tenant_members
for delete
using (
  public.has_tenant_role(tenant_id, array['tenant_admin']::public.app_role[])
  and tenant_members.user_id <> auth.uid()
  and (tenant_members.role <> 'super_admin' or public.is_super_admin())
);
