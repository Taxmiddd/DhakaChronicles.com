'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, ChevronRight, Lightbulb, Rss } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Facebook, Linkedin, Instagram } from '@/components/ui/BrandIcons'
import { useMobileNav } from './MobileNavContext'

interface Category {
  name: string
  slug: string
  color?: string | null
}

const SOCIALS = [
  { icon: Facebook,  href: 'https://facebook.com/dhakachronicles',         label: 'Facebook'  },
  { icon: Linkedin,  href: 'https://linkedin.com/company/dhakachronicles', label: 'LinkedIn'  },
  { icon: Instagram, href: 'https://instagram.com/dhakachronicles',        label: 'Instagram' },
]

export function MobileMenuButton({ categories }: { categories: Category[] }) {
  const { open, setOpen } = useMobileNav()
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 150)
    else setQuery('')
  }, [open])

  function close() { setOpen(false) }

  const filtered = query.trim()
    ? categories.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : categories

  return (
    <>
      {/* Hamburger — tablet only (sm–lg); tab bar handles mobile */}
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:block lg:hidden p-2 rounded-lg hover:bg-dc-surface-2 transition-colors"
        style={{ color: 'var(--dc-text-muted)' }}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-80 flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.32,.72,0,1)] lg:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'var(--background)', borderLeft: '1px solid var(--dc-border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 h-14 shrink-0"
          style={{ borderBottom: '1px solid var(--dc-border)' }}
        >
          <Link href="/" onClick={close} aria-label="Home">
            <img src="/dc-logo-black.svg" alt="Dhaka Chronicles" className="h-6 w-auto" />
          </Link>
          <button
            onClick={close}
            className="p-1.5 rounded-lg transition-colors hover:bg-dc-surface-2"
            style={{ color: 'var(--dc-text-muted)' }}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--dc-border)' }}>
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
            style={{ background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)' }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--dc-text-muted)' }} />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search sections…"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--dc-text)' }}
              onKeyDown={e => {
                if (e.key === 'Enter' && query.trim()) {
                  close()
                  window.location.href = `/search?q=${encodeURIComponent(query.trim())}`
                }
              }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ color: 'var(--dc-text-muted)' }}>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--dc-border)' }}>
          <Link
            href="/tips"
            onClick={close}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: 'var(--dc-surface-2)', color: 'var(--dc-text-muted)', border: '1px solid var(--dc-border)' }}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Tip Us
          </Link>
          <Link
            href="#newsletter"
            onClick={close}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--dc-green)' }}
          >
            Subscribe
          </Link>
        </div>

        {/* Category nav */}
        <nav className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--dc-text-muted)' }}>
              Sections
            </span>
          </div>

          <Link
            href="/"
            onClick={close}
            className="flex items-center justify-between mx-3 px-3 py-3 rounded-lg transition-colors hover:bg-dc-surface-2 group"
          >
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--dc-green)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--dc-text)' }}>Latest</span>
            </div>
            <ChevronRight className="w-4 h-4 transition-colors group-hover:text-dc-green" style={{ color: 'var(--dc-text-muted)' }} />
          </Link>

          {filtered.length > 0 ? filtered.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              onClick={close}
              className="flex items-center justify-between mx-3 px-3 py-3 rounded-lg transition-colors hover:bg-dc-surface-2 group"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color ?? 'var(--dc-text-muted)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--dc-text)' }}>{cat.name}</span>
              </div>
              <ChevronRight className="w-4 h-4 transition-colors group-hover:text-dc-green" style={{ color: 'var(--dc-text-muted)' }} />
            </Link>
          )) : (
            <p className="px-7 py-4 text-sm" style={{ color: 'var(--dc-text-muted)' }}>No sections found</p>
          )}

          <div className="px-4 pt-4 pb-1 mt-2" style={{ borderTop: '1px solid var(--dc-border)' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--dc-text-muted)' }}>
              More
            </span>
          </div>
          {[
            { label: 'Podcasts',  href: '/podcasts'  },
            { label: 'Our Team',  href: '/team'      },
            { label: 'About Us',  href: '/about'     },
            { label: 'Contact',   href: '/contact'   },
            { label: 'Advertise', href: '/advertise' },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className="flex items-center justify-between mx-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-dc-surface-2 group"
            >
              <span className="text-sm" style={{ color: 'var(--dc-text-muted)' }}>{label}</span>
              <ChevronRight className="w-4 h-4 transition-colors group-hover:text-dc-green" style={{ color: 'var(--dc-text-muted)' }} />
            </Link>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="shrink-0 px-5 py-4 space-y-4" style={{ borderTop: '1px solid var(--dc-border)' }}>
          <div className="flex items-center gap-2">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-dc-green hover:text-white"
                style={{ background: 'var(--dc-surface-2)', color: 'var(--dc-text-muted)', border: '1px solid var(--dc-border)' }}
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
            <a
              href="/api/rss"
              aria-label="RSS Feed"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-dc-green hover:text-white"
              style={{ background: 'var(--dc-surface-2)', color: 'var(--dc-text-muted)', border: '1px solid var(--dc-border)' }}
            >
              <Rss className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--dc-text-muted)' }}>Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  )
}
