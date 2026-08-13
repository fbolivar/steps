# Migraciones

Orden de aplicación = orden alfabético del nombre de archivo.

## Mapeo con lo aplicado en producción

La base registra cada migración en `supabase_migrations.schema_migrations` con
un `version` (timestamp) y un `name` que **no coinciden con el nombre de archivo**
de este directorio, porque aquí se numeran a mano. Esta tabla es el puente:

| Archivo | `name` registrado en la base | Aplicada |
|---|---|---|
| `0001_multitenant_foundation.sql` | `multitenant_foundation` | 2026-07-22 |
| `0002_seed_steps_tenant.sql` | `seed_steps_tenant` | 2026-07-22 |
| `0003_harden_functions.sql` | `harden_functions` | 2026-07-22 |
| `0004_rate_limiting.sql` | `rate_limiting` | 2026-07-22 |
| *(sin archivo propio)* | `quote_round_robin_assignment` | 2026-07-22 |
| `0005_quote_signed_requests.sql` | `quote_signed_requests` | 2026-07-22 |
| `0006_security_fixes.sql` | `security_fixes_backstop_and_tenant_config` | 2026-07-22 |
| `0007_quote_signature_bind_payload.sql` | `quote_signature_bind_payload` | 2026-07-22 |
| `0008_brand_manual_colors.sql` | `brand_manual_colors` | 2026-08-05 |
| `0009_remove_discapacidad_line.sql` | `remove_discapacidad_line` | 2026-08-13 |
| `0010_rename_cenal_a_decenal.sql` | `rename_cenal_a_decenal` | 2026-08-13 |
| `0011_add_salud_internacional.sql` | `add_salud_internacional` | 2026-08-13 |
| `0012_add_gestion_patrimonial.sql` | `add_gestion_patrimonial` | 2026-08-13 |
| `0013_line_highlights.sql` | `add_line_highlights` | 2026-08-13 |
| `0014_fix_escalada_super_admin.sql` | `fix_escalada_super_admin` | 2026-08-13 |
| `0015_desactivar_tenant_demo.sql` | `desactivar_tenant_demo` | 2026-08-13 |

### Sobre `quote_round_robin_assignment`

No tiene archivo propio **a propósito**. Lo que hizo fue añadir la asignación
automática de agente dentro de `submit_quote_request`, y esa función se
reescribe entera —asignación incluida— en las migraciones 0005, 0006 y 0007.
Recrear la base desde este directorio reproduce el comportamiento; un archivo
0004b con la versión intermedia solo añadiría una definición que las siguientes
sobrescriben.

## Verificar que no falta nada

Este desfase (objetos vivos en producción sin archivo que los cree) es silencioso:
todo funciona hasta que alguien recrea la base. Para comprobarlo, compara los
objetos de la base con lo que crean los archivos:

```sql
-- Tablas y funciones que existen en producción
select table_name from information_schema.tables where table_schema = 'public'
union all
select p.proname from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public';
```

```sh
# Cada nombre del resultado debe aparecer creado en algún archivo
grep -rn "create table\|create or replace function" supabase/migrations/
```

## Convenciones

- **Idempotentes siempre**: `create table if not exists`, `create or replace
  function`, `add column if not exists`, `on conflict do update` en los seeds.
  Una migración debe poder reaplicarse sin romper.
- **Un cambio, una migración**, con encabezado que explique *por qué*, no solo qué.
- **Nunca editar una migración ya aplicada**: crear una nueva que corrija.
- Las migraciones de datos (catálogo, colores, correos) valen tanto como las de
  esquema: sin ellas, una base recreada arranca con contenido equivocado.
