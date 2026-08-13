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

Publicados: los 20 aliados del listado.

Nota sobre "Seguros GranColombia": el aliado es la **agencia de seguros**
`segurosgrancolombia.com`, que no debe confundirse con la Aseguradora
Grancolombiana S.A. (en liquidación). Por eso el nombre en `PARTNERS` dice
GranColombia y no "Grancolombiana".

Tres archivos no salieron de la web de la compañía: `zurich.svg` (CDN
corporativo de Zurich, aportado por el cliente) y `seguros-mundial.png`
(seeklogo, aportado por el cliente; se verificó que la forma coincide con la
versión oficial de su web, y trae fondo blanco opaco en vez de transparente) y
`grancolombia.png` (web de la agencia, aportado por el cliente).

Todos los publicados se tomaron de la web oficial de cada compañía. Se
recortaron los márgenes transparentes y se reescalaron a 120 px de alto; no se
alteró color ni proporción.

## Cuidado con las versiones en blanco

Varias companias publican en su web el logo **en blanco**, pensado para fondos
oscuros. Sobre estas tarjetas (blancas) queda invisible. Paso con `cesce.svg`,
que se subio en su version blanca y hubo que reemplazarla por la azul de
`cesce.es`.

Antes de publicar un SVG, revisa que sus `fill` no sean todos `#FFFFFF`:

```sh
grep -o -E 'fill[=:][ ]*"?#?[0-9a-fA-F]{3,6}' public/logos/*.svg | sort -u
```

Ojo: renderizar el SVG con herramientas que ignoran CSS interno puede
enganar (pinta de negro lo que en el navegador sale blanco). La comprobacion
fiable es abrir la pagina en un navegador.

## Tamano visual (campo `ratio`)

Fijar la misma altura para todos hace que los logos compactos (HDI, Cesce) se
vean diminutos junto a los muy alargados (Mapfre, Previsora): el ojo compara
SUPERFICIE, no altura. Por eso cada entrada de `PARTNERS` lleva `ratio`
(ancho/alto del archivo) y `<PartnerLogo/>` le asigna mas o menos alto segun
ese valor.

Al agregar un logo, mide su proporcion y ponla en `ratio`. Y si el archivo es
SVG, comprueba que su `viewBox` no traiga aire alrededor del dibujo: el de
Cesce tenia un 46% de margen vacio y por eso se veia pequeno aunque el alto
fuera correcto. Recorta el viewBox al contenido antes de publicarlo.

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
