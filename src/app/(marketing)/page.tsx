import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ShieldCheck,
  Phone,
  Star,
  FileText,
  Settings2,
  ShieldCheck as ShieldStep,
} from 'lucide-react'
import { SocialRow } from '@/shared/components/social-icons'
import { getActiveTenant } from '@/shared/lib/tenant'
import { getInsuranceLines } from '@/features/site/services/content'
import { WhatsAppButton } from '@/shared/components/whatsapp-button'
import { Container, Section, Eyebrow } from '@/shared/components/layout-primitives'
import { ImagePlaceholder } from '@/shared/components/image-placeholder'
import { PHOTO, photo } from '@/shared/lib/photos'
import {
  PARTNERS,
  COMPANY,
  ABOUT_BULLETS,
  TRUST_STATS,
  PROCESS_STEPS,
  TEAM,
  TESTIMONIAL,
  BLOG_POSTS,
} from '@/shared/constants/site'

const STEP_ICONS = [FileText, Settings2, ShieldStep]

export default async function HomePage() {
  const tenant = await getActiveTenant()
  const personas = await getInsuranceLines(tenant.id, 'personas')
  const services = personas.slice(0, 4)

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <ImagePlaceholder
          rounded="rounded-none"
          showLabel={false}
          src={PHOTO.hero}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-primary/85 to-brand-primary/30" />
        <Container className="relative py-24 lg:py-36">
          <div className="max-w-2xl animate-fade-up text-white">
            <Eyebrow onDark>Somos {tenant.nombre_comercial}</Eyebrow>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              Protección para ti, siempre.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-white/75">{COMPANY.mision}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/nosotros" className="btn-accent">
                Conócenos <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/cotizar" className="btn-outline border-white/30 text-white hover:bg-white/10">
                Cotizar ahora
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ===== STATS ===== */}
      <Section className="py-14">
        <Container className="grid items-center gap-8 md:grid-cols-2">
          <h2 className="text-2xl font-bold text-navy-900 sm:text-3xl">
            Servicio excepcional, compromiso inquebrantable, siempre para ti.
          </h2>
          <dl className="grid grid-cols-3 gap-6">
            {TRUST_STATS.map((s) => (
              <div key={s.label}>
                <dt className="font-heading text-3xl font-extrabold text-brand-accent sm:text-4xl">{s.value}</dt>
                <dd className="mt-1 text-xs text-navy-900/55">{s.label}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      {/* ===== ABOUT ===== */}
      <Section variant="mist">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <ImagePlaceholder src={PHOTO.about} className="aspect-[4/3] w-full" />
          <div>
            <Eyebrow>Nosotros</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold text-navy-900 sm:text-4xl">Porque tu tranquilidad importa</h2>
            <p className="mt-4 text-navy-900/65">{COMPANY.vision}</p>
            <ul className="mt-6 space-y-3">
              {ABOUT_BULLETS.map((b) => (
                <li key={b} className="flex items-center gap-3 text-navy-900/80">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent/15 text-brand-accent">
                    <Check className="h-4 w-4" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/nosotros" className="btn-primary">
                Conócenos
              </Link>
              <div className="rounded-2xl bg-brand-primary px-6 py-4 text-white">
                <p className="font-heading text-2xl font-extrabold">+15</p>
                <p className="text-xs text-white/70">Aseguradoras aliadas</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ===== SERVICES ===== */}
      <Section>
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Nuestros seguros</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold text-navy-900 sm:text-4xl">
              Seguros confiables, cuando los necesites
            </h2>
            <p className="mt-4 text-navy-900/60">
              Comparamos entre más de 15 aseguradoras para encontrar la protección que se ajusta a ti.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {services.map((line) => (
              <Link
                key={line.id}
                href={`/seguros/${line.segment}/${line.slug}`}
                className="card-soft group flex gap-4 p-4 transition-shadow hover:shadow-card"
              >
                <ImagePlaceholder src={photo(line.slug, 400, 400)} className="h-28 w-28 shrink-0" />
                <div className="flex flex-1 flex-col">
                  <span className="mb-1 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/8 text-brand-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <h3 className="font-semibold text-navy-900">{line.name}</h3>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm text-navy-900/55">{line.short_description}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary">
                    Conocer más <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/seguros/personas" className="btn-primary">
              Ver más seguros <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </Section>

      {/* ===== TESTIMONIALS + PARTNERS ===== */}
      <Section variant="mist">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Testimonios</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold text-navy-900 sm:text-4xl">Vidas protegidas, clientes felices</h2>
            <p className="mt-4 max-w-md text-navy-900/60">
              La confianza de quienes protegemos es nuestro mejor respaldo.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="h-8 w-8 rounded-full bg-brand-accent/30 ring-2 ring-mist" />
                ))}
              </div>
              <span className="text-sm font-semibold text-navy-900">+ clientes satisfechos</span>
            </div>
          </div>
          <div className="card-soft relative p-8">
            <div className="flex gap-1 text-brand-accent">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-4 text-navy-900/80">“{TESTIMONIAL.quote}”</p>
            <div className="mt-6 flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-brand-primary/15" />
              <div>
                <p className="text-sm font-semibold text-navy-900">{TESTIMONIAL.author}</p>
                <p className="text-xs text-navy-900/50">{TESTIMONIAL.role}</p>
              </div>
            </div>
          </div>
        </Container>

        <Container className="mt-14">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-navy-900/40">
            Nuestros aliados aseguradores
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {PARTNERS.slice(0, 8).map((p) => (
              <span key={p} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-navy-900/45 shadow-soft">
                {p}
              </span>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===== TEAM ===== */}
      <Section>
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Nuestro equipo</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold text-navy-900 sm:text-4xl">Asesoría profesional, trato cercano</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((m) => (
              <div key={m.name} className="card-soft overflow-hidden text-center">
                <ImagePlaceholder src={photo(`team-${m.name}`, 500, 500)} rounded="rounded-none" className="aspect-square w-full" />
                <div className="p-4">
                  <p className="font-semibold text-navy-900">{m.name}</p>
                  <p className="text-xs text-navy-900/50">{m.role}</p>
                  <SocialRow className="mt-3 flex justify-center gap-3 text-navy-900/40" iconClass="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===== HOW WE WORK ===== */}
      <Section variant="mist">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <ImagePlaceholder src={PHOTO.advisory} className="aspect-[4/3] w-full" />
            <div className="absolute -bottom-5 left-5 flex items-center gap-3 rounded-2xl bg-brand-primary px-5 py-3 text-white shadow-card">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <Phone className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[0.65rem] uppercase tracking-wide text-white/60">Estamos para ti</p>
                <p className="text-sm font-semibold">{tenant.whatsapp_number ?? 'Escríbenos por WhatsApp'}</p>
              </div>
            </div>
          </div>
          <div>
            <Eyebrow>Cómo trabajamos</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold text-navy-900 sm:text-4xl">Asegurarte es fácil</h2>
            <p className="mt-4 text-navy-900/60">Tres pasos y un asesor humano de principio a fin.</p>
            <div className="mt-8 space-y-6">
              {PROCESS_STEPS.map((step, i) => {
                const Icon = STEP_ICONS[i]
                return (
                  <div key={step.title} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary/8 text-brand-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-navy-900">
                        {i + 1}. {step.title}
                      </h3>
                      <p className="mt-1 text-sm text-navy-900/60">{step.body}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Container>
      </Section>

      {/* ===== CTA BAND (foto) ===== */}
      <section className="relative overflow-hidden">
        <ImagePlaceholder rounded="rounded-none" showLabel={false} src={PHOTO.ctaBand} className="absolute inset-0" />
        <div className="absolute inset-0 bg-brand-primary/80" />
        <Container className="relative py-20 text-center text-white">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold sm:text-4xl">
            {tenant.nombre_comercial}, protegiéndote siempre
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <WhatsAppButton number={tenant.whatsapp_number} label="Contactar asesor" variant="accent" />
            <Link href="/cotizar" className="btn-outline border-white/30 text-white hover:bg-white/10">
              Cotizar cobertura
            </Link>
          </div>
        </Container>
      </section>

      {/* ===== BLOG ===== */}
      <Section>
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Aprende de seguros</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold text-navy-900 sm:text-4xl">Consejos claros, decisiones simples</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {BLOG_POSTS.map((post) => (
              <article key={post.title} className="card-soft overflow-hidden">
                <ImagePlaceholder src={photo(`blog-${post.title}`, 640, 400)} rounded="rounded-none" className="aspect-[16/10] w-full" />
                <div className="p-5">
                  <p className="text-xs font-medium text-brand-accent">
                    {post.date} · {post.tag}
                  </p>
                  <h3 className="mt-2 font-semibold leading-snug text-navy-900">{post.title}</h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary">
                    Leer más <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===== FINAL CTA ===== */}
      <Section className="pt-0">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-brand-primary">
            <div className="grid items-center gap-6 md:grid-cols-2">
              <ImagePlaceholder src={PHOTO.finalCta} showLabel={false} rounded="rounded-none" className="h-full min-h-[220px] w-full" />
              <div className="p-8 text-white sm:p-12">
                <h2 className="text-3xl font-bold sm:text-4xl">Protege lo que más importa</h2>
                <p className="mt-3 text-white/70">
                  Cuéntanos qué necesitas asegurar y un asesor te contacta con la mejor alternativa.
                </p>
                <Link href="/cotizar" className="btn-accent mt-6">
                  Empezar ahora <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
