'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Users, FileText, Activity, RefreshCw, Eye, ArrowRight } from 'lucide-react'
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
    .map((item): TopArticle | null => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      if (typeof row.id !== 'string' || typeof row.title !== 'string') return null
      return {
        id: row.id,
        title: row.title,
        views: toSafeNumber(row.views ?? row.view_count),
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
      return { source: row.source, percentage: toSafeNumber(row.percentage) }
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
    const interval = setInterval(() => fetchData(true), 15000)
    return () => clearInterval(interval)
  }, [])

  const displayStats = stats ?? DEFAULT_STATS

  return (
    <div className="space-y-8 max-w-7xl">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-[#fafafa]">Dashboard</h1>
          <p className="text-[#a1a1aa] text-sm mt-0.5">Your newsroom at a glance.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-full">
            <Activity className="w-3.5 h-3.5" />
            <span className="font-bold">{displayStats.active_now}</span>
            <span className="text-green-500/70">live</span>
          </div>
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <span className="text-xs text-[#52525b] hidden lg:block">
            {formatDistanceToNow(lastRefresh, { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Articles"
          value={loading ? '—' : displayStats.total_articles.toLocaleString()}
          icon={<FileText className="w-4 h-4" />}
          trend={displayStats.published_today ? `+${displayStats.published_today} today` : undefined}
          trendColor="text-green-400"
        />
        <StatCard
          title="Total Views"
          value={loading ? '—' : formatViews(displayStats.total_views)}
          icon={<Eye className="w-4 h-4" />}
          trend="+8% this week"
          trendColor="text-green-400"
        />
        <StatCard
          title="Team Members"
          value={loading ? '—' : displayStats.total_users.toLocaleString()}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          title="Pending Review"
          value={loading ? '—' : (displayStats.pending_review ?? 0).toString()}
          icon={<TrendingUp className="w-4 h-4" />}
          accent="amber"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Top Articles */}
        <div className="lg:col-span-2 admin-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-[#fafafa]">Top Performing Articles</h2>
            <Link href="/admin/analytics" className="flex items-center gap-1 text-xs text-[#a1a1aa] hover:text-[#fafafa] transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-[rgba(255,255,255,0.04)] animate-pulse" />
              ))}
            </div>
          ) : topArticles.length === 0 ? (
            <p className="text-[#a1a1aa] text-sm italic py-8 text-center">No data yet. Publish articles to see stats.</p>
          ) : (
            <div className="space-y-1">
              {topArticles.map((article, i) => (
                <div key={article.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition-colors group">
                  <span className="text-xs font-mono text-[#52525b] w-5 shrink-0">{i + 1}</span>
                  <p className="flex-1 text-sm text-[#d4d4d8] group-hover:text-[#fafafa] truncate transition-colors">{article.title}</p>
                  <span className="text-xs font-mono text-[#a1a1aa] shrink-0">{(article.views ?? 0).toLocaleString()} views</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Traffic Sources */}
        <div className="admin-card p-6">
          <h2 className="text-base font-semibold text-[#fafafa] mb-6">Traffic Sources</h2>
          <div className="space-y-5">
            {traffic.map(src => (
              <TrafficBar key={src.source} label={src.source} percentage={src.percentage} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card p-6">
        <h2 className="text-base font-semibold text-[#fafafa] mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/articles/new" className="flex items-center gap-2 bg-[#fafafa] text-[#09090b] rounded-lg font-semibold text-sm px-4 py-2 hover:bg-white transition-colors">
            + New Article
          </Link>
          <Link href="/admin/comments" className="flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)]">
            Moderate Comments
          </Link>
          <Link href="/admin/tips" className="flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)]">
            Tips Queue
          </Link>
          <Link href="/admin/newsletter" className="flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)]">
            Send Newsletter
          </Link>
          <Link href="/admin/assignments" className="flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)]">
            Story Assignments
          </Link>
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
  title, value, icon, trend, trendColor = 'text-green-400', accent,
}: {
  title: string
  value: string
  icon: React.ReactNode
  trend?: string
  trendColor?: string
  accent?: 'amber'
}) {
  const borderColor = accent === 'amber' ? 'border-amber-500/20' : 'border-[rgba(255,255,255,0.08)]'
  const valueColor = accent === 'amber' ? 'text-amber-400' : 'text-[#fafafa]'

  return (
    <div className={`bg-[#111111] border ${borderColor} rounded-xl p-5 flex flex-col`}>
      <div className="flex items-center justify-between text-[#a1a1aa] mb-4">
        <span className="font-medium text-[10px] uppercase tracking-widest">{title}</span>
        {icon}
      </div>
      <div className={`text-3xl font-headline font-bold mb-1 ${valueColor}`}>{value}</div>
      {trend && <div className={`text-xs ${trendColor}`}>{trend}</div>}
    </div>
  )
}

function TrafficBar({ label, percentage }: { label: string; percentage: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-[#d4d4d8]">{label}</span>
        <span className="text-[#a1a1aa] font-mono text-xs">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#fafafa] rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
