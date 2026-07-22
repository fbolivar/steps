# Runbook de endurecimiento para producción — STEPS Seguros

Estado: la app pasa por 4 fases funcionales. Este runbook cubre lo necesario
para exponerla de forma segura.

## 1. Anti-abuso (implementado)

- **Rate limiting** respaldado en BD (`public.rate_limit_hit`, tabla `rate_limits`):
  - Chat `/api/chat`: 12/min y 80/hora por IP → protege el costo de Anthropic.
  - Cotización (server action): 5/min y 20/hora por IP.
  - Backstop dentro de `submit_quote_request` (RPC): 20/hora por IP que ve
    PostgREST → mitiga llamadas directas a `/rest/v1/rpc` con la anon key.
- **Captcha (Cloudflare Turnstile)** en el formulario de cotización, *gated*:
  - Activa con `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`.
  - Sin esas claves el captcha se omite (modo dev). **Actívalo en producción.**
- **Limpieza**: `public.rate_limit_gc()` borra ventanas > 1 día. Prográmalo con
  un cron (Supabase scheduled function o pg_cron) si el volumen lo amerita.

### Pendiente recomendado (defensa en profundidad)
El envío de cotización sigue permitiendo `anon` ejecutar la RPC directamente
(necesario para el sitio público sin service_role). El backstop por IP la
mitiga, pero el cierre completo es: cargar `SUPABASE_SERVICE_ROLE_KEY`, cambiar
el server action para insertar con service_role, y **revocar `EXECUTE` de anon**
sobre `submit_quote_request`. Así el único camino de entrada queda detrás de
rate limit + captcha.

## 2. Credenciales / claves (cargar en el entorno de producción)

| Variable | Para qué | Dónde se obtiene |
|---|---|---|
| `ANTHROPIC_API_KEY` | Chat IA | console.anthropic.com |
| `CHAT_MODEL` (opcional) | Modelo del chat (default opus-4-8; haiku-4-5 = económico) | — |
| `SUPABASE_SERVICE_ROLE_KEY` | Crear/invitar usuarios, notificar al agente | Supabase > Settings > API |
| `RESEND_API_KEY` + `NOTIFY_FROM_EMAIL` | Email al agente | resend.com |
| `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` | Notificación WhatsApp | Meta Cloud API |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | Captcha | dash.cloudflare.com/turnstile |
| `NEXT_PUBLIC_ROOT_DOMAIN` | Dominio raíz de subdominios | ej. stepsseguros.app |

## 3. Usuarios y contraseñas

- El onboarding ahora usa **invitación por correo** (`inviteUserByEmail`): el
  usuario define su propia contraseña. Requiere **SMTP configurado en Supabase**
  (Auth > Email) o el proveedor por defecto.
- Los usuarios de arranque (Fernando, Paula, Agente Demo) se crearon con
  **contraseñas temporales**. Antes de producción:
  1. Configura SMTP en Supabase.
  2. Envía "reset password" a cada uno (Supabase Dashboard > Auth > Users), o
     recréalos vía invitación.
  3. Elimina cualquier contraseña temporal documentada.

## 4. Tenant de prueba `demo`

El tenant `demo` (Demo Seguros) existe para validar aislamiento y multitenant.
Antes de producción, elige uno:
- **Staging**: mantenlo pero en un entorno/proyecto Supabase separado.
- **Producción limpia**: desactívalo (panel `/admin` > editar > Inactivo) o
  bórralo por SQL:
  ```sql
  delete from public.tenants where slug = 'demo'; -- cascada borra sus datos
  -- y elimina su usuario en Auth > Users (agente@demoseguros.co)
  ```

## 5. Despliegue (resumen; ver fase de deploy)

- Vercel: proyecto + variables de entorno (todas las de la sección 2).
- DNS: dominio raíz + **wildcard `*.stepsseguros.app`** para subdominios de
  tenants; dominios custom por tenant apuntando al proyecto.
- Supabase: proyecto `steps-seguros` (ya creado, ref hfdfbgghkbrvhsreatws).
- Revisar `get_advisors` (security/performance) tras cualquier cambio DDL.

## 6. Advisors de Supabase (revisar en el dashboard)

- **Habilitar "Leaked Password Protection"** (Auth > Policies): valida contra
  HaveIBeenPwned. Está deshabilitado por defecto.
- `rate_limit_gc()` ya fue revocada de anon/authenticated (solo cron/servicio).
- Los WARN de "SECURITY DEFINER ejecutable por anon" en `submit_quote_request`,
  `rate_limit_hit` y los helpers de RLS (`is_super_admin`, `has_tenant_*`) son
  **esperados**: deben ser invocables para que RLS y el flujo público funcionen,
  y no filtran datos (solo evalúan `auth.uid()` propio o insertan de forma
  controlada). Correr `get_advisors` tras cada cambio DDL.

## 7. Legal

- Publicar y validar jurídicamente la **política de tratamiento de datos**
  (Ley 1581) antes del primer dato real. La página ya existe en
  `/legal/tratamiento-de-datos` como base para revisión.
