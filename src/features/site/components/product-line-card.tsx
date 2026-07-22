import Link from 'next/link'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { ImagePlaceholder } from '@/shared/components/image-placeholder'
import { photo } from '@/shared/lib/photos'
import type { InsuranceLine } from '@/features/site/services/content'

/**
 * Tarjeta de línea de producto. Template ÚNICO parametrizado por contenido de
 * BD: añadir un producto = un registro más.
 */
export function ProductLineCard({ line }: { line: InsuranceLine }) {
  return (
    <Link
      href={`/seguros/${line.segment}/${line.slug}`}
      className="card-soft group flex flex-col overflow-hidden transition-shadow hover:shadow-card"
    >
      <ImagePlaceholder src={photo(line.slug, 640, 420)} rounded="rounded-none" className="aspect-[16/10] w-full" />
      <div className="flex flex-1 flex-col p-6">
        <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/8 text-brand-primary">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="text-lg font-semibold text-navy-900">{line.name}</h3>
        {line.short_description && (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-900/55">{line.short_description}</p>
        )}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary">
          Conocer más
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  )
}
