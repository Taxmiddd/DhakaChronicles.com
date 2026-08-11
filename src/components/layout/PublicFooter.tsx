import Link from 'next/link'
import { NewsletterForm } from '@/components/layout/NewsletterForm'
import { FooterSocials } from '@/components/layout/FooterSocials'

const FOOTER_SECTIONS = [
  {
    title: 'Sections',
    links: [
      { label: 'Politics',   href: '/category/politics' },
      { label: 'Business',   href: '/category/business' },
      { label: 'Sports',     href: '/category/sports' },
      { label: 'Culture',    href: '/category/culture' },
      { label: 'Technology', href: '/category/technology' },
      { label: 'Education',  href: '/category/education' },
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
    <footer className="mt-20 border-t border-dc-border bg-dc-surface">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Newsletter band */}
        <div id="newsletter" className="py-14 border-b border-dc-border grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-dc-text-muted block mb-3">
              Daily Briefing
            </span>
            <h2 className="font-headline font-black text-2xl sm:text-3xl text-dc-text leading-tight mb-3">
              Bangladesh's pulse, <br className="hidden sm:block" />delivered to your inbox.
            </h2>
            <p className="text-sm text-dc-text-muted leading-relaxed max-w-md">
              The most important stories, expert analysis, and exclusive features every morning. Free and spam-free.
            </p>
          </div>
          <div>
            <NewsletterForm variant="default" />
            <p className="text-[11px] text-dc-text-muted mt-3 font-medium">
              Join 50,000+ readers. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Links grid */}
        <div className="py-14 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-10 border-b border-dc-border">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 md:col-span-1 lg:col-span-2 pr-0 lg:pr-16">
            <Link href="/" aria-label="Dhaka Chronicles" className="inline-block mb-5">
              <img src="/dc-mark-black.svg" alt="Dhaka Chronicles" className="h-9 w-auto" />
            </Link>
            <p className="text-sm text-dc-text-muted leading-relaxed mb-6 max-w-xs">
              Independent digital journalism from the heart of Bangladesh.
            </p>
            <FooterSocials />
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-dc-text mb-5">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-dc-text-muted hover:text-dc-text transition-colors"
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
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-medium text-dc-text-muted">
          <p>© {year} Dhaka Chronicles. Published by NOÉTIC Studio.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-dc-text transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-dc-text transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-dc-text transition-colors">Cookies</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
