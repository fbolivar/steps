# Logotipos de aseguradoras aliadas

Cada archivo de esta carpeta se publica automáticamente en el listado de
`/aliados` y en la franja de aliados de la home. **No hay que tocar código**:
basta con dejar el archivo aquí con el nombre exacto.

## Nombres de archivo esperados

El archivo se declara en el campo `logo` de `PARTNERS`
(`src/shared/constants/site.ts`), **con extensión**. Si una aseguradora no
tiene `logo`, su tarjeta muestra el nombre en texto; por eso el listado nunca
se ve roto mientras llegan los que faltan.

## Estado actual

Publicados (19): afiancol, aseguradora-solidaria, axa-colpatria, bmi, cesce,
colmedica, confianza, equidad, hdi, liberty, mapfre, previsora,
qualitas-assistance, sbs, seguros-bolivar, seguros-del-estado,
seguros-mundial, sura, zurich.

Pendiente (1), hoy en texto:

| Aseguradora | Por qué |
|---|---|
| Grancolombiana | La compañía está en liquidación y no tiene sitio activo. |

Dos archivos no salieron de la web de la compañía: `zurich.svg` (CDN
corporativo de Zurich, aportado por el cliente) y `seguros-mundial.png`
(seeklogo, aportado por el cliente; se verificó que la forma coincide con la
versión oficial de su web, y trae fondo blanco opaco en vez de transparente).

Todos los publicados se tomaron de la web oficial de cada compañía. Se
recortaron los márgenes transparentes y se reescalaron a 120 px de alto; no se
alteró color ni proporción.

## Formato

- **SVG** preferido (escala sin pérdida y pesa poco).
- Versión **monocroma u horizontal sobre fondo transparente**; las tarjetas son
  blancas, así que un logo con fondo propio se verá como un recuadro.
- Altura visual objetivo: 48 px en `/aliados`, 32 px en la home. El SVG se
  ajusta solo (`object-contain`), pero conviene que venga recortado sin márgenes
  grandes.

## Procedencia (importante)

Son **marcas registradas de cada aseguradora**. Lo correcto es usar el archivo
que entrega cada compañía a sus intermediarios (kit de marca / sala de prensa),
no una copia tomada de internet: las versiones que circulan suelen estar
desactualizadas, en baja resolución o corresponder a la matriz global y no a la
filial en Colombia.

Cada compañía publica además sus condiciones de uso de marca (proporciones,
área de reserva, fondos permitidos); conviene revisarlas antes de publicar.
