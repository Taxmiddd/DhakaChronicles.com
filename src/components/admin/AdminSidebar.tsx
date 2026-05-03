'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Users,
  UserCheck,
  Settings,
  BarChart3,
  MessageSquare,
  Tag,
  Layers,
  LogOut,
  Mail,
  Headphones,
  BarChart2,
  Lightbulb,
  Calendar,
  ClipboardList,
  Briefcase,
  User,
  Megaphone,
} from 'lucide-react'
import { Facebook } from '@/components/ui/BrandIcons'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    label: 'Editorial',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Articles', href: '/admin/articles', icon: FileText },
      { name: 'Categories', href: '/admin/categories', icon: Layers },
      { name: 'Comments', href: '/admin/comments', icon: MessageSquare },
      { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
      { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
      { name: 'Assignments', href: '/admin/assignments', icon: ClipboardList },
    ],
  },
  {
    label: 'Audience',
    items: [
      { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
      { name: 'Polls', href: '/admin/polls', icon: BarChart2 },
      { name: 'Tips Queue', href: '/admin/tips', icon: Lightbulb },
    ],
  },
  {
    label: 'Content',
    items: [
      { name: 'Podcasts',      href: '/admin/podcasts',       icon: Headphones },
      { name: 'Portfolio',     href: '/admin/portfolio',      icon: Briefcase  },
      { name: 'Ad Manager',    href: '/admin/ads',            icon: Megaphone  },
      { name: 'Facebook Sync', href: '/admin/facebook-sync',  icon: Facebook   },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { name: 'Admin Users', href: '/admin/users', icon: Users },
      { name: 'Team Members', href: '/admin/team-members', icon: UserCheck },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
      { name: 'My Profile', href: '/admin/profile', icon: User },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-dc-surface border-r border-dc-border flex flex-col">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-dc-border">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-dc-green rounded-md flex items-center justify-center">
            <span className="text-white font-bold font-headline text-lg">D</span>
          </div>
          <span className="font-headline font-bold text-lg text-white">Chronicles</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            <p className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-dc-muted">
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
                    className={cn('admin-sidebar-link group', isActive && 'active')}
                  >
                    <Icon className={cn('w-4 h-4', isActive ? 'text-dc-green' : 'text-dc-muted group-hover:text-dc-text')} />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-dc-border">
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
            window.location.href = '/login'
          }}
          className="admin-sidebar-link w-full text-left group hover:text-dc-red"
        >
          <LogOut className="w-4 h-4 text-dc-muted group-hover:text-dc-red" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
