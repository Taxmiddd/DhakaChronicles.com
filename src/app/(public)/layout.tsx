import { PublicHeader } from '@/components/layout/PublicHeader'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { MobileNavProvider } from '@/components/layout/MobileNavContext'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import AdBanner from '@/components/ui/AdBanner'
import BreakingNewsTicker from '@/components/ui/BreakingNewsTicker'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileNavProvider>
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <BreakingNewsTicker />

        {/* pb-14 reserves space for the mobile tab bar */}
        <main className="flex-1 w-full pb-14 sm:pb-0">
          {children}
        </main>

        {/* Before-footer leaderboard — desktop only */}
        <div className="hidden sm:block w-full" style={{ borderTop: '1px solid var(--dc-border)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <AdBanner position="before_footer" className="w-full h-[90px]" />
          </div>
        </div>

        <PublicFooter />

        {/* Sticky ad — mobile only, sits just above the tab bar */}
        <AdBanner position="sticky_mobile" variant="sticky" />

        {/* App-like bottom tab bar — mobile only */}
        <MobileTabBar />
      </div>
    </MobileNavProvider>
  )
}
