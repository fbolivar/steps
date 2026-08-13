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
| `NEXT_PUBLIC_SITE_URL` | `https://stepseguros.com` |
| `NEXT_PUBLIC_DEFAULT_TENANT` | `steps` |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `stepseguros.com` (dominio raíz, para subdominios de tenants) |
| `QUOTE_SIGNING_SECRET` | **el valor de tu `.env.local`** (debe COINCIDIR con `app_config.quote_signing_secret` en Supabase). Requerido para el formulario de cotización. |

### Opcionales (activan features; sin ellas degradan con elegancia)
| Variable | Para qué |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Notificaciones al agente + crear usuarios/agentes. Supabase → Settings → API → `service_role`. |
| `ANTHROPIC_API_KEY` | **Chat IA.** Sin ella —o con una clave inválida— el chat deriva a WhatsApp. Se obtiene en console.anthropic.com → API keys. Verifícala antes de desplegar: `curl https://api.anthropic.com/v1/messages -H "x-api-key: $KEY" -H "anthropic-version: 2023-06-01" -H "content-type: application/json" -d '{"model":"claude-opus-5","max_tokens":16,"messages":[{"role":"user","content":"ok"}]}'` — un 401 significa clave inválida. |
| `CHAT_MODEL` | Modelo del chat. Default `claude-opus-5` ($5/$25 por millón de tokens). `claude-haiku-4-5` ($1/$5) es la opción económica para preguntas frecuentes. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | Captcha en el formulario público. |
| `RESEND_API_KEY` + `NOTIFY_FROM_EMAIL` | **Correo de los formularios.** Sin estas dos, ni el formulario de contacto ni la copia de las cotizaciones salen por correo (la cotización igual queda registrada en el portal; el contacto muestra el correo directo como alternativa). `NOTIFY_FROM_EMAIL` debe usar un dominio verificado en Resend. |
| `NOTIFY_TECH_EMAIL` | Buzón que recibe contacto y cotizaciones. Default: `tecnico@stepseguros.com`. |
| `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` | Notificación WhatsApp (requiere plantillas Meta para envío en frío). |

## 3. Dominios (Project → Settings → Domains)
1. Agrega el dominio principal: `stepseguros.com` (y `www.stepseguros.com`).
   > Ojo con la grafía: el dominio es **`stepseguros.com`, con una sola «s»** entre
   > «step» y «seguros». El manual de marca impreso muestra `stepsseguros.com`
   > (doble «s»); el dominio bueno es el de una sola.
2. **Subdominios de tenants (marca blanca)**: agrega el **wildcard** `*.stepseguros.com`.
   - En tu DNS: registro **CNAME `*` → `cname.vercel-dns.com`** (o usa Vercel DNS).
   - Así `steps.stepseguros.com`, `demo.stepseguros.com`, etc. resuelven al tenant por host.
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
