import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
