import { ImageResponse } from 'next/og'

export const runtime = 'edge'

/**
 * Iconos PWA (PNG): /pwa-icon/192 y /pwa-icon/512.
 *
 * Sigue la lamina "App icon" del manual de identidad: cuadro cobalt blue con
 * el isotipo (la huella) en blanco. El vector es el oficial del manual.
 */
const HUELLA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 69.02 161.95" fill="#ffffff"><g transform="translate(-467.12 -535.13)"><path d="M526.96 646.87C526.96 646.87 536.14 670.93 531.2 681.82C526.25 692.71 520.75 694.03 513.42 695.56C506.09 697.08 493.9 691.88 489.62 681.12C485.85 671.63 483.08 652.6 483.08 652.6C483.08 652.6 489.89 654.57 498.15 652.85C506.42 651.14 526.96 646.87 526.96 646.87Z"/><path d="M528.02 570.91C528.02 570.91 532.14 589.08 530.12 595.63L491.56 603.64C485.8 604.84 480.15 601.13 478.96 595.36L476.11 581.69L528.02 570.91Z"/><path d="M493.99 615.75L526.91 608.92C524.85 615.53 521.59 627.85 523.74 633.94L491.88 640.55C486.63 641.65 481.14 639.36 478.51 634.68C478.39 634.46 478.27 634.23 478.15 633.98C474.43 626.54 467.12 608.27 467.35 598.71C467.35 598.71 468.83 612.92 486.97 615.92C489.3 616.3 491.68 616.24 493.99 615.75Z"/><path d="M523.87 558.72L467.66 570.39C472.24 552.91 476.92 542.33 494.27 538.73C511.61 535.13 523.87 558.72 523.87 558.72Z"/></g></svg>`

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params
  const s = Math.max(48, Math.min(1024, Number(size) || 512))

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#2F5AA6', // Cobalt blue de marca
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(HUELLA_SVG)}`}
          alt=""
          width={s * 0.3}
          height={s * 0.7}
        />
      </div>
    ),
    { width: s, height: s }
  )
}
