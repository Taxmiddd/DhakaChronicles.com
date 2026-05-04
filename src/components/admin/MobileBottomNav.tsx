'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  BarChart3,
  MessageSquare,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileNavItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Articles',
    href: '/admin/articles',
    icon: FileText,
  },
  {
    name: 'Comments',
    href: '/admin/comments',
    icon: MessageSquare,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'More',
    href: '/admin/menu',
    icon: Settings,
  },
]

interface MobileBottomNavProps {
  className?: string
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 px-2 py-2",
      className
    )}>
      <div className="flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1",
                isActive
                  ? "bg-dc-green text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}