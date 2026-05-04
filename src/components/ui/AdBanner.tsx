'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'

export type AdPosition =
  | 'homepage_banner'
  | 'article_sidebar'
  | 'article_inline'
  | 'category_banner'
  | 'feed_native'
  | 'sticky_mobile'
  | 'before_footer'
  | 'widget_mid'
  | 'widget_right'

export type AdVariant = 'banner' | 'native' | 'bite' | 'sticky'

interface Ad {
  id: string
  image_url: string
  link_url: string
  title: string
  client_name: string
  size?: string
}

interface AdBannerProps {
  position: AdPosition
  variant?: AdVariant
  className?: string
}

export default function AdBanner({ position, variant = 'banner', className = 'w-full h-[90px]' }: AdBannerProps) {
  const [ad, setAd] = useState<Ad | null | undefined>(undefined)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch(`/api/ads?position=${position}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => setAd(data))
      .catch(() => setAd(null))
  }, [position])

  const trackClick = useCallback(() => {
    if (ad) fetch(`/api/ads/click?id=${ad.id}`, { method: 'POST' }).catch(() => {})
  }, [ad])

  if (ad === undefined || ad === null || dismissed) return null

  // ── Sticky bottom bar (mobile only, dismissible) ──────────────────────────
  if (variant === 'sticky') {
    return (
      <div
        className="fixed bottom-14 left-0 right-0 z-50 sm:hidden"
        style={{
          background: 'var(--background)',
          borderTop: '1px solid var(--dc-border)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
        }}
      >
        <div className="flex items-center h-[60px] px-3 gap-2">
          <a
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={trackClick}
            className="flex-1 flex items-center gap-3 min-w-0 overflow-hidden"
          >
            <div
              className="relative w-11 h-11 rounded-lg shrink-0 overflow-hidden"
              style={{ background: 'var(--dc-surface-2)' }}
            >
              <Image
                src={ad.image_url}
                alt={ad.title}
                fill
                className="object-cover"
                sizes="44px"
                unoptimized={ad.image_url.startsWith('http')}
              />
            </div>
            <div className="min-w-0">
              <span
                className="block text-[9px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: 'var(--dc-green)' }}
              >
                Sponsored
              </span>
              <p
                className="text-xs font-semibold leading-tight truncate"
                style={{ color: 'var(--dc-text)' }}
              >
                {ad.title}
              </p>
            </div>
          </a>
          <a
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={trackClick}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-white whitespace-nowrap"
            style={{ background: 'var(--dc-green)' }}
          >
            Learn More
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-lg leading-none"
            style={{ color: 'var(--dc-text-muted)' }}
            aria-label="Close ad"
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  // ── Native card — blends seamlessly into article feed ────────────────────
  if (variant === 'native') {
    return (
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={trackClick}
        className="group flex gap-3 py-3"
        aria-label={`Sponsored: ${ad.title}`}
      >
        <div
          className="relative w-20 h-[60px] rounded-lg overflow-hidden shrink-0"
          style={{ background: 'var(--dc-surface-2)' }}
        >
          <Image
            src={ad.image_url}
            alt={ad.title}
            fill
            className="object-cover"
            sizes="80px"
            unoptimized={ad.image_url.startsWith('http')}
          />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <span
            className="text-[9px] font-bold uppercase tracking-widest block mb-1"
            style={{ color: 'var(--dc-text-muted)' }}
          >
            Sponsored · {ad.client_name}
          </span>
          <p
            className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-dc-green transition-colors"
            style={{ color: 'var(--dc-text)' }}
          >
            {ad.title}
          </p>
        </div>
      </a>
    )
  }

  // ── Bite-sized compact strip ─────────────────────────────────────────────
  if (variant === 'bite') {
    return (
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={trackClick}
        className={`group flex items-center gap-3 rounded-xl overflow-hidden px-3 ${className}`}
        style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
        aria-label={`Sponsored: ${ad.title}`}
      >
        <div
          className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0"
          style={{ background: 'var(--dc-surface-2)' }}
        >
          <Image
            src={ad.image_url}
            alt={ad.title}
            fill
            className="object-cover"
            sizes="36px"
            unoptimized={ad.image_url.startsWith('http')}
          />
        </div>
        <span
          className="text-xs font-semibold truncate flex-1 group-hover:text-dc-green transition-colors"
          style={{ color: 'var(--dc-text)' }}
        >
          {ad.title}
        </span>
        <span
          className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ background: 'var(--dc-surface-2)', color: 'var(--dc-text-muted)' }}
        >
          Ad
        </span>
      </a>
    )
  }

  // ── Square 1000×1000 ────────────────────────────────────────────────────
  if (ad.size === 'square-1000') {
    return (
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="relative block rounded-xl overflow-hidden"
        style={{ width: '100%', maxWidth: '1000px', aspectRatio: '1/1' }}
        onClick={trackClick}
        aria-label={`Advertisement: ${ad.title}`}
      >
        <Image
          src={ad.image_url}
          alt={ad.title}
          fill
          className="object-cover"
          sizes="(max-width: 1000px) 100vw, 1000px"
          unoptimized={ad.image_url.startsWith('http')}
        />
        <span
          className="absolute top-1.5 right-1.5 z-10 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.65)' }}
        >
          Ad
        </span>
      </a>
    )
  }

  // ── Auto: natural image dimensions, no fixed height ─────────────────────
  if (ad.size === 'auto') {
    return (
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="relative block rounded-xl overflow-hidden"
        onClick={trackClick}
        aria-label={`Advertisement: ${ad.title}`}
      >
        <Image
          src={ad.image_url}
          alt={ad.title}
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto"
          unoptimized={ad.image_url.startsWith('http')}
        />
        <span
          className="absolute top-1.5 right-1.5 z-10 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.65)' }}
        >
          Ad
        </span>
      </a>
    )
  }

  // ── Default: banner (full-width image) ───────────────────────────────────
  return (
    <a
      href={ad.link_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`relative block overflow-hidden rounded-xl ${className}`}
      onClick={trackClick}
      aria-label={`Advertisement: ${ad.title}`}
    >
      <Image
        src={ad.image_url}
        alt={ad.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 728px"
        unoptimized={ad.image_url.startsWith('http')}
      />
      <span
        className="absolute top-1.5 right-1.5 z-10 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
        style={{ background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.65)' }}
      >
        Ad
      </span>
    </a>
  )
}
