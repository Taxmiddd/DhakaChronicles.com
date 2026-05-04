'use client'

import { Bell, Menu, Search, User } from 'lucide-react'
import { useState } from 'react'

interface MobileAdminHeaderProps {
  onMenuToggle: () => void
  title?: string
}

export function MobileAdminHeader({ onMenuToggle, title = 'Admin' }: MobileAdminHeaderProps) {
  const [hasNotifications] = useState(false) // TODO: Connect to notification system

  return (
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button and title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-300" />
          </button>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-300" />
            {hasNotifications && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          <button
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Profile"
          >
            <User className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  )
}