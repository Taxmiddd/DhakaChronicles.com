import Link from 'next/link'
import { Search, Lightbulb } from 'lucide-react'
import { MobileMenuButton } from '@/components/layout/MobileMenu'
import { supabaseAdmin } from '@/lib/db/admin'
import { getCategoryColor } from '@/lib/utils'

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
    { name: 'Politics',   slug: 'politics',   color: '#171717' },
    { name: 'Business',   slug: 'business',   color: '#171717' },
    { name: 'Sports',     slug: 'sports',     color: '#171717' },
    { name: 'Culture',    slug: 'culture',    color: '#171717' },
    { name: 'Technology', slug: 'technology', color: '#171717' },
    { name: 'Education',  slug: 'education',  color: '#171717' },
  ]

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header className="sticky top-0 z-50 flex flex-col backdrop-blur-lg bg-background/85 supports-[backdrop-filter]:bg-background/60 border-b border-dc-border shadow-sm">
      
      {/* ── Main Nav Bar ── */}
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-6">
        
        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center" aria-label="Dhaka Chronicles">
          <img src="/dc-mark-black.svg" alt="Dhaka Chronicles" className="h-14 md:h-16 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 h-full flex-1 justify-center">
          <Link href="/" className="px-3 h-full flex items-center text-[13px] font-bold text-dc-text relative group">
            Latest
            <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-full bg-dc-text" />
          </Link>
          {navCats.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className="px-3 h-full flex items-center text-[13px] font-semibold text-dc-text-muted hover:text-dc-text transition-colors relative group">
              {cat.name}
              <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-full scale-x-0 group-hover:scale-x-100 transition-transform origin-center" style={{ background: getCategoryColor(cat.color) }} />
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/search" className="p-2 rounded-full transition-colors hover:bg-dc-surface-2 text-dc-text-muted hover:text-dc-text" aria-label="Search">
            <Search className="w-4 h-4" />
          </Link>
          <Link href="/tips" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-dc-border text-dc-text-muted hover:border-dc-text hover:text-dc-text transition-all">
            <Lightbulb className="w-3.5 h-3.5" />
            Tip Us
          </Link>
          <Link href="#newsletter" className="hidden sm:inline-flex px-4 py-1.5 rounded-full text-xs font-bold text-white bg-dc-text hover:bg-black transition-colors">
            Subscribe
          </Link>
          <MobileMenuButton categories={navCats} />
        </div>
      </div>
      
    </header>
  )
}
