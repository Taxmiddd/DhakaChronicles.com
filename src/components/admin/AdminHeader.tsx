'use client'

import { useEffect, useState } from 'react'
import { Bell, Search, ChevronDown } from 'lucide-react'
import Link from 'next/link'

interface SessionUser {
  id: string
  full_name: string
  email: string
  role: string
  avatar_url?: string
}

const ROLE_COLORS: Record<string, string> = {
  founder: 'text-dc-red',
  admin: 'text-dc-green',
  publisher: 'text-dc-muted',
}

export function AdminHeader() {
  const [user, setUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.profile) setUser(data.profile) })
      .catch(() => {})
  }, [])

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'DC'

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-dc-border bg-dc-surface/80 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">Search</label>
          <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-dc-muted" aria-hidden="true" />
          <input
            id="search-field"
            className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-dc-text placeholder:text-dc-muted focus:ring-0 sm:text-sm"
            placeholder="Search articles, users, settings..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-dc-muted hover:text-dc-text">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-dc-border" aria-hidden="true" />

          <Link href="/admin/profile" className="flex items-center gap-x-3 group cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-dc-green/20 border border-dc-green/30 flex items-center justify-center shrink-0">
              {user?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt={user.full_name} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-dc-green">{initials}</span>
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-white leading-tight group-hover:text-dc-green transition-colors">
                {user?.full_name || 'Loading…'}
              </p>
              <p className={`text-xs font-medium capitalize leading-tight ${ROLE_COLORS[user?.role || ''] || 'text-dc-muted'}`}>
                {user?.role || '—'}
              </p>
            </div>
            <ChevronDown className="hidden lg:block w-4 h-4 text-dc-muted group-hover:text-dc-text transition-colors" />
          </Link>
        </div>
      </div>
    </header>
  )
}
