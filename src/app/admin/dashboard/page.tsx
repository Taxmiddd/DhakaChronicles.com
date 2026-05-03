'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Users, FileText, Activity, RefreshCw, Eye } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface Stats {
  total_articles: number
  total_views: number
  total_users: number
  active_now: number
  published_today?: number
  pending_review?: number
}

interface TopArticle {
  id: string
  title: string
  views?: number
  view_count?: number
  published_at?: string
}

interface TrafficSource {
  source: string
  percentage: number
}

interface RecentActivity {
  id: string
  type: 'article_published' | 'comment' | 'tip' | 'subscriber'
  message: string
  created_at: string
}

const FALLBACK_TRAFFIC: TrafficSource[] = [
  { source: 'Direct', percentage: 45 },
  { source: 'Facebook', percentage: 30 },
  { source: 'Google', percentage: 15 },
  { source: 'Twitter', percentage: 6 },
  { source: 'Other', percentage: 4 },
]

const DEFAULT_STATS: Stats = {
  total_articles: 0,
  total_views: 0,
  total_users: 0,
  active_now: 0,
  published_today: 0,
  pending_review: 0,
}

function toSafeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function normalizeStats(payload: unknown): Stats {
  const data = (payload && typeof payload === 'object') ? payload as Record<string, unknown> : {}
  return {
    total_articles: toSafeNumber(data.total_articles),
    total_views: toSafeNumber(data.total_views),
    total_users: toSafeNumber(data.total_users),
    active_now: toSafeNumber(data.active_now),
    published_today: toSafeNumber(data.published_today),
    pending_review: toSafeNumber(data.pending_review),
  }
}

function normalizeTopArticles(payload: unknown): TopArticle[] {
  if (!Array.isArray(payload)) return []
  return payload
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      if (typeof row.id !== 'string' || typeof row.title !== 'string') return null
      return {
        id: row.id,
        title: row.title,
        views: toSafeNumber(row.views ?? row.view_count),
        view_count: toSafeNumber(row.view_count),
        published_at: typeof row.published_at === 'string' ? row.published_at : undefined,
      }
    })
    .filter((item): item is TopArticle => item !== null)
}

