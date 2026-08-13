# Auditoría técnica — Fases 2, 3 y 4
**Grupo Step Seguros Ltda (STEPS SEGUROS)** · Auditoría del 13 de agosto de 2026
Rama `main`, commit `28217f3`, 35 commits · Producción: `steps-chi-lake.vercel.app`

---

## 1. Resumen ejecutivo

**La premisa del encargo está desactualizada: este repositorio no es una Fase 1.**
Ya contiene, construido y en producción, el grueso de las Fases 2 y 4 (portal de
agentes con autenticación, cotizador propio con aislamiento por tenant y RLS,
panel de administración de tenants) y el código de la Fase 3 (chat con IA,
notificador de WhatsApp). El requisito duro —que la cotización no llegue al
cliente final— **está resuelto a nivel de base de datos, no de interfaz**, que es
la forma correcta. No se requiere refactor previo para escalar.

Lo que falta no es arquitectura: es **cierre de último kilómetro** (tres servicios
externos sin credenciales válidas, tres migraciones aplicadas en producción que no
están versionadas, y cero pruebas automatizadas). Mi conclusión de esfuerzo es que
las tres fases suman **mucho menos** de lo estimado en desarrollo, pero aparecen
riesgos de calendario por dependencias de terceros que ningún día de programación
resuelve.

---

## 2. Inventario técnico

### 2.1 Stack real

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.2.11 |
| UI | React | 19 |
| Lenguaje | TypeScript | 5.7 |
| Estilos | Tailwind CSS + `clsx` + `tailwind-merge` | 3.4 |
| Backend | **Supabase** (Postgres + Auth + RLS) | `@supabase/ssr` 0.6, `supabase-js` 2.49 |
| IA | `@anthropic-ai/sdk` | 0.112.5 |
| Validación | Zod | 4.4 |
| Iconos | lucide-react | 1.25 |
| Gestor | npm | — |

**No es "frontend + servicio externo de correo".** Hay backend propio: Server
Actions, una API route (`/api/chat`), un proxy de resolución de tenant, y una base
de datos con 8 tablas, RLS y funciones `SECURITY DEFINER`.

El paquete se llama `saas-factory-app` (herencia del andamiaje inicial); es
cosmético pero conviene renombrarlo antes de entregar el repo al cliente.

### 2.2 Envío de formularios

Dos formularios, ninguno usa Formspree/EmailJS:

| Formulario | Ruta | Mecanismo |
|---|---|---|
| Contacto | `/contacto` | Server Action → Resend (API REST) → buzón técnico |
| Cotización | `/cotizar` | Server Action → RPC firmada en Postgres → registro en BD + Resend |

El destino **no está hardcodeado en código**: sale de `tenants.contact_email` en la
base (hoy `tecnico@stepseguros.com`) y de la constante `NOTIFY_TECH_EMAIL`.

⚠️ **Ninguno de los dos envía correo hoy**: `RESEND_API_KEY` y `NOTIFY_FROM_EMAIL`
no están configuradas en Vercel. La cotización sí se registra en el portal (no se
pierde); el contacto muestra el buzón directo como alternativa.

### 2.3 Estructura y convenciones

Arquitectura *feature-first*, consistente y ordenada:

```
src/
├── app/            24 archivos · 1.669 líneas   rutas agrupadas:
│                                                (marketing) (auth) (portal) api/
├── features/       33 archivos · 2.383 líneas   admin · auth · chat · notifications
│                                                quotes · site · dashboard
├── shared/         18 archivos · 1.224 líneas   components · lib · constants
└── lib/supabase/    4 archivos ·   454 líneas   client · server · admin · types
supabase/migrations 11 archivos ·   796 líneas
```

**Design tokens: sí, y bien resueltos.** `tailwind.config.ts` define la paleta de
marca sobre variables CSS (`--brand-primary/secondary/accent/soft`) que el layout
inyecta **desde la fila del tenant** — es decir, el theming de marca blanca ya es
funcional, no hardcodeado. Tipografía vía `next/font`. Documentado en
`docs/marca-steps.md`.

### 2.4 Base de datos, autenticación y estado

**Existe todo, y con diseño multitenant desde el origen.**

| Tabla | Para qué |
|---|---|
| `tenants` | Marca, colores, subdominio, dominio propio, activo/inactivo |
| `tenant_members` | Usuario ↔ tenant ↔ rol |
| `profiles` | Perfil del usuario |
| `agents` | Agentes por tenant (correo, WhatsApp) |
| `insurance_lines` | Catálogo de productos por tenant (33 filas) |
| `quote_requests` | Solicitudes + resultado interno + agente asignado |
| `rate_limits` | Control de abuso |
| `app_config` | Configuración interna (secreto de firma) |

