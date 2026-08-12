'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Users,
  Settings,
  BarChart3,
  MessageSquare,
  LogOut,
  Mail,
  Lightbulb,
  Calendar,
  ClipboardList,
  User,
  Megaphone,
  Layers,
  PlusCircle,
  Upload
} from 'lucide-react'
import { Facebook } from '@/components/ui/BrandIcons'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    label: 'Workspace',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Articles', href: '/admin/articles', icon: FileText },
      { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
      { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
      { name: 'Assignments', href: '/admin/assignments', icon: ClipboardList },
    ],
  },
  {
    label: 'Audience & Engagement',
    items: [
      { name: 'Comments', href: '/admin/comments', icon: MessageSquare },
      { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
      { name: 'Tips Queue', href: '/admin/tips', icon: Lightbulb },
    ],
  },
  {
    label: 'Monetization & Growth',
    items: [
      { name: 'Ad Manager', href: '/admin/ads', icon: Megaphone },
      { name: 'Facebook Sync', href: '/admin/facebook-sync', icon: Facebook },
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Settings & Access',
    items: [
      { name: 'Team & Roles', href: '/admin/users', icon: Users },
      { name: 'Site Layouts', href: '/admin/categories', icon: Layers },
      { name: 'Global Settings', href: '/admin/settings', icon: Settings },
      { name: 'My Profile', href: '/admin/profile', icon: User },
    ],
  },
]

interface AdminSidebarProps {
  isMobile?: boolean
  onClose?: () => void
}

export function AdminSidebar({ isMobile = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  const sidebarClasses = isMobile
    ? "w-full bg-[#09090b] border-r border-[rgba(255,255,255,0.08)] flex flex-col h-full"
    : "fixed inset-y-0 left-0 z-50 w-64 bg-[#09090b] border-r border-[rgba(255,255,255,0.08)] flex flex-col"

  return (
    <aside className={sidebarClasses}>
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-[rgba(255,255,255,0.08)]">
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="mr-4 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          >
            <span className="text-[#fafafa] text-xl">×</span>
          </button>
        )}
        <Link href="/admin/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
            <img src="/dc-mark-black.svg" alt="DC" className="h-4 w-auto" />
          </div>
          <span className="font-headline font-bold text-sm text-[#fafafa] tracking-wide">Chronicles Admin</span>
        </Link>
      </div>

      <div className="px-4 py-4 space-y-2 border-b border-[rgba(255,255,255,0.08)]">
        <Link href="/admin/articles/new" className="flex items-center justify-center gap-2 w-full py-2 bg-[#fafafa] text-[#09090b] rounded-md font-semibold text-sm hover:bg-white transition-colors">
          <PlusCircle className="w-4 h-4" />
          New Article
        </Link>
        <Link href="/admin/media" className="flex items-center justify-center gap-2 w-full py-2 bg-transparent text-[#fafafa] rounded-md font-medium text-sm hover:bg-[rgba(255,255,255,0.06)] transition-colors border border-[rgba(255,255,255,0.1)]">
          <Upload className="w-4 h-4 text-[#a1a1aa]" />
          Upload Media
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-2">
            <p className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">
              {group.label}
            </p>
            <div className="px-3 space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={isMobile ? onClose : undefined}
                    className={cn('admin-sidebar-link group', isActive && 'active')}
                  >
                    <Icon className={cn('w-4 h-4', isActive ? 'text-[#fafafa]' : 'text-[#a1a1aa] group-hover:text-[#fafafa]')} />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-[rgba(255,255,255,0.08)]">
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
            window.location.href = '/login'
          }}
          className="admin-sidebar-link w-full text-left group hover:text-[#fafafa]"
        >
          <LogOut className="w-4 h-4 text-[#a1a1aa] group-hover:text-[#fafafa]" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
