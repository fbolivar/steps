# Checklist / correo para Agentemotor

> `SUPUESTO A VALIDAR`: Agentemotor (agentemotor.com) parece ser un SaaS de
> acceso usuario/contraseña **sin API pública documentada**. Todo el diseño de
> integración (adaptadores A/B/C) depende de las respuestas a este cuestionario.
> Hasta obtenerlas, el sitio opera con el **Adaptador B (manual)**.

## Correo sugerido

**Para:** soporte/comercial de Agentemotor
**Asunto:** Integración técnica para agencia con sub-agentes — ¿API / webhooks?

Buenas tardes,

Somos **Grupo Step Seguros Ltda (STEPS SEGUROS)**, agencia de seguros. Estamos
montando nuestro portal de cotizaciones y quisiéramos evaluar una integración
técnica con Agentemotor. Agradecemos nos confirmen:

1. **API / Webhooks**
   - ¿Ofrecen una **API REST** (o GraphQL) para partners/agencias?
   - ¿Existen **webhooks** para recibir el resultado de una cotización?
   - ¿Hay documentación técnica y ambiente de **sandbox/pruebas**?

2. **Modelo agencia con sub-agentes**
   - ¿Soportan un esquema de **agencia con sub-agentes**, donde cada sub-agente
     tenga **sus propias credenciales**?
   - ¿La facturación/consumo se puede segmentar por sub-agente?

3. **Autenticación y seguridad**
   - ¿Qué mecanismo de autenticación usa la API (API key, OAuth2, JWT)?
   - ¿Permiten IP allow-listing y rotación de credenciales?

4. **Alcance funcional de la API**
   - ¿Qué ramos/líneas de producto están disponibles vía API?
   - ¿La respuesta incluye prima, coberturas y condiciones, en formato
     estructurado (JSON)?

5. **Comercial y SLA**
   - **Costo** de la integración (setup + mensual + por transacción, si aplica).
   - **SLA** de disponibilidad y tiempos de respuesta.
   - ¿Hay **términos de servicio** que restrinjan la automatización o el
     scraping de su interfaz? (relevante para decidir si el Adaptador C queda
     descartado).

Quedamos atentos. Gracias,
**Paula Andrea Moreno Montenegro** — stepsseguros@gmail.com

---

## Cómo cada respuesta cambia el diseño

| Respuesta de Agentemotor | Adaptador que habilitamos |
|---|---|
| Sí, hay API REST/webhook para partners | **A** (`AgentemotorApiAdapter`) — automatización real |
| No hay API, pero sí sub-agentes con login | **B** (manual) — el agente replica en su cuenta |
| No hay API ni sub-agentes | **B** (manual) con una sola cuenta compartida |
| Prohíben automatización de UI en su ToS | **C descartado** — no se implementa RPA |
| Permiten RPA y el cliente lo autoriza por escrito | **C** (`BrowserAutomationAdapter`) — solo con luz verde explícita |

> **Recordatorio (sección 3 del brief):** el Adaptador C (automatización de UI /
> RPA) **no se implementa** sin autorización explícita de Fernando **y**
> verificación de que los términos de servicio de Agentemotor no lo prohíben.
> Es el adaptador más frágil y de mayor riesgo legal/ToS.

## Dónde vive esto en el código

- Interfaz y adaptadores: [`src/features/quotes/services/adapter.ts`](../src/features/quotes/services/adapter.ts)
- Selección del adaptador activo: `getQuoteAdapter()` (por env `QUOTE_PROVIDER`, hoy `manual`)
- Punto de enganche: [`src/features/quotes/services/submit.ts`](../src/features/quotes/services/submit.ts)
