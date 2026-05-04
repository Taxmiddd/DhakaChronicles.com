'use client'

import { useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { MobileAdminHeader } from '@/components/admin/MobileAdminHeader'
import { MobileBottomNav } from '@/components/admin/MobileBottomNav'
import MobileAdminDashboard from '@/components/admin/MobileAdminDashboard'
import { useIsMobile } from '@/lib/utils/mobile'
import { usePathname } from 'next/navigation'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Check if we're on the dashboard page
  const isDashboard = pathname === '/admin' || pathname === '/admin/dashboard'

  if (isMobile) {
    return (
      <div className="dark min-h-screen" style={{ background: '#0a0a0a', color: '#f0f0f0' }}>
        <MobileAdminHeader
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
            <div className="fixed left-0 top-0 h-full w-80 bg-gray-900 shadow-xl transform transition-transform">
              <AdminSidebar isMobile onClose={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        <main className="pb-16">
          {isDashboard ? <MobileAdminDashboard /> : children}
        </main>

        <MobileBottomNav />
      </div>
    )
  }

  // Desktop layout
  return (
    <div className="dark min-h-screen" style={{ background: '#0a0a0a', color: '#f0f0f0' }}>
      <AdminSidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}