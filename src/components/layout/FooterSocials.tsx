'use client'

import { Facebook, Twitter, Youtube, Instagram } from '@/components/ui/BrandIcons'

const SOCIALS = [
  { icon: Facebook,  href: 'https://facebook.com/dhakachronicles',  label: 'Facebook',    hoverBg: '#1877F2' },
  { icon: Twitter,   href: 'https://twitter.com/dhakachronicles',   label: 'Twitter / X', hoverBg: '#000000' },
  { icon: Youtube,   href: 'https://youtube.com/@dhakachronicles',  label: 'YouTube',     hoverBg: '#FF0000' },
  { icon: Instagram, href: 'https://instagram.com/dhakachronicles', label: 'Instagram',   hoverBg: '#E1306C' },
]

export function FooterSocials() {
  return (
    <div className="flex items-center gap-2">
      {SOCIALS.map(({ icon: Icon, href, label, hoverBg }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          aria-label={label}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
          style={{ background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)', color: 'var(--dc-text-muted)' }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.background = hoverBg
            el.style.borderColor = hoverBg
            el.style.color = '#ffffff'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.background = 'var(--dc-surface-2)'
            el.style.borderColor = 'var(--dc-border)'
            el.style.color = 'var(--dc-text-muted)'
          }}
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
    </div>
  )
}
