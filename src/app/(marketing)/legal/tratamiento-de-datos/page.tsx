import type { Metadata } from 'next'
import { getActiveTenant } from '@/shared/lib/tenant'
import { Container, Section } from '@/shared/components/layout-primitives'

export const metadata: Metadata = { title: 'Política de tratamiento de datos personales' }

export default async function DataPolicyPage() {
  const tenant = await getActiveTenant()
  const responsable = tenant.razon_social ?? tenant.nombre_comercial

  return (
    <Section>
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">
          Política de tratamiento de datos personales
        </h1>
        <p className="mt-3 text-sm text-navy-900/50">
          En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013 (Habeas Data).
        </p>

        <div className="mt-10 space-y-8 text-navy-900/80">
          <section>
            <h2 className="text-xl font-semibold text-navy-900">1. Responsable del tratamiento</h2>
            <p className="mt-2">
              {responsable}
              {tenant.nit ? `, identificada con NIT ${tenant.nit}` : ''}
              {tenant.address ? `, con domicilio en ${tenant.address}` : ''}
              {tenant.contact_email ? `. Correo de contacto: ${tenant.contact_email}.` : '.'}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">2. Datos que recolectamos</h2>
            <p className="mt-2">
              Recolectamos datos de identificación y contacto (nombre, número de documento, teléfono, correo) y los
              datos del riesgo a asegurar que usted nos proporcione al solicitar una cotización o asesoría.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">3. Finalidad</h2>
            <p className="mt-2">
              Los datos se utilizan exclusivamente para gestionar su solicitud de cotización, contactarlo con un
              asesor, intermediar la póliza ante las aseguradoras aliadas y cumplir obligaciones legales. No
              comercializamos sus datos con terceros ajenos a esta finalidad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">4. Seguridad y retención</h2>
            <p className="mt-2">
              Aplicamos medidas técnicas y administrativas para proteger sus datos, incluyendo cifrado en tránsito y
              en reposo, y control de acceso por roles. Conservamos los datos únicamente durante el tiempo necesario
              para las finalidades descritas y los plazos legales aplicables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900">5. Sus derechos</h2>
            <p className="mt-2">
              Usted puede conocer, actualizar, rectificar y suprimir sus datos, así como revocar la autorización,
              escribiendo a {tenant.contact_email ?? 'nuestro correo de contacto'}. Atenderemos su solicitud en los
              términos de ley.
            </p>
          </section>

          <p className="rounded-xl bg-brand-primary/5 p-4 text-sm text-navy-900/60">
            Documento base para revisión legal. Debe ser validado por el área jurídica del cliente antes de la puesta
            en producción y del primer dato real recolectado.
          </p>
        </div>
      </Container>
    </Section>
  )
}
