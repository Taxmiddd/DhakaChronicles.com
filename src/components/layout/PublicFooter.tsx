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
      { label: 'All Sections', href: '/search' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us',  href: '/about' },
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
    <footer className="mt-16">

      {/* ── Newsletter CTA band ── */}
      <div style={{ background: '#0d1a12', borderTop: '1px solid rgba(0,166,81,0.25)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16">

            {/* Copy */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-dc-green" />
                <span className="text-xs font-bold uppercase tracking-widest text-dc-green">
                  Newsletter
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-headline font-bold text-white leading-snug">
                Bangladesh&apos;s story, in your inbox.
              </h2>
              <p className="text-sm text-white/50 mt-2 max-w-sm">
                The morning briefing — curated headlines, analysis, and what you actually need to know. Free, always.
              </p>
            </div>

            {/* Form */}
            <div className="w-full md:w-96 shrink-0" id="newsletter">
              <NewsletterForm variant="dark" />
              <p className="text-xs text-white/30 mt-2">No spam. Unsubscribe any time.</p>
            </div>

          </div>
        </div>
      </div>

      {/* ── Main footer ── */}
      <div
        className="border-t"
        style={{ background: 'var(--dc-surface)', borderColor: 'var(--dc-border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

            {/* Brand column */}
            <div className="lg:col-span-2 space-y-6">
              <Link href="/" aria-label="Dhaka Chronicles — Home" className="inline-flex">
                <img
                  src="/dc-logo-black.svg"
                  alt="Dhaka Chronicles"
                  className="h-14 w-auto"
                />
              </Link>

              <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--dc-text-muted)' }}>
                Bangladesh&apos;s leading independent digital news platform — reliable journalism
                since 2025.
              </p>

              {/* Social icons */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--dc-text-muted)' }}>
                  Follow us
                </p>
                <FooterSocials />
              </div>

              {/* Submit tip */}
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
            className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
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
