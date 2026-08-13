# Logotipos de aseguradoras aliadas

Cada archivo de esta carpeta se publica automáticamente en el listado de
`/aliados` y en la franja de aliados de la home. **No hay que tocar código**:
basta con dejar el archivo aquí con el nombre exacto.

## Nombres de archivo esperados

El nombre sale del campo `logo` de `PARTNERS` en
`src/shared/constants/site.ts`:

```
seguros-bolivar.svg      hdi.svg                 sura.svg
zurich.svg               axa-colpatria.svg       liberty.svg
seguros-del-estado.svg   seguros-mundial.svg     aseguradora-solidaria.svg
cesce.svg                sbs.svg                 afiancol.svg
equidad.svg              mapfre.svg              confianza.svg
previsora.svg            grancolombiana.svg      colmedica.svg
qualitas-assistance.svg  bmi.svg
```

Si un archivo no existe, la tarjeta muestra el nombre de la aseguradora en
texto. Por eso el listado nunca se ve roto mientras llegan los logotipos.

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
