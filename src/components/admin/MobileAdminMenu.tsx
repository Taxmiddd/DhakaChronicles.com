'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Image as ImageIcon,
  Users,
  UserCheck,
  Mail,
  Headphones,
  BarChart2,
  Lightbulb,
  Calendar,
  ClipboardList,
  Briefcase,
  Megaphone,
  Layers,
  Tag,
  ArrowLeft,
} from 'lucide-react'
import { Facebook } from '@/components/ui/BrandIcons'
import { cn } from '@/lib/utils'

const menuSections = [
  {
    title: 'Editorial',
    items: [
      { name: 'Categories', href: '/admin/categories', icon: Layers },
      { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
      { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
      { name: 'Assignments', href: '/admin/assignments', icon: ClipboardList },
    ],
  },
  {
    title: 'Audience',
    items: [
      { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
      { name: 'Polls', href: '/admin/polls', icon: BarChart2 },
      { name: 'Tips Queue', href: '/admin/tips', icon: Lightbulb },
    ],
  },
  {
    title: 'Business',
    items: [
      { name: 'Ads', href: '/admin/ads', icon: Megaphone },
      { name: 'Portfolio', href: '/admin/portfolio', icon: Briefcase },
      { name: 'Team Members', href: '/admin/team-members', icon: UserCheck },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Settings', href: '/admin/settings', icon: Tag },
    ],
  },
]

interface MobileAdminMenuProps {
  onBack?: () => void
}

export function MobileAdminMenu({ onBack }: MobileAdminMenuProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-900 border-b border-gray-800 px-4 py-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
          )}
          <h1 className="text-xl font-semibold text-white">Admin Menu</h1>
        </div>
      </div>

      {/* Menu Content */}
      <div className="p-4 space-y-6 pb-20">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-dc-green text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}