function normalizeTraffic(payload: unknown): TrafficSource[] {
  if (!Array.isArray(payload)) return FALLBACK_TRAFFIC
  const parsed = payload
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      if (typeof row.source !== 'string') return null
      return {
        source: row.source,
        percentage: toSafeNumber(row.percentage),
      }
    })
    .filter((item): item is TrafficSource => item !== null)
  return parsed.length > 0 ? parsed : FALLBACK_TRAFFIC
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [topArticles, setTopArticles] = useState<TopArticle[]>([])
  const [traffic, setTraffic] = useState<TrafficSource[]>(FALLBACK_TRAFFIC)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  async function fetchData(isBackgroundRefresh = false) {
    if (!isBackgroundRefresh) setLoading(true)
    try {
      const [dashRes, articlesRes, trafficRes] = await Promise.allSettled([
        fetch('/api/analytics/dashboard'),
        fetch('/api/analytics/articles?limit=5'),
        fetch('/api/analytics/traffic'),
      ])

      if (dashRes.status === 'fulfilled' && dashRes.value.ok) {
        const d = await dashRes.value.json()
        setStats(normalizeStats(d.stats ?? d.data ?? d))
      }
      if (articlesRes.status === 'fulfilled' && articlesRes.value.ok) {
        const d = await articlesRes.value.json()
        setTopArticles(normalizeTopArticles(d.articles ?? d.data ?? []))
      }
      if (trafficRes.status === 'fulfilled' && trafficRes.value.ok) {
        const d = await trafficRes.value.json()
        setTraffic(normalizeTraffic(d.sources ?? d.data?.sources ?? d.data ?? []))
      }
    } catch {
      if (!isBackgroundRefresh) toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setLastRefresh(new Date())
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
      fetchData(true)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const displayStats = stats ?? DEFAULT_STATS

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-bold text-white">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs text-dc-muted">
            Updated {formatDistanceToNow(lastRefresh, { addSuffix: true })}
          </span>
          <button
            onClick={fetchData}
            disabled={loading}
            className="btn-ghost px-3 py-2 text-sm flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="flex items-center gap-1.5 text-sm text-dc-muted">
            <Activity className="w-4 h-4 text-dc-green" />
            <span className="text-dc-green font-bold">{displayStats.active_now}</span>
            <span>live visitors</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Articles"
          value={loading ? '…' : displayStats.total_articles.toLocaleString()}
          icon={<FileText className="w-5 h-5" />}
          trend={displayStats.published_today ? `+${displayStats.published_today} today` : undefined}
        />
        <StatCard
          title="Total Views"
          value={loading ? '…' : formatViews(displayStats.total_views)}
          icon={<Eye className="w-5 h-5" />}
          trend="+8% this week"
        />
        <StatCard
          title="Team Members"
          value={loading ? '…' : displayStats.total_users.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Pending Review"
          value={loading ? '…' : (displayStats.pending_review ?? 0).toString()}
          icon={<TrendingUp className="w-5 h-5" />}
          className="border-amber-500/20"
          valueClassName="text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Articles */}
        <div className="lg:col-span-2 glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-headline font-bold text-white">Top Performing Articles</h2>
            <Link href="/admin/analytics" className="text-sm text-dc-green hover:underline">
              Full analytics →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-10 rounded-lg" />
              ))}
            </div>
          ) : topArticles.length === 0 ? (
            <p className="text-dc-muted text-sm italic">No data yet. Publish articles to see stats.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="dc-table">
                <thead>
                  <tr>
                    <th>Article Title</th>
                    <th className="text-right">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {topArticles.map(article => (
                    <tr key={article.id}>
                      <td className="font-medium text-dc-text truncate max-w-[320px]">{article.title}</td>
                      <td className="text-right font-mono text-dc-green">{(article.views ?? article.view_count ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Traffic Sources */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-headline font-bold text-white mb-5">Traffic Sources</h2>
          <div className="space-y-4">
            {traffic.map(src => (
              <TrafficBar key={src.source} label={src.source} percentage={src.percentage} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-headline font-bold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/articles/new" className="btn-primary text-sm py-2 px-4">+ New Article</Link>
          <Link href="/admin/comments" className="btn-ghost text-sm py-2 px-4">Moderate Comments</Link>
          <Link href="/admin/tips" className="btn-ghost text-sm py-2 px-4">Tips Queue</Link>
          <Link href="/admin/newsletter" className="btn-ghost text-sm py-2 px-4">Send Newsletter</Link>
          <Link href="/admin/assignments" className="btn-ghost text-sm py-2 px-4">Story Assignments</Link>
        </div>
      </div>
    </div>
  )
}

function formatViews(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

function StatCard({
  title, value, icon, trend, className = '', valueClassName = 'text-white',
}: {
  title: string
  value: string
  icon: React.ReactNode
  trend?: string
  className?: string
  valueClassName?: string
}) {
  return (
    <div className={`glass rounded-xl p-5 flex flex-col ${className}`}>
      <div className="flex items-center justify-between text-dc-muted mb-3">
        <span className="font-medium text-xs uppercase tracking-wider">{title}</span>
        {icon}
      </div>
      <div className={`text-3xl font-headline font-bold mb-1 ${valueClassName}`}>{value}</div>
      {trend && <div className="text-xs text-dc-green">{trend}</div>}
    </div>
  )
}

function TrafficBar({ label, percentage }: { label: string; percentage: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-dc-text">{label}</span>
        <span className="text-dc-muted font-mono">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-dc-surface-2 rounded-full overflow-hidden">
        <div className="h-full bg-dc-green rounded-full transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