Roles (`app_role`): `super_admin`, `tenant_admin`, `agente`, `editor_contenido`.
Autenticación: Supabase Auth con sesión SSR refrescada en el proxy.
Estado de cliente: React local; **no hay Zustand ni store global** (no hace falta).

**Datos reales en producción hoy:** 2 tenants (`steps` y un `demo`), 3 usuarios,
2 agentes, 6 cotizaciones de prueba en estados `nueva`/`contactado`/`en_negociacion`.

### 2.5 Dependencias reutilizables

Todas las piezas pesadas de las fases pendientes ya están instaladas: cliente
Supabase (BD + auth + RLS), SDK de Anthropic (chat IA), Zod (validación de
entradas). No hay librería de formularios (react-hook-form) ni cliente HTTP
(axios): se usan Server Actions y `fetch` nativo, lo cual es correcto en Next 16 y
no debe cambiarse.

### 2.6 Despliegue e integración continua

- **Vercel**, proyecto `steps`, cuenta `fernando-bolivars-projects`. Auto-deploy en
  cada push a `main`. Último build limpio.
- Dominio: **solo el de Vercel**. Sin dominio propio ni wildcard configurado — esto
  es un bloqueante para la Fase 4 (ver §4).
- Variables en producción: `QUOTE_SIGNING_SECRET`, `ANTHROPIC_API_KEY`,
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_DEFAULT_TENANT`.
- **Ausentes**: `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL`,
  `NEXT_PUBLIC_ROOT_DOMAIN`, `TURNSTILE_*`, `WHATSAPP_*`.
- **CI/CD: no existe.** No hay carpeta `.github`, ni tests, ni linter en el pipeline.
  El único control de calidad automático es el build de Vercel, que no ejecuta
  pruebas porque no hay ninguna.

---

## 3. Gap analysis por fase

### Fase 2 — Cotizador, captura interna, portal, WhatsApp comercial

| Componente | Estado | Detalle |
|---|---|---|
| Formulario de cotización | ✅ **Sirve tal cual** | 3 pasos, validación Zod servidor, consentimiento Ley 1581 con sello de tiempo |
| Captura en BD propia | ✅ **Sirve tal cual** | RPC `submit_quote_request` firmada con HMAC: la anon key sola no puede insertar |
| **Resultado oculto al cliente** | ✅ **Resuelto en BD** | `quote_requests` no tiene política RLS para `anon` → el cliente final no puede leer ninguna fila, ni siquiera la suya. El acuse solo devuelve un radicado |
| Enrutamiento a agente | ✅ **Existe** | Asignación automática dentro de la RPC; las 6 cotizaciones de prueba tienen agente asignado |
| Portal de agentes | ✅ **Existe** | Login, bandeja con filtros por estado, detalle, cambio de estado, configuración |
| Panel de administración | ✅ **Existe** | Alta/edición de tenants, gestión de agentes |
| Adaptador Agentemotor | 🟡 **Preparado, no conectado** | Interfaz `QuoteProviderAdapter` con tres implementaciones: A (API, lanza error a propósito), B (manual, **activa**), C (RPA, deliberadamente no implementada) |
| Anti-abuso | ✅ / 🟡 | Rate limit por IP activo; captcha Turnstile implementado pero **sin claves** → desactivado |
| Notificación al agente | 🟡 **Código listo, no funciona** | Requiere `SUPABASE_SERVICE_ROLE_KEY` + `RESEND_API_KEY`, ninguna configurada |
| WhatsApp comercial | ✅ **Sirve tal cual** | Enlaces `wa.me` con mensaje prellenado, número real (+57 311 553 2266) |

**A construir desde cero: nada estructural.** Solo el adaptador A si Agentemotor
confirma API.
**A refactorizar: nada.** La decisión de Fase 1 de capturar en BD propia en vez de
enviar por correo es exactamente la que la Fase 2 necesitaba.

### Fase 3 — Chat IA y seguimiento por WhatsApp

| Componente | Estado | Detalle |
|---|---|---|
| Chat con IA | 🟡 **Construido, caído** | `/api/chat` con Claude, prompt de sistema alimentado por el catálogo real del tenant, rate limit propio. **La `ANTHROPIC_API_KEY` configurada devuelve 401** — verificado contra la API |
| Prohibición de dar primas | ✅ | El prompt instruye no dar cifras y derivar a asesor; refuerza el requisito duro |
| Escalamiento a humano | ✅ **Sirve tal cual** | Enlace a WhatsApp dentro del panel de chat + campo `escalate` en la respuesta |
| Notificaciones WhatsApp | 🟡 **Parcial** | `whatsappNotifier` habla con la Cloud API de Meta, pero envía **texto simple**, que solo funciona dentro de la ventana de 24 h |
| **Plantillas aprobadas por Meta** | ❌ **No existe** | Es el trabajo real de esta fase: registrar plantillas, esperar aprobación y cambiar el envío a `type: template` |

**A construir desde cero:** la capa de plantillas (registro, versionado por idioma,
parámetros) y el manejo de estados de entrega/error de Meta.

### Fase 4 — Multitenant / marca blanca

| Componente | Estado | Detalle |
|---|---|---|
| Modelo de datos multitenant | ✅ **Completo** | `tenant_id` en todas las tablas de negocio, con `on delete cascade` |
| Aislamiento por RLS | ✅ **Implementado** | Políticas por rol vía funciones `has_tenant_role` / `is_super_admin` (`SECURITY DEFINER` para evitar recursión) |
| Resolución de tenant | ✅ **Implementado** | Por **host**, en el proxy — nunca por parámetro de URL, que es la decisión correcta contra fugas entre tenants |
| Branding por tenant | ✅ **Funcional** | Colores desde BD inyectados como variables CSS; el logo STEPS se aplica solo al tenant `steps` |
| Panel de administración | ✅ **Existe** | Crear tenant (con catálogo por defecto), editar marca, gestionar agentes |
| Onboarding de tenants | 🟡 **Parcial** | Se crea el tenant, pero no hay flujo de invitación del `tenant_admin` ni autoservicio |
| Dominios wildcard | ❌ **No configurado** | El código lee `NEXT_PUBLIC_ROOT_DOMAIN`, pero no hay dominio propio ni DNS wildcard en Vercel |
| **Pruebas de aislamiento** | ❌ **No existen** | Nadie ha verificado que el tenant A no vea datos del B |

**A refactorizar: nada.** La Fase 4 no exige rehacer decisiones previas porque
**ya se construyó multitenant desde el primer día**.

### 3.4 Riesgos técnicos específicos de este repositorio

| # | Riesgo | Gravedad | Por qué |
|---|---|---|---|
| R1 | ~~**Tres migraciones aplicadas en producción no están en el repo**~~ · **RESUELTO 13-ago-2026** | ~~🔴 Alta~~ | La BD tiene 14 migraciones; el repo tiene 11 archivos (faltan los números 0003 y 0004). Las ausentes son `harden_functions`, `quote_round_robin_assignment` y `rate_limiting`. La aplicación **depende en caliente** de `rate_limit_hit`. Si se recrea la base desde el repo, el cotizador queda sin límite de abuso y sin asignación de agente, en silencio |
| R2 | **Cero pruebas automatizadas y sin CI** | 🟠 Media-alta | Un cambio de RLS que abra datos entre tenants no lo detecta nadie hasta producción. Crítico justo antes de la Fase 4 |
| R3 | Datos de prueba mezclados en producción | 🟠 Media | 6 cotizaciones de prueba y un tenant `demo` conviven con la base real |
| R4 | Tres servicios externos con credenciales inválidas o ausentes | 🟠 Media | Correo (Resend), IA (clave 401) y notificaciones (service role). El código degrada con elegancia, así que **fallan en silencio** |
| R5 | Captcha implementado pero apagado | 🟡 Media-baja | El formulario público solo tiene rate limit por IP |
| R6 | Sin dominio propio | 🟡 Media-baja | Bloquea Fase 4 y deja `NEXT_PUBLIC_SITE_URL` apuntando a localhost en el entorno local |
| R7 | Protección de contraseñas filtradas desactivada en Supabase | 🟡 Baja | Un clic en el panel |
| R8 | Funciones `SECURITY DEFINER` ejecutables por `anon` | 🟡 Baja | `submit_quote_request` es intencional y está firmada; conviene revocar `execute` a `anon` en `has_tenant_role`, `has_tenant_access` e `is_super_admin` |

---

## 4. Validación del esfuerzo estimado

Las estimaciones originales asumían construir desde una Fase 1 de sitio estático.
Contra el código real, el trabajo pendiente es de **integración y verificación**,
no de construcción.

| Fase | Estimación previa | Estimación contra el repo real | Diferencia |
|---|---|---|---|
| Fase 2 | 10–13 días | **3–5 días** | −7 a −8 |
| Fase 3 | 5–6 días | **2–4 días** de desarrollo | −2 a −3 |
| Fase 4 | 18–25 días | **6–10 días** | −12 a −15 |
| *(nuevo)* Deuda técnica transversal | no estimado | **3–5 días** | +3 a +5 |
| **Total** | **33–44 días** | **14–24 días** | **−19 a −20** |

### Detalle y banderas

**Fase 2 — 3 a 5 días.** Configurar Resend y el service role, activar Turnstile,
limpiar datos de prueba, y validar el circuito completo con el cliente.

> `RIESGO DE ESTIMACIÓN` — **Agentemotor es la incógnita que puede duplicar esta
> fase.** El adaptador A está declarado pero **lanza un error a propósito**: no hay
> una sola línea que hable con Agentemotor. Los tres escenarios divergen mucho:
> — *Se queda en manual (B):* 0 días extra. Es lo que hoy funciona.
> — *Cotizador embebido:* +1 a 2 días, **pero exige verificar que el iframe no
>   muestre la prima al cliente final**; si la muestra, es incompatible con el
>   requisito duro y hay que descartarlo.
> — *API con credenciales por sub-agente:* +3 a 5 días si la documentación es
>   buena; **+8 o más si hay que descubrirla por ensayo y error**, que es el caso
>   habitual en SaaS de seguros locales sin API pública.

**Fase 3 — 2 a 4 días de desarrollo.** Reemplazar la clave de Anthropic (minutos) y
construir la capa de plantillas de WhatsApp.

> `RIESGO DE ESTIMACIÓN` — **El calendario aquí no lo manda el desarrollo, sino
> Meta.** Verificar un número de WhatsApp Business y aprobar plantillas toma de
> días a semanas y puede ser rechazado por redacción. Si el cliente aún no tiene
> Meta Business Manager, **el reloj empieza cuando lo abra, no cuando yo programe**.
> Recomiendo cotizar esta fase con el desarrollo y la espera separados.

**Fase 4 — 6 a 10 días.** Lo pesado (modelo, RLS, resolución por host, branding,
panel) ya está. Queda: dominio y wildcard, flujo de invitación de administradores,
**pruebas de aislamiento entre tenants**, y facturación/límites si aplica.

> `RIESGO DE ESTIMACIÓN` — **"Existe" no es "está probado".** Las políticas RLS se
> ven correctas leyéndolas, pero **nadie las ha ejercitado con dos tenants reales
> y usuarios distintos**. Si aparece una fuga, el arreglo puede ser rápido o tocar
> el modelo de permisos entero. Presupuesta 2 días solo de pruebas de aislamiento;
> es el riesgo más caro de toda la Fase 4 porque una fuga entre tenants no es un
> bug, es un incidente de datos personales bajo Ley 1581.

**Deuda técnica transversal — 3 a 5 días, no estaba en ninguna fase.** (R1 ya
resuelto, ~0,5 días consumidos.) Montar pruebas automatizadas mínimas centradas
en RLS y en el circuito de cotización (R2), y limpiar los datos de prueba (R3).
**Recomiendo hacerlo antes de la Fase 4, no después.**

---

## 5. Dependencias externas sin confirmar

| Dependencia | Estado real en el repo | Qué hay que reemplazar |
|---|---|---|
| **Agentemotor** | Hay diseño, **no hay integración**. El adaptador A lanza `Error('API de Agentemotor sin confirmar')`. Existe `docs/agentemotor-checklist.md` con el cuestionario ya redactado para enviarles | Nada que reemplazar: no hay supuestos ocultos. El código es honesto — declara explícitamente qué no sabe |
| **WhatsApp Business** | Sin confirmar. El notificador **asume** número verificado y envía texto simple, que solo funciona dentro de la ventana de 24 h | El envío `type: text` debe pasar a `type: template` con plantillas aprobadas antes de producción |
| **"Agente interno"** | Parcialmente asumido. Hay 2 agentes en BD y asignación automática, pero **no está definido con el cliente quién los recibe ni con qué criterio de carga** | Confirmar personas reales, correos y si la asignación es rotativa, por línea de producto o por segmento |
| **Correo destino** | ✅ **No está hardcodeado.** Sale de la BD (`tecnico@stepseguros.com`) y de `NOTIFY_TECH_EMAIL` | Nada. Discrepancia de grafía resuelta en §7.2: el dominio bueno es `stepseguros.com` (una «s»); el manual impreso muestra `stepsseguros.com` (doble «s»). Falta confirmar que el buzón recibe |
| **Resend** | No contratado | Cuenta + dominio verificado para el remitente |
| **Anthropic** | Clave configurada **inválida** (401 verificado) | Clave nueva y saldo en la cuenta |

Un matiz sobre el requisito duro: hoy `quote_result` está vacío en las 6 filas
porque el adaptador es manual. Es decir, **el requisito se cumple hoy de forma
trivial**. La protección real (RLS sin política para `anon`) está bien diseñada,
pero **solo se pondrá a prueba de verdad el día que exista la API de Agentemotor y
empiece a guardarse un resultado**. Ese es el momento de auditarla de nuevo.

---

## 6. Recomendación de orden de ejecución

**No reordenar las fases: el dilema que motivaba la pregunta ya no existe.** La
duda era si construir Fase 2 con datos "planos" y migrar después. No aplica: el
modelo multitenant ya está construido y en uso. No hay retrabajo que evitar.

Lo que sí recomiendo es **intercalar un bloque cero**:

**Bloque 0 — Cierre y saneamiento (3–5 días). Antes que cualquier función nueva.**
1. ~~Versionar las tres migraciones huérfanas (R1)~~ ✅ **Hecho el 13-ago-2026.**
2. Configurar Resend, la clave de Anthropic y el service role → correo y chat vivos.
3. Activar Turnstile y limpiar datos de prueba.
4. Pruebas mínimas: circuito de cotización y **aislamiento entre tenants**.

Con eso, el sitio pasa de "desplegado" a "operativo", que es lo que el cliente
percibe como producto terminado.

**Después: Fase 2 → Fase 3 → Fase 4**, con dos matices:

- **Arranca hoy los trámites externos**, en paralelo al Bloque 0: el correo a
  Agentemotor (`docs/agentemotor-checklist.md` ya está redactado) y el alta de Meta
  Business Manager. Ambos tienen semanas de latencia que no dependen de programar.
- **Fase 4: la opción intermedia que pedías ya está tomada.** El modelo no está
  "tenant-ready", está *tenant-native* y funcionando. Lo que puede posponerse sin
  costo es el **onboarding de autoservicio y la facturación por tenant**: mientras
  no haya revendedores reales, dar de alta un tenant desde el panel de
  administración (que ya existe) es suficiente. Eso convierte la Fase 4 de 6–10
  días a **2–3 días** hasta que exista demanda demostrada.

### Resumen para la conversación comercial

El cliente ya tiene bastante más producto del que probablemente cree. La
conversación honesta no es "faltan 33–44 días", sino: *"lo construido cubre casi
todo el alcance de las tres fases; faltan 14–24 días de integración y verificación,
y dos trámites con terceros que conviene iniciar esta semana porque su demora no
depende de nosotros"*.

---

*Auditoría realizada sobre el código y la base de datos de producción. No se
modificó código durante esta sesión; este documento es el único archivo creado.*

---

## 7. Cierre de Bloque 0

Sesión posterior a la auditoría. Objetivo: dejar los cimientos verificados antes
de tocar las Fases 2, 3 o 4. Nada de lo aquí descrito avanza esas fases.

### 7.1 R1 — Migraciones huérfanas: **resuelto, con un desfase explicado**

Los números **no cuadran a simple vista y es correcto que no cuadren**:

| | |
|---|---|
| Archivos `.sql` en `supabase/migrations/` | **13** |
| Migraciones registradas en producción | **14** |

La diferencia es `quote_round_robin_assignment`, que **no tiene ni tendrá archivo
propio, a propósito**. Lo único que hizo fue añadir la asignación automática de
agente dentro de `submit_quote_request`, y esa función se reescribe entera —con
asignación incluida— en las migraciones 0005, 0006 y 0007. Un archivo con la
versión intermedia solo añadiría una definición que las tres siguientes pisan.

Lo que sí importa, y está verificado: **cero objetos huérfanos**. Las 8 tablas y
9 funciones vivas en producción tienen un archivo que las crea. `harden_functions`
y `rate_limiting` sí faltaban y ahora existen como `0003_harden_functions.sql` y
`0004_rate_limiting.sql`, con el cuerpo copiado literal de `pg_get_functiondef`
y comparado por diff normalizado: idénticos a producción. El mapeo
archivo ↔ migración registrada queda en `supabase/migrations/README.md`.

Recrear la base desde el repositorio reproduce hoy el esquema de producción.

### 7.2 Dominio: `stepsseguros` → `stepseguros`

El dominio correcto es **`stepseguros.com`, con una sola «s»**. Corregido en:

| Archivo | Qué decía |
|---|---|
| `src/proxy.ts:18` | `NEXT_PUBLIC_ROOT_DOMAIN ?? 'stepsseguros.app'` → `'stepseguros.com'` |
| `src/proxy.ts:64` | comentario del subdominio de plataforma |
| `.env.local.example:10` | ejemplo de `NEXT_PUBLIC_ROOT_DOMAIN` |
| `docs/deploy-vercel.md` | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ROOT_DOMAIN`, dominio y wildcard DNS |
| `docs/hardening-runbook.md` | tabla de variables y wildcard DNS |

