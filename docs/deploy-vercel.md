# Despliegue en Vercel — STEPS Seguros

Ruta recomendada: **importar el repo de GitHub en Vercel** (auto-deploy en cada
push + variables de entorno en el panel). El proyecto ya está en
`https://github.com/fbolivar/steps`.

## 1. Importar el proyecto
1. Entra a https://vercel.com/new
2. **Import Git Repository** → elige `fbolivar/steps`.
3. Framework: **Next.js** (auto-detectado). No cambies build/output.
4. Antes de "Deploy", abre **Environment Variables** y agrega las de la sección 2.
5. Deploy.

## 2. Variables de entorno (Project → Settings → Environment Variables)

> Marca todas para **Production** (y Preview si quieres previews funcionales).
> Las `NEXT_PUBLIC_*` se necesitan **en build** (se inyectan al bundle); si las
> agregas después, hay que **redeployar**.

### Requeridas (el sitio no funciona sin ellas)
| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hfdfbgghkbrvhsreatws.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_yCfwwh-3-rw8nItXuHtYUw_QF0IA7d9` (publishable, no secreta) |
| `NEXT_PUBLIC_SITE_URL` | `https://TU_DOMINIO` (ej. `https://stepsseguros.app`) |
| `NEXT_PUBLIC_DEFAULT_TENANT` | `steps` |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `stepsseguros.app` (tu dominio raíz, para subdominios de tenants) |
| `QUOTE_SIGNING_SECRET` | **el valor de tu `.env.local`** (debe COINCIDIR con `app_config.quote_signing_secret` en Supabase). Requerido para el formulario de cotización. |

### Opcionales (activan features; sin ellas degradan con elegancia)
| Variable | Para qué |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Notificaciones al agente + crear usuarios/agentes. Supabase → Settings → API → `service_role`. |
| `ANTHROPIC_API_KEY` | Chat IA. Sin ella, el chat deriva a WhatsApp. |
| `CHAT_MODEL` | Modelo del chat (default `claude-opus-4-8`; `claude-haiku-4-5` = económico para FAQ). |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | Captcha en el formulario público. |
| `RESEND_API_KEY` + `NOTIFY_FROM_EMAIL` | Email al agente. |
| `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` | Notificación WhatsApp (requiere plantillas Meta para envío en frío). |

## 3. Dominios (Project → Settings → Domains)
1. Agrega tu dominio principal: `stepsseguros.app` (y `www.stepsseguros.app`).
2. **Subdominios de tenants (marca blanca)**: agrega el **wildcard** `*.stepsseguros.app`.
   - En tu DNS: registro **CNAME `*` → `cname.vercel-dns.com`** (o usa Vercel DNS).
   - Así `steps.stepsseguros.app`, `demo.stepsseguros.app`, etc. resuelven al tenant por host.
3. **Dominio custom por tenant** (ej. `cotiza.otraagencia.com`): agrégalo como dominio
   en el proyecto y setéalo en `tenants.custom_domain` (panel `/admin`).

## 4. Configuración en Supabase (una vez)
- **Auth → URL Configuration**: Site URL = `https://TU_DOMINIO`; agrega las Redirect URLs
  (`https://TU_DOMINIO/**`) para que invitaciones y reset de contraseña enlacen bien.
- **Auth → Providers/Policies**: activa **Leaked Password Protection**.
- Confirma que `app_config.quote_signing_secret` == `QUOTE_SIGNING_SECRET` de Vercel.
- (SMTP) Configura el correo de Auth para que funcionen las invitaciones de agentes.

## 5. Verificación post-deploy
- Abre la URL de producción → la home carga con la marca del tenant por defecto.
- Cabeceras de seguridad activas (CSP estricta con nonce solo aplica en prod).
- PWA instalable (requiere HTTPS, que Vercel provee).
- Prueba el formulario de **Cotizar** (necesita `QUOTE_SIGNING_SECRET` correcto).
- Login del portal en `/login`.

## Notas
- Cada `git push` a `main` dispara un deploy automático.
- La CSP estricta (`NODE_ENV=production`) puede mostrar violaciones en consola si algún
  origen no está permitido: revisa la consola del navegador tras el primer deploy
  (especialmente al activar Turnstile).
- Rota `QUOTE_SIGNING_SECRET` (env + `app_config`) y la API key de OpenRouter del scaffold
  antes de producción si aún no lo hiciste.
