'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg" style={{ background: 'var(--dc-surface-2)' }} />
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg transition-colors focus:outline-none"
      style={{
        background: 'var(--dc-surface-2)',
        border: '1px solid var(--dc-border)',
        color: 'var(--dc-text-muted)',
      }}
      aria-label="Toggle theme"
      title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  )
}
