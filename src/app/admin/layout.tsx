import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { MobileAdminHeader } from '@/components/admin/MobileAdminHeader'
import { MobileBottomNav } from '@/components/admin/MobileBottomNav'
import { useIsMobile } from '@/lib/utils/mobile'
import { ClientLayout } from './ClientLayout'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientLayout>
      {children}
    </ClientLayout>
  )
}
