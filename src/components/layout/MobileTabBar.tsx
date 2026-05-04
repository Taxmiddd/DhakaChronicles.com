'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Mic2, Info, Menu } from 'lucide-react'
import { useMobileNav } from './MobileNavContext'

const TABS = [
  { icon: Home,   label: 'Home',     href: '/'         },
  { icon: Search, label: 'Search',   href: '/search'   },
  { icon: Mic2,   label: 'Podcasts', href: '/podcasts' },
  { icon: Info,   label: 'About',    href: '/about'    },
] as const

export function MobileTabBar() {
  const pathname = usePathname()
  const { setOpen } = useMobileNav()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[55] sm:hidden"
      style={{
        background: 'var(--background)',
        borderTop: '1px solid var(--dc-border)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Main navigation"
    >
      <div className="flex h-14">
        {TABS.map(({ icon: Icon, label, href }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors"
              style={{ color: active ? 'var(--dc-green)' : 'var(--dc-text-muted)' }}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.5 : 1.75} />
              <span className="text-[9px] font-semibold tracking-wide">{label}</span>
            </Link>
          )
        })}

        <button
          onClick={() => setOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors"
          style={{ color: 'var(--dc-text-muted)' }}
          aria-label="Open menu"
        >
          <Menu className="w-[22px] h-[22px]" strokeWidth={1.75} />
          <span className="text-[9px] font-semibold tracking-wide">More</span>
        </button>
      </div>
    </nav>
  )
}
