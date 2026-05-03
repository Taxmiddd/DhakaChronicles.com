import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Dhaka Chronicles — News from the Heart of Bangladesh'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Green accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: '#00A651',
          }}
        />

        {/* Subtle grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1.5px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Logo text */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: '#ffffff',
            marginBottom: 32,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            opacity: 0.5,
          }}
        >
          DHAKA CHRONICLES
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 24,
            maxWidth: 900,
          }}
        >
          News from the Heart of Bangladesh
        </div>

        <div
          style={{
            fontSize: 22,
            color: '#6B7280',
            textAlign: 'center',
          }}
        >
          dhakachronicles.com
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00A651' }} />
          <div
            style={{
              fontSize: 14,
              color: '#00A651',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Independent · Bilingual · Trusted
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