Nótese que el valor viejo no era solo una «s» de más: era **`.app`**, un dominio
de plataforma distinto del `.com` real. Los subdominios de marca blanca pasan a
ser `demo.stepseguros.com`, y el wildcard de DNS a `*.stepseguros.com`.

**Lo que NO se tocó, y por qué:**

- **`stepsseguros@gmail.com`** (en `supabase/migrations/0002_seed_steps_tenant.sql`,
  `docs/agentemotor-checklist.md` e `index.html`) **no es una errata de dominio**:
  es una cuenta de Gmail real, y es además el correo con el que Paula entra al
  portal (existe en `auth.users`). Renombrarla rompería su acceso. Se deja.
- **`supabase/migrations/0001:49`**, un comentario con el dominio viejo. Es una
  migración ya aplicada y la convención del repositorio es no editarlas: cambiar
  hasta un comentario descuadra el checksum frente a la CLI de Supabase. Queda
  como está, señalado aquí.
- **`index.html`** es el sitio estático anterior, no forma parte de la app Next.

**Verificado en producción:** el tenant `steps` tiene `contact_email =
tecnico@stepseguros.com` (grafía correcta), y `NOTIFY_TECH_EMAIL` usa el mismo
valor por defecto en `src/features/notifications/tech-inbox.ts:16`.

