import { PublicHeader } from '@/components/layout/PublicHeader'
import { PublicFooter } from '@/components/layout/PublicFooter'
import AdBanner from '@/components/ui/AdBanner'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Before-footer leaderboard — desktop only */}
      <div className="hidden sm:block w-full" style={{ borderTop: '1px solid var(--dc-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <AdBanner position="before_footer" className="w-full h-[90px]" />
        </div>
      </div>

      <PublicFooter />

      {/* Sticky bottom bar — mobile only, client-rendered, dismissible */}
      <AdBanner position="sticky_mobile" variant="sticky" />
    </div>
  )
}
