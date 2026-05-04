import Link from 'next/link'
import { Lightbulb, Mail } from 'lucide-react'

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
  return (
    <footer className="mt-12 sm:mt-16">

      {/* ── Newsletter CTA band ── */}
      <div style={{ background: '#0d1a12', borderTop: '1px solid rgba(0,166,81,0.25)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-12">

            {/* Copy */}
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

            {/* Form */}
            <div className="w-full sm:w-80 shrink-0" id="newsletter">
              <NewsletterForm variant="dark" />
              <p className="text-[10px] text-white/30 mt-1.5">No spam. Unsubscribe any time.</p>
            </div>

          </div>
        </div>
      </div>

      {/* ── Main footer ── */}
      <div
        className="border-t"
        style={{ background: 'var(--dc-surface)', borderColor: 'var(--dc-border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

          {/* ── Mobile layout — minimal (tab bar handles navigation) ── */}
          <div className="sm:hidden space-y-4">
            <Link href="/" aria-label="Dhaka Chronicles — Home" className="inline-block">
              <img src="/dc-logo-black.svg" alt="Dhaka Chronicles" className="h-8 w-auto" />
            </Link>
            <FooterSocials />
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--dc-text-muted)' }}>
              © {new Date().getFullYear()} Dhaka Chronicles — Bangladesh&apos;s leading independent digital news platform.{' '}
              Built by{' '}
              <a href="https://noeticstudio.net" target="_blank" rel="noopener noreferrer" className="text-dc-green hover:underline">
                NOÉTIC Studio
              </a>.
            </p>
          </div>

          {/* ── Desktop layout ── */}
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
              © {new Date().getFullYear()} Dhaka Chronicles. All rights reserved.{' '}
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
    </footer>
  )
}