**Advertencia de marca:** el manual de identidad impreso muestra
`www.stepsseguros.com` y `gerencia@stepsseguros.com`, con doble «s». O el manual
está mal, o hay que registrar también ese dominio como redirección. Es una
decisión del cliente, no técnica.

### 7.3 Checklist de variables por servicio

Ninguna requiere código nuevo: **las cuatro ya están declaradas y leídas**. Todas
degradan con elegancia cuando faltan, que es justo por lo que su ausencia pasa
inadvertida.

| Servicio | Variable exacta | Estado en el código | Qué se rompe sin ella |
|---|---|---|---|
| **Resend** | `RESEND_API_KEY` | Declarada, vacía. Leída en `tech-inbox.ts:22,37` y `adapters.ts:35,38` | No sale ningún correo: ni el formulario de contacto ni la copia de la cotización al buzón técnico. La cotización **sí** queda registrada en el portal |
| **Resend** | `NOTIFY_FROM_EMAIL` | Declarada, vacía. Mismo par que la anterior | Igual: el envío está condicionado a que **ambas** existan. El dominio del remitente debe estar verificado en Resend |
| **Resend** | `NOTIFY_TECH_EMAIL` | Opcional, con default `tecnico@stepseguros.com` | Nada: solo cambia el destino |
| **Anthropic** | `ANTHROPIC_API_KEY` | Declarada, vacía. Leída en `src/app/api/chat/route.ts:61` | El chat degrada a WhatsApp. **Ojo:** una clave *inválida* falla igual que una ausente; verifícala con curl antes del deploy (comando en `docs/deploy-vercel.md`) |
| **Anthropic** | `CHAT_MODEL` | Opcional, default `claude-opus-5` | Nada |
| **Supabase** | `SUPABASE_SERVICE_ROLE_KEY` | Declarada, vacía. Leída en `src/lib/supabase/admin.ts:16` | Exactamente dos cosas: (1) las **notificaciones** al agente, que necesitan leer datos saltándose RLS; (2) el **alta de usuarios** — crear el admin de un tenant nuevo desde `/admin` y dar de alta agentes desde `/portal/configuracion`. El resto del sitio, el portal y el cotizador funcionan sin ella |
| **Turnstile** | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Declarada, vacía. Leída en `src/features/quotes/components/turnstile.tsx:11` | Sin ella el widget **no se renderiza** |
| **Turnstile** | `TURNSTILE_SECRET_KEY` | Declarada, vacía. Leída en `src/shared/lib/turnstile.ts:8,25` | Sin ella `verifyTurnstile()` **devuelve `true` sin verificar** (gating deliberado para desarrollo). Es decir: el captcha no protege nada hasta que se carguen las dos |

