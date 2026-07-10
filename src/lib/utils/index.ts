import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merges Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a date string into a readable format */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

/** Format date in Bangla */
export function formatDateBn(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Relative time (e.g., "2 hours ago") */
export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  if (weeks < 4) return `${weeks}w ago`
  if (months < 12) return `${months}mo ago`
  return formatDate(d)
}

/** Estimate reading time in minutes */
export function estimateReadTime(content: string | Record<string, unknown>): number {
  const text = typeof content === 'string'
    ? content
    : JSON.stringify(content)
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

/** Auto-generate slug from title */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-|-$/g, '')
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s\S*$/, '') + 'â€¦'
}

/** Format view count (e.g., 1.2K, 3.4M) */
export function formatViewCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return count.toString()
}

/** Get initials from a name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Build full URL */
export function buildUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://dhakachronicles.com'
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

/** Extract plain text from TipTap JSON */
export function extractTextFromTipTap(doc: Record<string, unknown>): string {
  function walk(node: unknown): string {
    if (!node || typeof node !== 'object') return ''
    const n = node as Record<string, unknown>
    if (n.type === 'text') return (n.text as string) ?? ''
    if (Array.isArray(n.content)) {
      return (n.content as unknown[]).map(walk).join(' ')
    }
    return ''
  }
  return walk(doc).replace(/\s+/g, ' ').trim()
}

/** Format file size */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/** Legacy green hex values stored in DB that should be remapped to brand crimson */
const LEGACY_GREENS = new Set(['#00a651', '#007a3c', '#009040', '#00c462', '#00A651', '#007A3C'])

/** Get category color with fallback — remaps legacy green DB values to brand red */
export function getCategoryColor(color?: string | null): string {
  if (!color) return '#DC1A2C'
  if (LEGACY_GREENS.has(color) || LEGACY_GREENS.has(color.toLowerCase())) return '#DC1A2C'
  return color
}

/** Debounce utility */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

