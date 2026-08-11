import Link from 'next/link'
import { Mail } from 'lucide-react'
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
      { label: 'Portfolio', href: '/portfolio' },
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
    <footer className="mt-16 bg-dc-surface border-t border-dc-border text-dc-text overflow-hidden relative">
      {/* Decorative cinematic glow - only visible in dark mode */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-dc-red opacity-0 dark:opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 lg:py-20 relative z-10">
        
        {/* Top Newsletter Row */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-16 lg:mb-24 pb-12 lg:pb-16 border-b border-dc-border">
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-dc-text-muted" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-dc-text-muted">
                Daily Briefing
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-black leading-[1.1] mb-4 text-dc-text">
              Bangladesh's pulse, <br className="hidden sm:block" />
              delivered to your inbox.
            </h2>
            <p className="text-sm sm:text-base text-dc-text-muted max-w-lg">
              Get the most important stories, expert analysis, and exclusive features every morning. Free, curated, and spam-free.
            </p>
          </div>
          
          <div className="w-full lg:w-[420px] shrink-0 flex flex-col justify-center">
            <div className="bg-dc-surface border border-dc-border rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="relative z-10" id="newsletter">
                <NewsletterForm variant="default" />
                <p className="text-xs text-dc-text-muted mt-4 text-center font-medium">
                  Join 50,000+ readers. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12 mb-16">
          <div className="col-span-2 lg:col-span-2 pr-0 lg:pr-12 flex flex-col justify-between">
            <div>
              <Link href="/" aria-label="Dhaka Chronicles" className="inline-block mb-6">
                <img src="/dc-mark-black.svg" alt="Dhaka Chronicles" className="h-10 w-auto" />
              </Link>
              <p className="text-sm text-dc-text-muted leading-relaxed max-w-sm mb-8">
                The premier digital news platform redefining journalism in Bangladesh. Independent, uncompromising, and aesthetically driven.
              </p>
            </div>
            <FooterSocials />
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-dc-text-muted mb-6">
                {section.title}
              </h4>
              <ul className="space-y-3.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm font-medium text-dc-text-muted hover:text-dc-text transition-colors">
                        {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-dc-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-dc-text-muted">
          <p>© {year} NOÉTIC Studio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-dc-text transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-dc-text transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-dc-text transition-colors">Cookies</Link>
          </div>
        </div>
        
      </div>
    </footer>
  )
}