**Frontend de Turnstile: sí, ya está enganchado** — `<Turnstile/>` se renderiza en
`src/features/quotes/components/quote-form.tsx:213`, inyecta
`cf-turnstile-response` en el form y `submit.ts:77-78` lo verifica en servidor.
No hay que escribir nada; basta con cargar las dos claves.

**Hueco detectado:** el **formulario de contacto no tiene captcha**. Solo lo tiene
el de cotización. No es un bloqueo de Bloque 0, pero conviene anotarlo.

**Claves quemadas en código: ninguna.** Todos los secretos salen de `process.env`.
El único acoplamiento a vigilar es `QUOTE_SIGNING_SECRET`, que **debe coincidir**
con `app_config.quote_signing_secret` en Supabase: si se rota uno sin el otro, el
cotizador público deja de aceptar envíos.

### 7.4 Pruebas de aislamiento entre tenants

Nuevas en el repositorio:

- `supabase/tests/rls_isolation.sql` — la suite.
- `scripts/run-rls-tests.mjs` + `npm run test:rls` — ejecutor multiplataforma.

No necesitan contraseñas ni sesiones reales: suplantan a un usuario poniendo su
`sub` en `request.jwt.claims` y cambiando a rol `authenticated`, que es lo mismo
que hace PostgREST ante un JWT. Todo corre en una transacción que termina en
`ROLLBACK`, así que es seguro ejecutarlas contra producción.

