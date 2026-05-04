import Link from 'next/link'
import { Lightbulb, Mail } from 'lucide-react'
import { Rss } from 'lucide-react'

import { NewsletterForm } from '@/components/layout/NewsletterForm'
import { FooterSocials } from '@/components/layout/FooterSocials'

const FOOTER_SECTIONS = [
  {
    title: 'Sections',
    links: [
      { label: 'Politics',     href: '/category/politics' },
      { label: 'Business',     href: '/category/business' },
      { label: 'Sports',       href: '/category/sports' },
      { label: 'Culture',      href: '/category/culture' },
      { label: 'Technology',   href: '/category/technology' },
      { label: 'Education',    href: '/category/education' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us',  href: '/about' },
      { label: 'Our Team',  href: '/team' },
      { label: 'Contact',   href: '/contact' },
      { label: 'Advertise', href: '/advertise' },
      { label: 'Careers',   href: '/careers' },
      { label: 'Podcasts',  href: '/podcasts' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy',   href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy',    href: '/cookies' },
    ],
  },
]

export function PublicFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-12 sm:mt-16">

      {/* ══════════════════════════════════════════════════ */}
      {/*  LIGHT MODE FOOTER (hidden in dark mode)          */}
      {/* ══════════════════════════════════════════════════ */}
      <div className="light-only">

        {/* Newsletter CTA band */}
        <div style={{ background: '#0d1a12', borderTop: '1px solid rgba(0,166,81,0.25)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-12">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-3.5 h-3.5 text-dc-green" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-dc-green">
                    Newsletter
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-headline font-bold text-white leading-snug">
                  Bangladesh&apos;s story, in your inbox.
                </h2>
                <p className="text-xs text-white/50 mt-1.5 max-w-sm hidden sm:block">
                  Morning briefing — curated headlines and analysis. Free, always.
                </p>
              </div>
              <div className="w-full sm:w-80 shrink-0" id="newsletter">
                <NewsletterForm variant="dark" />
                <p className="text-[10px] text-white/30 mt-1.5">No spam. Unsubscribe any time.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main footer */}
        <div
          className="border-t"
          style={{ background: 'var(--dc-surface)', borderColor: 'var(--dc-border)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

            {/* Mobile layout */}
            <div className="sm:hidden">
              {/* Logo + socials */}
              <div className="flex items-center justify-between mb-6">
                <Link href="/" aria-label="Dhaka Chronicles — Home">
                  <img src="/dc-logo-black.svg" alt="Dhaka Chronicles" className="h-8 w-auto" />
                </Link>
                <FooterSocials />
              </div>

              {/* Nav links — 2 col + Legal full-width */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-6 mb-6">
                {FOOTER_SECTIONS.slice(0, 2).map((section) => (
                  <div key={section.title}>
                    <h4 className="font-bold text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--dc-text)' }}>
                      {section.title}
                    </h4>
                    <ul className="space-y-2">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <Link href={link.href} className="text-sm transition-colors hover:text-dc-green" style={{ color: 'var(--dc-text-muted)' }}>
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {/* Legal row */}
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-6">
                {FOOTER_SECTIONS[2].links.map((link) => (
                  <Link key={link.href} href={link.href} className="text-xs transition-colors hover:text-dc-green" style={{ color: 'var(--dc-text-muted)' }}>
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Copyright */}
              <p className="text-[11px]" style={{ color: 'var(--dc-text-muted)' }}>
                © {year} Dhaka Chronicles. Built by{' '}
                <a href="https://noeticstudio.net" target="_blank" rel="noopener noreferrer" className="text-dc-green hover:underline">
                  NOÉTIC Studio
                </a>.
              </p>
            </div>

            {/* Desktop layout */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-8">

              {/* Brand column */}
              <div className="lg:col-span-2 space-y-5">
                <Link href="/" aria-label="Dhaka Chronicles — Home" className="inline-flex">
                  <img src="/dc-logo-black.svg" alt="Dhaka Chronicles" className="h-14 w-auto" />
                </Link>
                <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--dc-text-muted)' }}>
                  Bangladesh&apos;s leading independent digital news platform — reliable journalism
                  since 17 July 2024.
                </p>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--dc-text-muted)' }}>
                    Follow us
                  </p>
                  <FooterSocials />
                </div>
                <Link
                  href="/tips"
                  className="inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border transition-colors hover:border-dc-green hover:text-dc-green"
                  style={{ color: 'var(--dc-text-muted)', borderColor: 'var(--dc-border)' }}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  Submit a news tip
                </Link>
              </div>

              {/* Link columns */}
              {FOOTER_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h4
                    className="font-bold text-xs uppercase tracking-widest mb-4"
                    style={{ color: 'var(--dc-text)' }}
                  >
                    {section.title}
                  </h4>
                  <ul className="space-y-2.5">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm transition-colors hover:text-dc-green"
                          style={{ color: 'var(--dc-text-muted)' }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div
              className="mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
              style={{ borderTop: '1px solid var(--dc-border)', color: 'var(--dc-text-muted)' }}
            >
              <p>
                © {year} Dhaka Chronicles. All rights reserved.{' '}
                Built by{' '}
                <a
                  href="https://noeticstudio.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dc-green hover:underline"
                >
                  NOÉTIC Studio
                </a>.
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-dc-green animate-pulse" />
                <span>dhakachronicles.com</span>
              </div>
            </div>
          </div>
        </div>

      </div>{/* /light-only */}

      {/* ══════════════════════════════════════════════════ */}
      {/*  DARK MODE FOOTER — cinematic editorial design    */}
      {/* ══════════════════════════════════════════════════ */}
      <div
        className="dark-only"
        style={{ background: '#080808', borderTop: '4px solid #00A651' }}
      >

        {/* ── Newsletter band ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0d1a12 0%, #060d09 100%)',
            borderBottom: '1px solid rgba(0,166,81,0.15)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-20">

              {/* Copy */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-3.5 h-3.5" style={{ color: '#00A651' }} />
                  <span
                    className="text-[10px] font-black uppercase tracking-[0.25em]"
                    style={{ color: '#00A651' }}
                  >
                    Free Newsletter
                  </span>
                </div>
                <h2 className="font-headline font-black text-white leading-tight text-2xl sm:text-3xl mb-2">
                  Bangladesh&apos;s story,<br className="hidden sm:block" /> in your inbox.
                </h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Morning briefing · Curated headlines · Free, always.
                </p>
              </div>

              {/* Form */}
              <div className="w-full lg:w-96 shrink-0" id="newsletter">
                <NewsletterForm variant="dark" />
                <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  No spam. Unsubscribe any time.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

          {/* Desktop */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-10">

            {/* Brand column */}
            <div className="lg:col-span-2 space-y-6">
              <Link href="/" aria-label="Dhaka Chronicles — Home" className="inline-flex">
                <img src="/dc-logo-white.svg" alt="Dhaka Chronicles" className="h-14 w-auto" />
              </Link>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Bangladesh&apos;s leading independent digital news platform —
                reliable journalism since 17 July 2024.
              </p>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                >
                  Follow Us
                </p>
                <FooterSocials />
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/tips"
                  className="inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                  style={{
                    color: 'rgba(255,255,255,0.35)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  Submit a news tip
                </Link>
                <a
                  href="/api/rss"
                  aria-label="RSS Feed"
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    color: 'rgba(255,255,255,0.35)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Rss className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.title}>
                <h4
                  className="text-[10px] font-bold uppercase tracking-widest mb-5"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                >
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors hover:text-dc-green"
                        style={{ color: 'rgba(255,255,255,0.45)' }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mobile */}
          <div className="sm:hidden">
            {/* Logo + socials */}
            <div className="flex items-center justify-between mb-6">
              <Link href="/" aria-label="Dhaka Chronicles — Home">
                <img src="/dc-logo-white.svg" alt="Dhaka Chronicles" className="h-9 w-auto" />
              </Link>
              <FooterSocials />
            </div>

            {/* Nav links — 2 col */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-6 mb-6">
              {FOOTER_SECTIONS.slice(0, 2).map((section) => (
                <div key={section.title}>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {section.title}
                  </h4>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="text-sm transition-colors hover:text-dc-green" style={{ color: 'rgba(255,255,255,0.45)' }}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Legal row */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-6">
              {FOOTER_SECTIONS[2].links.map((link) => (
                <Link key={link.href} href={link.href} className="text-xs transition-colors hover:text-dc-green" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            <p>
              © {year} Dhaka Chronicles. All rights reserved.{' '}
              Built by{' '}
              <a
                href="https://noeticstudio.net"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: '#00A651' }}
              >
                NOÉTIC Studio
              </a>.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-dc-green animate-pulse" />
              <span>dhakachronicles.com</span>
            </div>
          </div>
        </div>

      </div>{/* /dark-only */}

    </footer>
  )
}
