import Link from 'next/link'
import { Search, Lightbulb } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { MobileMenuButton } from '@/components/layout/MobileMenu'
import { supabaseAdmin } from '@/lib/db/admin'

interface Category {
  name: string
  slug: string
  color: string | null
}

interface Banner {
  id: string
  title: string
  link: string | null
}

async function getNavCategories(): Promise<Category[]> {
  try {
    const { data } = await supabaseAdmin
      .from('categories')
      .select('name, slug, color')
      .order('display_order', { ascending: true })
      .limit(8)
    return (data as Category[]) ?? []
  } catch {
    return []
  }
}

async function getActiveBreakingBanners(): Promise<Banner[]> {
  try {
    const { data } = await supabaseAdmin
      .from('breaking_news_banners')
      .select('id, title, link')
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('priority', { ascending: true })
      .limit(5)
    return (data as Banner[]) ?? []
  } catch {
    return []
  }
}

export async function PublicHeader() {
  const [categories, banners] = await Promise.all([
    getNavCategories(),
    getActiveBreakingBanners(),
  ])

  const navCats: Category[] = categories.length > 0 ? categories : [
    { name: 'Politics',   slug: 'politics',   color: '#F42A41' },
    { name: 'Business',   slug: 'business',   color: '#00A651' },
    { name: 'Sports',     slug: 'sports',     color: '#F59E0B' },
    { name: 'Culture',    slug: 'culture',    color: '#8B5CF6' },
    { name: 'Technology', slug: 'technology', color: '#06B6D4' },
    { name: 'Education',  slug: 'education',  color: '#EC4899' },
  ]

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header className="sticky top-0 z-50">

      {/* ── Main header row ── */}
      <div
        className="border-b"
        style={{
          background: 'var(--background)',
          borderColor: 'var(--dc-header-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between gap-4">

          {/* Logo — swaps black ↔ white based on theme via CSS class */}
          <Link
            href="/"
            className="shrink-0 flex items-center"
            aria-label="Dhaka Chronicles — Home"
          >
            {/* Light mode logo */}
            <img
              src="/dc-logo-black.svg"
              alt="Dhaka Chronicles"
              className="h-12 w-auto light-only-ib"
            />
            {/* Dark mode logo */}
            <img
              src="/dc-logo-white.svg"
              alt="Dhaka Chronicles"
              className="h-12 w-auto dark-only-ib"
            />
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-1">

            {/* Date — desktop only */}
            <time
              className="hidden lg:block text-xs mr-3 tabular-nums"
              style={{ color: 'var(--dc-text-muted)' }}
            >
              {dateStr}
            </time>

            <Link
              href="/search"
              className="p-2.5 rounded-lg transition-colors hover:bg-dc-surface-2"
              style={{ color: 'var(--dc-text-muted)' }}
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" />
            </Link>

            <ThemeToggle />

            <Link
              href="/tips"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border ml-1 transition-colors hover:border-dc-green hover:text-dc-green"
              style={{ color: 'var(--dc-text-muted)', borderColor: 'var(--dc-border)' }}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Tip Us
            </Link>

            <Link
              href="#newsletter"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 ml-1"
              style={{ background: 'var(--dc-green)' }}
            >
              Subscribe
            </Link>

            <MobileMenuButton categories={navCats} />
          </div>
        </div>
      </div>

      {/* ── Mobile category pill scroll — phone only ── */}
      <div
        className="sm:hidden overflow-x-auto scrollbar-none border-b"
        style={{
          background: 'var(--dc-nav-strip-bg)',
          borderColor: 'var(--dc-nav-strip-border)',
        }}
      >
        <div className="flex items-center gap-2 px-4 py-2 min-w-max">
          <Link
            href="/"
            className="shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold text-white"
            style={{ background: 'var(--dc-green)' }}
          >
            Latest
          </Link>
          {navCats.map(cat => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold border"
              style={{
                color: cat.color ?? 'var(--dc-text-muted)',
                borderColor: `${cat.color ?? 'var(--dc-border)'}50`,
                background: `${cat.color ?? 'var(--dc-surface-2)'}14`,
              }}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Desktop category navigation strip ── */}
      <nav
        className="hidden lg:block border-b"
        style={{
          background: 'var(--dc-nav-strip-bg)',
          borderColor: 'var(--dc-nav-strip-border)',
        }}
        aria-label="Section navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-10 gap-0.5 overflow-x-auto scrollbar-none">
            <Link
              href="/"
              className="shrink-0 px-3 h-full flex items-center text-sm font-bold relative group transition-colors"
              style={{ color: 'var(--dc-text)' }}
            >
              Latest
              <span
                className="absolute bottom-0 left-3 right-3 h-[2px] rounded-t-full"
                style={{ background: 'var(--dc-green)' }}
              />
            </Link>
            {navCats.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="shrink-0 px-3 h-full flex items-center text-sm font-medium relative group transition-colors"
                style={{ color: 'var(--dc-text-muted)' }}
              >
                <span className="group-hover:opacity-100 transition-colors" style={{ color: 'inherit' }}>
                  {cat.name}
                </span>
                <span
                  className="absolute bottom-0 left-3 right-3 h-[2px] rounded-t-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                  style={{ background: cat.color ?? 'var(--dc-green)' }}
                />
              </Link>
            ))}
            <div className="ml-auto shrink-0 flex items-center gap-0.5 pl-4 border-l border-dc-border">
              <Link
                href="/search"
                className="px-3 h-full flex items-center text-sm font-medium text-dc-muted hover:text-dc-green transition-colors"
              >
                All Sections
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Breaking news ticker ── */}
      {banners.length > 0 && (
        <div style={{ background: '#F42A41', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center gap-4 overflow-hidden">
            <div className="shrink-0 flex items-center gap-2 bg-black/20 px-2.5 py-1 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Breaking</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="ticker-animate inline-flex items-center gap-8 text-sm font-medium text-white">
                {[...banners, ...banners].map((b, i) => (
                  <span key={i} className="flex items-center gap-8 shrink-0">
                    {b.link ? (
                      <Link href={b.link} className="hover:underline underline-offset-2 whitespace-nowrap">
                        {b.title}
                      </Link>
                    ) : (
                      <span className="whitespace-nowrap">{b.title}</span>
                    )}
                    <span className="opacity-40 text-base">◆</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