Un detalle que hace o rompe este tipo de prueba: como `postgres` es **dueño** de
las tablas, RLS no se le aplica. Sin el `set role` explícito, las cinco pruebas
pasarían en falso.

| Prueba | Resultado |
|---|---|
| Usuario `demo` no ve `quote_requests`, `agents` ni `tenant_members` de `steps` | ✅ |
| `is_super_admin()`, `has_tenant_access()` y `has_tenant_role()` no conceden nada de `steps` al usuario `demo` | ✅ |
| Usuario `demo` no ve líneas **despublicadas** de `steps` | ✅ |
| Usuario `steps` no ve `quote_requests`, `agents` ni `tenant_members` de `demo` (simetría) | ✅ |
| `anon` no lee **ninguna** cotización de ningún tenant | ✅ |
| `anon` no lee `agents` ni `tenant_members` | ✅ |
| Un `tenant_admin` no puede auto-promoverse a `super_admin` | ❌ **FALLA — ver 7.5** |

Sobre el catálogo: `insurance_lines` **es público a propósito** cuando
`is_active` — lo pinta el sitio de marketing sin sesión. La prueba verifica lo
que sí debe estar cerrado: lo despublicado de otro tenant.

### 7.5 🔴 Hallazgo: escalada de privilegios de `tenant_admin` a `super_admin`

