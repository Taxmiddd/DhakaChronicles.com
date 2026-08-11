import Link from 'next/link'
import { Search } from 'lucide-react'
import { MobileMenuButton } from '@/components/layout/MobileMenu'
import { supabaseAdmin } from '@/lib/db/admin'

interface Category {
  name: string
  slug: string
  color: string | null
}

async function getNavCategories(): Promise<Category[]> {
  try {
    const { data } = await supabaseAdmin
      .from('categories')
      .select('name, slug, color')
      .order('display_order', { ascending: true })
      .limit(7)
    return (data as Category[]) ?? []
  } catch {
    return []
  }
}

export async function PublicHeader() {
  const categories = await getNavCategories()

  const navCats: Category[] = categories.length > 0 ? categories : [
    { name: 'Politics',   slug: 'politics',   color: null },
    { name: 'Business',   slug: 'business',   color: null },
    { name: 'Sports',     slug: 'sports',     color: null },
    { name: 'Culture',    slug: 'culture',    color: null },
    { name: 'Technology', slug: 'technology', color: null },
    { name: 'Education',  slug: 'education',  color: null },
  ]

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-dc-border">

      {/* ── Masthead ── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 gap-4">

          {/* Logo */}
          <Link href="/" className="shrink-0" aria-label="Dhaka Chronicles">
            <img src="/dc-mark-black.svg" alt="Dhaka Chronicles" className="h-10 md:h-12 w-auto" />
          </Link>

          {/* Date — desktop only */}
          <span className="hidden lg:block text-[11px] font-semibold uppercase tracking-widest text-dc-text-muted">
            {dateStr}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="p-2 text-dc-text-muted hover:text-dc-text transition-colors"
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" />
            </Link>
            <Link
              href="#newsletter"
              className="hidden sm:inline-flex items-center px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white bg-dc-text hover:bg-black transition-colors"
            >
              Subscribe
            </Link>
            <MobileMenuButton categories={navCats} />
          </div>
        </div>
      </div>

      {/* ── Section Nav ── */}
      <div className="border-t border-dc-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="hidden lg:flex items-center gap-0 overflow-x-auto scrollbar-none">
            <Link
              href="/"
              className="shrink-0 px-4 py-3 text-[12px] font-bold uppercase tracking-widest text-dc-text border-b-2 border-dc-text hover:opacity-75 transition-opacity"
            >
              Home
            </Link>
            <Link
              href="/news"
              className="shrink-0 px-4 py-3 text-[12px] font-semibold uppercase tracking-widest text-dc-text-muted hover:text-dc-text transition-colors border-b-2 border-transparent hover:border-dc-text"
            >
              Latest
            </Link>
            {navCats.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="shrink-0 px-4 py-3 text-[12px] font-semibold uppercase tracking-widest text-dc-text-muted hover:text-dc-text transition-colors border-b-2 border-transparent hover:border-dc-text"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

    </header>
  )
}
