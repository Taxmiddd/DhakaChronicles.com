'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Home, Mail, AlertTriangle, MapPin } from 'lucide-react'

const REASSURANCES = [
  'Our engineers move faster than a breaking news cycle.',
  'No journalists were harmed in the making of this error.',
  'We fact-checked this error. It is, unfortunately, real.',
  'This will be corrected sooner than most governments correct policy.',
]

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[DC Error]', error)
  }, [error])

  const quip = REASSURANCES[Math.floor(Math.random() * REASSURANCES.length)]

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: 'var(--background)', color: 'var(--dc-text)' }}
    >
      {/* Minimal top bar */}
      <div className="w-full px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--dc-border)' }}>
        <Link href="/" className="font-headline font-black text-xl tracking-tight" style={{ color: 'var(--dc-text)' }}>
          Dhaka<span className="text-dc-green">Chronicles</span>
        </Link>
        <a
          href="mailto:thenoeticstudio@gmail.com"
          className="flex items-center gap-1.5 text-sm font-medium text-dc-green hover:underline"
        >
          <Mail className="w-3.5 h-3.5" />
          Report this
        </a>
      </div>

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full flex flex-col items-center text-center">
        {/* Animated icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
          style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
        >
          <AlertTriangle className="w-9 h-9 text-dc-green" />
        </div>

        {/* Code */}
        <div
          className="font-headline font-black text-[6rem] sm:text-[9rem] leading-none select-none mb-4"
          style={{
            background: 'linear-gradient(135deg, #F42A41 0%, rgba(244,42,65,0.3) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          500
        </div>

        <h1 className="font-headline font-black text-3xl sm:text-4xl mb-4" style={{ color: 'var(--dc-text)' }}>
          The newsroom had a moment.
        </h1>

        <p className="text-lg mb-3 max-w-lg" style={{ color: 'var(--dc-text-muted)' }}>
          Something broke on our end. It wasn&apos;t a hack, a typo, or government interference —
          just a server error.
        </p>

        <p className="text-sm italic mb-10" style={{ color: 'var(--dc-text-muted)' }}>
          &ldquo;{quip}&rdquo;
        </p>

        {/* Error digest for support */}
        {error.digest && (
          <div
            className="mb-8 px-4 py-2 rounded-lg text-xs font-mono"
            style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)', color: 'var(--dc-text-muted)' }}
          >
            Reference: <span className="text-dc-green">{error.digest}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-dc-green text-white rounded-lg font-semibold hover:bg-dc-green-dark transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors hover:scale-105"
            style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)', color: 'var(--dc-text)' }}
          >
            <Home className="w-4 h-4 text-dc-green" />
            Go home
          </Link>
          <a
            href="mailto:thenoeticstudio@gmail.com?subject=DC Error Report&body=Error reference: "
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors hover:scale-105"
            style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)', color: 'var(--dc-text)' }}
          >
            <Mail className="w-4 h-4 text-dc-green" />
            Contact support
          </a>
        </div>

        {/* About DC snippet */}
        <div
          className="w-full rounded-2xl p-6 text-left"
          style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-dc-green mb-3">
            About Dhaka Chronicles
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--dc-text-muted)' }}>
            Bangladesh&apos;s independent digital newsroom — launched 17 July 2024 in Dhaka.
            We publish in both English and বাংলা, covering politics, business, culture, and the stories
            that matter to 170 million people. Editorially independent, reader-first, always.
          </p>
          <Link href="/about" className="inline-flex items-center gap-1 text-sm font-medium text-dc-green mt-3 hover:underline">
            Learn more about us →
          </Link>
        </div>
      </main>

      {/* Footer with Noetic Studio */}
      <footer
        className="w-full px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm"
        style={{ borderTop: '1px solid var(--dc-border)', color: 'var(--dc-text-muted)' }}
      >
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-dc-green" />
          <span>Built & maintained by</span>
          <a
            href="mailto:thenoeticstudio@gmail.com"
            className="font-semibold text-dc-green hover:underline ml-0.5"
          >
            NOÉTIC Studio
          </a>
          <span className="mx-1 opacity-40">·</span>
          <a href="mailto:thenoeticstudio@gmail.com" className="flex items-center gap-1 hover:text-dc-green transition-colors">
            <Mail className="w-3.5 h-3.5" />
            thenoeticstudio@gmail.com
          </a>
        </div>
        <span className="opacity-50">© {new Date().getFullYear()} Dhaka Chronicles</span>
      </footer>
    </div>
  )
}