**Confirmado empíricamente**, no deducido de leer políticas. Ejecutado dentro de
transacción con `ROLLBACK`; se verificó después que `tenant_members` quedó
intacta (3 filas, roles originales).

**Qué pasa.** Un `tenant_admin` puede actualizar su propia fila en
`tenant_members` y ponerse `role = 'super_admin'`. La sentencia afecta 1 fila y
tiene éxito.

**Por qué.** La política `members_admin_write` (`FOR ALL`) usa como `USING`:

```sql
has_tenant_role(tenant_id, ARRAY['tenant_admin'])
```

y **no declara `WITH CHECK` propio**, de modo que Postgres reutiliza el mismo
`USING` para validar la fila resultante. La comprobación pregunta *«¿mandas en
este tenant?»* pero **nunca pregunta *«a qué rol la estás cambiando»***. La fila
nueva sigue perteneciendo al mismo tenant, así que pasa el filtro.

**Por qué es grave.** `is_super_admin()` no mira el tenant:

```sql
select exists (select 1 from tenant_members
  where user_id = auth.uid() and role = 'super_admin' and is_active);
```

Le basta **una** fila con ese rol, en cualquier tenant. Y `has_tenant_access()`
y `has_tenant_role()` empiezan las dos con `is_super_admin() or ...`. Es decir:
el rol se escribe desde dentro de un tenant, pero se lee a nivel de plataforma.
Un administrador de un tenant cualquiera queda con lectura y escritura sobre
**todos** los tenants, cotizaciones incluidas.

**Impacto real hoy:** contenido. El único `tenant_admin` que no controlamos es el
del tenant `demo`, de pruebas. **El riesgo es de futuro y es el del modelo de
negocio**: en el momento en que el cliente revenda la plataforma a otro
intermediario, ese intermediario será `tenant_admin` de su propio tenant — y con
esto podría leer la cartera de todos los demás. Choca de frente con el requisito
duro del proyecto.

**No se corrigió.** Instrucción explícita de detenerse y acordar el alcance antes
de tocar RLS en producción. Opciones para esa conversación, de menor a mayor
alcance:

1. **Añadir `WITH CHECK` a `members_admin_write`** que prohíba escribir
   `role = 'super_admin'` salvo si `is_super_admin()` ya era cierto. Cambio
   mínimo, ataja el vector concreto.
2. **Sacar `super_admin` de `tenant_members`** a su propia tabla, sin políticas
   de escritura desde la API. Elimina la clase entera de fallo: el rol de
   plataforma deja de vivir en una tabla que los tenants pueden editar.
3. Además de lo anterior, **impedir que un admin edite su propia fila** de
   membresía (los cambios de rol propios pasan por otro admin).

La 2 es la correcta a mediano plazo; la 1 se puede aplicar hoy y es compatible
con hacer la 2 después. La suite de `rls_isolation.sql` ya contiene la prueba que
lo detecta, así que servirá de verificación del arreglo.

