import { ImageResponse } from 'next/og'

export const runtime = 'edge'

/**
 * Íconos PWA generados (PNG). /pwa-icon/192 y /pwa-icon/512.
 * Cuadro teal de marca con el wordmark "S" — reemplazable por el logo real.
 */
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
          background: '#0E3B37',
          color: '#ffffff',
          fontSize: s * 0.5,
          fontWeight: 800,
          fontFamily: 'sans-serif',
          letterSpacing: -2,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
          <span>S</span>
          <div style={{ width: s * 0.24, height: s * 0.05, background: '#1E8175', borderRadius: s, marginTop: s * 0.04 }} />
        </div>
      </div>
    ),
    { width: s, height: s }
  )
}
