# Sistema de diseño · STEPS SEGUROS

Traducción del **Manual de Identidad STEPS SEGUROS** a la aplicación. Todo lo
que sigue está implementado; no es una propuesta.

> Concepto generador: **"Cada paso deja una huella, nosotros la protegemos"**.

---

## 1. Color

| Nombre (manual) | HEX | Token Tailwind | Uso en la app |
|---|---|---|---|
| Azul profundo | `#000831` | `brand-primary`, `navy-900` | Color principal: texto, fondos oscuros, botón primario, footer, barra de contacto |
| Cobalt blue | `#2F5AA6` | `brand-accent`, `brand-secondary`, `cobalt` | Acento: CTA, iconos, enlaces activos, cifras, marco en "L", punto de las etiquetas |
| Gris azulado | `#D3DDDD` | `brand-soft`, `steel` | Bordes, separadores, superficies calmas, acentos legibles sobre azul profundo |
| Blanco puro | `#FFFFFF` | `white` | Fondo base y texto sobre azules |

Tintes derivados (mezclas de los cuatro anteriores, solo para estados de UI):
`cobalt-100/200/400/600/700`, `navy-400/600/700/800`, `steel-light/dark`,
`mist` (`#F2F6F6`, gris azulado muy diluido para fondos de sección).

Degradado de marca (`bg-brand-gradient` / clase `.brand-gradient`): cobalt →
azul profundo en 135°, como las portadas y la tarjeta comercial del manual. Se
construye desde `--brand-accent` y `--brand-primary`, así que **solo contiene
los dos azules oficiales** y responde al theming del tenant. No introducir
tonos intermedios que no salgan de esas variables.

**Marca blanca.** `brand-primary`, `brand-secondary` y `brand-accent` se
resuelven por variables CSS (`--brand-*`) que el layout inyecta desde la fila
del tenant (`tenants.color_primary/secondary/accent`). La migración `0008`
fija esos valores para STEPS y los deja como default de nuevos tenants.

**Excepción documentada.** Los estados del embudo en el portal
(`status-badge.tsx`) conservan ámbar/púrpura/verde: son señales funcionales que
deben distinguirse de un vistazo y la paleta de marca solo aporta azules.
"Nueva" usa cobalt y "perdida" gris azulado.

---

## 2. Tipografía

| Rol | Fuente | Implementación |
|---|---|---|
| Titulares y cifras | **Bebas Neue** | `--font-display`, utilidades `font-display` / `font-heading`. Aplicada automáticamente a `h1`, `h2`, `h3` |
| Cuerpo e interfaz | **Montserrat** (Medium 500 como base) | `--font-body`, utilidad `font-sans`. Aplicada a `body`, `h4`–`h6`, botones, formularios |

Bebas Neue tiene un solo grosor y solo caja alta. Por eso la regla base de
`globals.css` fuerza `font-weight: 400 !important` y `text-transform:
uppercase` en los titulares: cualquier `font-bold` heredado produciría negrita
falsa y ensuciaría el trazo.

El tracking del logotipo (`SEGUROS`) está disponible como
`tracking-wordmark` (0.42em) y el de titulares como `tracking-display` (0.02em).

---

## 3. Logotipo

Los vectores son los **originales del manual**, extraídos del PDF; no fueron
redibujados. Viven en `src/shared/components/brand-marks.tsx` y usan
`currentColor`, así que el color se controla con la clase de texto del
contenedor.

| Componente | Versión del manual | Dónde se usa |
|---|---|---|
| `<StepsLockup />` | Huella + `TEPS`/`SEGUROS` horizontal | Cabecera, pie |
| `<StepsWordmark />` | `STEPS` sobre `SEGUROS` | Piezas centradas |
| `<StepsIsotipo />` | Solo la huella | Ícono PWA, espacios reducidos, texturas |

`<Logo />` (`logo.tsx`) elige la versión (`horizontal` | `vertical` |
`isotipo`) y **solo aplica el vector STEPS al tenant `steps`**: los demás
tenants muestran su `logo_url` o un wordmark tipográfico neutro.

Copias estáticas en `public/brand/` (`navy`, `cobalt`, `blanco`) para correos,
OG images y entregas a terceros.

---

## 4. Motivos gráficos

- `<FootprintWatermark />` / clase `.texture-huellas` — huellas del isotipo en
  trazo, repetidas como marca de agua. Implementada con `mask-image`, de modo
  que toma el color del texto (`currentColor`) y sirve sobre fondo claro u
  oscuro.
- `.texture-puntos` — retícula de puntos como fondo repetible.

El motivo de triángulo del diseño anterior se retiró: no existe en el manual.

El marco en "L" con la retícula de puntos —la firma de esquina de cada lámina
del manual— también se retiró del sitio: sobre las fotos de los héroes
ensuciaba la imagen. Queda en el historial de git por si se recupera.

---

## 5. Componentes base (`globals.css`)

| Clase | Qué es |
|---|---|
| `.btn-primary` | Cápsula azul profundo, hover cobalt |
| `.btn-accent` | Cápsula cobalt con sombra cobalt |
| `.btn-outline` | Cápsula de contorno |
| `.btn-light` | Cápsula blanca para fondos oscuros |
| `.card-soft` | Tarjeta blanca, borde gris azulado, sombra tintada de azul profundo |
| `.field` | Campo de formulario (usado por todos los formularios de la app) |
| `.pill-label` / `<Eyebrow />` | Etiqueta de sección con el cuadrado cobalt de la retícula |
| `.brand-gradient` | Degradado de marca con texto blanco |

La forma de cápsula de los botones no es decorativa: repite la silueta
redondeada de la huella del isotipo. Los acentos pequeños (punto de la
etiqueta, retícula) son **cuadrados**, como en el manual.

---

## 6. PWA

- `theme_color`: cobalt `#2F5AA6` · `background_color`: azul profundo `#000831`.
- Ícono generado en `/pwa-icon/[size]`: cuadro cobalt con la huella blanca,
  igual que la lámina "App icon" del manual.