### 7.6 Fix de escalada de privilegios — aplicado

> Este apartado es el que en el encargo se pidió como «7.1»; va al final para no
> renumerar los cinco anteriores, que ya estaban escritos y referenciados.

Se aplicó la **opción 1** del apartado anterior, más la 3 (prohibir la
auto-edición de la propia membresía). La opción 2 queda en backlog, al final.

**Migración:** `supabase/migrations/0014_fix_escalada_super_admin.sql`, registrada
en producción como `fix_escalada_super_admin` (2026-08-13).

**Qué política cambió.** Se elimina `members_admin_write` —una sola política
`FOR ALL` sin `WITH CHECK` propio— y se sustituye por cuatro políticas separadas
por operación, cada una con su `WITH CHECK` explícito:

| Política | Operación | Qué impone |
|---|---|---|
| `members_admin_insert` | INSERT | No se puede dar de alta un `super_admin` salvo que quien lo hace ya lo sea; nadie se inserta a sí mismo |
| `members_admin_update` | UPDATE | Solo filas de otros y que no sean `super_admin`; el resultado tampoco puede serlo |
| `members_super_update` | UPDATE | Deja a un `super_admin` mantener filas que **ya** son `super_admin`. Un `tenant_admin` nunca la satisface |
| `members_admin_delete` | DELETE | No se borra la membresía de un `super_admin` desde dentro de un tenant, ni la propia |

La razón de partir el UPDATE en dos políticas: `WITH CHECK` ve la fila **nueva**,
nunca la vieja, así que «el resultado puede ser `super_admin` solo si la fila ya
lo era» no cabe en una sola. Al ser permisivas se combinan con `OR`, y la segunda
exige `is_super_admin()`, que a un `tenant_admin` le da `false`.

Las tres funciones de lectura de rol (`is_super_admin`, `has_tenant_role`,
`has_tenant_access`) **no se tocaron**: el fallo estaba en la política de
escritura, no en ellas.

**Compatibilidad.** Ninguna ruta de la aplicación escribe en `tenant_members` con
la sesión del usuario: `src/features/admin/services/actions.ts:82` y
`agent-actions.ts:68` usan el cliente service-role, que se salta RLS. El fix no
rompe ningún flujo existente.

**Antes / después.** Se probó primero en seco —migración y suite dentro de una
transacción con `ROLLBACK`— y solo después se aplicó a producción.

| Prueba | Antes | Después |
|---|---|---|
| 4a · `tenant_admin` se auto-promueve a `super_admin` | ❌ `UPDATE 1` (fuga) | ✅ 0 filas |
| 4b · `tenant_admin` edita su propia membresía a un rol permitido | *(no existía)* | ✅ 0 filas |
| 5a · `tenant_admin` cambia el rol de **otro** miembro de su tenant | ✅ 1 fila | ✅ 1 fila (no se rompió) |
| 5b · `tenant_admin` promueve a **otro** a `super_admin` | *(no existía)* | ✅ 0 filas |
| Aislamiento entre tenants + `anon` (casos 1–3) | ✅ | ✅ |

El caso 5a es el que evita un fix a medias: cierra el agujero sin cerrar la puerta
de al lado. Para probarlo, la suite añade un segundo miembro temporal al tenant
`demo` —que solo tiene uno— y lo revierte con el `ROLLBACK`.

Se verificó tras aplicar que `tenant_members` conserva sus 3 filas y roles
originales, y que `get_advisors(security)` no reporta ningún hallazgo nuevo.

**Commit del fix en `main`:** `c86f902` — «fix(rls): cerrar la escalada de
tenant_admin a super_admin». Subido junto con `657af00` (el resto del Bloque 0:
R1, dominio, credenciales documentadas y la suite de aislamiento).

### 7.7 Backlog — endurecimiento pendiente (no de esta sesión)

**Sacar `super_admin` de `tenant_members` a su propia tabla, sin políticas de
escritura desde la API** (la opción 2 del apartado 7.5).

Lo aplicado en 7.6 cierra el vector conocido; esto elimina la **clase** de fallo.
Mientras el rol de plataforma viva en una tabla que los administradores de tenant
pueden editar, cada política nueva sobre `tenant_members` es una oportunidad de
reabrirlo, y basta un `WITH CHECK` olvidado para volver al punto de partida.

**Cuándo:** antes de dar de alta el primer tenant revendido real en Fase 4. Hoy el
único `tenant_admin` ajeno es el del tenant `demo`, de pruebas; el día que un
intermediario externo tenga ese rol, el margen de error desaparece.

---

*Bloque 0 cerrado. El hallazgo 7.5 quedó corregido y verificado en 7.6. No se
avanzó en Fases 2, 3 ni 4.*
