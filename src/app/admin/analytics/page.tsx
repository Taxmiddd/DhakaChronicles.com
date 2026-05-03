'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'
import { TrendingUp, Eye, Users, FileText, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DashboardStats {
  total_articles: number
  total_views: number
  total_users: number
  active_now: number
  views_today: number
  views_this_week: number
}

interface TrafficSource {
  source: string
  visits: number
  percentage: number
}

interface TopArticle {
  id: string
  title: string
  slug?: string
  views: number
  published_at?: string
}

interface AuthorStat {
  id: string
  full_name: string
  article_count: number
  total_views: number
}

interface ViewsChartPoint {
  date: string
  views: number
}

const MOCK_VIEWS_CHART = [
  { date: 'Apr 27', views: 3200 },
  { date: 'Apr 28', views: 4100 },
  { date: 'Apr 29', views: 3800 },
  { date: 'Apr 30', views: 5200 },
  { date: 'May 1', views: 4700 },
  { date: 'May 2', views: 6100 },
  { date: 'May 3', views: 5400 },
]

const COLORS = ['#00A651', '#F42A41', '#F59E0B', '#8B5CF6', '#06B6D4']

const DEFAULT_STATS: DashboardStats = {
  total_articles: 0,
  total_views: 0,
  total_users: 0,
  active_now: 0,
  views_today: 0,
  views_this_week: 0,
}

function toSafeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function normalizeStats(payload: unknown): DashboardStats {
  const data = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
  return {
    total_articles: toSafeNumber(data.total_articles),
    total_views: toSafeNumber(data.total_views),
    total_users: toSafeNumber(data.total_users),
    active_now: toSafeNumber(data.active_now),
    views_today: toSafeNumber(data.views_today),
    views_this_week: toSafeNumber(data.views_this_week),
  }
}

function normalizeTraffic(payload: unknown): TrafficSource[] {
  if (!Array.isArray(payload)) return []
  return payload
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const source = typeof row.source === 'string' ? row.source : 'Other'
      const visits = toSafeNumber(row.visits ?? row.count)
      const percentage = toSafeNumber(row.percentage)
      return { source, visits, percentage }
    })
    .filter((item): item is TrafficSource => item !== null)
}

function normalizeArticles(payload: unknown): TopArticle[] {
  if (!Array.isArray(payload)) return []
  return payload
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      if (typeof row.id !== 'string' || typeof row.title !== 'string') return null
      return {
        id: row.id,
        title: row.title,
        slug: typeof row.slug === 'string' ? row.slug : undefined,
        views: toSafeNumber(row.views ?? row.view_count),
        published_at: typeof row.published_at === 'string' ? row.published_at : undefined,
      }
    })
    .filter((item): item is TopArticle => item !== null)
}

function normalizeAuthors(payload: unknown): AuthorStat[] {
  if (!Array.isArray(payload)) return []
  return payload
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      if (typeof row.id !== 'string') return null
      return {
        id: row.id,
        full_name: typeof row.full_name === 'string'
          ? row.full_name
          : (typeof row.name === 'string' ? row.name : 'Unknown'),
        article_count: toSafeNumber(row.article_count ?? row.articles_published),
        total_views: toSafeNumber(row.total_views),
      }
    })
    .filter((item): item is AuthorStat => item !== null)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dc-surface border border-dc-border rounded-lg px-3 py-2 text-sm shadow-lg">
        <p className="text-dc-muted mb-1">{label}</p>
        <p className="text-white font-bold">{payload[0].value.toLocaleString()} views</p>
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [traffic, setTraffic] = useState<TrafficSource[]>([])
  const [topArticles, setTopArticles] = useState<TopArticle[]>([])
  const [authors, setAuthors] = useState<AuthorStat[]>([])
  const [viewsChart, setViewsChart] = useState<ViewsChartPoint[]>(MOCK_VIEWS_CHART)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function fetchAll(isBackgroundRefresh = false) {
      try {
        const [dashRes, trafficRes, articlesRes, authorsRes] = await Promise.allSettled([
          fetch('/api/analytics/dashboard'),
          fetch('/api/analytics/traffic'),
          fetch('/api/analytics/articles?limit=10'),
          fetch('/api/analytics/authors'),
        ])

        if (!mounted) return

        if (dashRes.status === 'fulfilled' && dashRes.value.ok) {
          const d = await dashRes.value.json()
          const dashboardData = d.stats ?? d.data ?? d
          setStats(normalizeStats(dashboardData))
          if (Array.isArray(dashboardData?.views_last_7_days)) {
            const normalizedViews = normalizeViewsChart(dashboardData.views_last_7_days)
            if (normalizedViews.length > 0) setViewsChart(normalizedViews)
          }
        }
        if (trafficRes.status === 'fulfilled' && trafficRes.value.ok) {
          const d = await trafficRes.value.json()
          setTraffic(normalizeTraffic(d.sources ?? d.data?.sources ?? d.data ?? d))
        }
        if (articlesRes.status === 'fulfilled' && articlesRes.value.ok) {
          const d = await articlesRes.value.json()
          setTopArticles(normalizeArticles(d.articles ?? d.data ?? []))
        }
        if (authorsRes.status === 'fulfilled' && authorsRes.value.ok) {
          const d = await authorsRes.value.json()
          setAuthors(normalizeAuthors(d.authors ?? d.data ?? []))
        }
      } catch {
        if (!isBackgroundRefresh) toast.error('Failed to load analytics')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchAll()
    const interval = setInterval(() => {
      fetchAll(true)
    }, 15000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  async function handleExport(format: 'csv' | 'json') {
    try {
      const res = await fetch(`/api/analytics/export?format=${format}`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-export.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed')
    }
  }

  const displayStats = stats ?? DEFAULT_STATS

  const statCards = displayStats
    ? [
        { label: 'Total Articles', value: displayStats.total_articles.toLocaleString(), icon: FileText, color: 'text-dc-green' },
        { label: 'Total Views', value: (displayStats.total_views / 1000).toFixed(1) + 'K', icon: Eye, color: 'text-dc-green' },
        { label: 'Active Users', value: displayStats.total_users.toLocaleString(), icon: Users, color: 'text-dc-green' },
        { label: 'Real-time Visitors', value: displayStats.active_now.toString(), icon: TrendingUp, color: 'text-dc-red' },
      ]
    : []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white">Analytics</h1>
          <p className="text-dc-muted text-sm mt-1">Performance overview for Dhaka Chronicles</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="btn-ghost px-3 py-2 text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="btn-ghost px-3 py-2 text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> JSON
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-dc-green" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-dc-muted">{label}</span>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-3xl font-headline font-bold text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Views Chart */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-headline font-bold text-white mb-6">Views — Last 7 Days</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={viewsChart} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#00A651"
                  strokeWidth={2}
                  dot={{ fill: '#00A651', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Traffic Sources */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-headline font-bold text-white mb-5">Traffic Sources</h2>
              {traffic.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={traffic} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                      <XAxis dataKey="source" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0f0f0', fontSize: 12 }}
                      />
                      <Bar dataKey="visits" radius={[4, 4, 0, 0]}>
                        {traffic.map((_: TrafficSource, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {traffic.map((src: TrafficSource, i: number) => (
                      <div key={src.source} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-dc-text">{src.source}</span>
                        </div>
                        <span className="text-dc-muted font-mono">{src.percentage ?? 0}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  {[
                    { source: 'Direct', pct: 45 },
                    { source: 'Facebook', pct: 30 },
                    { source: 'Google', pct: 15 },
                    { source: 'Twitter', pct: 6 },
                    { source: 'Other', pct: 4 },
                  ].map(({ source, pct }, i) => (
                    <div key={source}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-dc-text">{source}</span>
                        <span className="text-dc-muted font-mono">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-dc-surface-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Articles */}
            <div className="lg:col-span-2 glass rounded-xl p-6">
              <h2 className="text-lg font-headline font-bold text-white mb-5">Top Articles</h2>
              {topArticles.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-dc-muted text-xs uppercase tracking-wider border-b border-dc-border">
                        <th className="pb-3 text-left font-semibold">Title</th>
                        <th className="pb-3 text-right font-semibold">Views</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dc-border">
                      {topArticles.map((a: TopArticle) => (
                        <tr key={a.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 text-white font-medium line-clamp-1 pr-4">{a.title}</td>
                          <td className="py-3 text-right font-mono text-dc-green">{a.views?.toLocaleString() ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-dc-muted text-sm italic">No data yet.</p>
              )}
            </div>
          </div>

          {/* Author Performance */}
          {authors.length > 0 && (
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-headline font-bold text-white mb-5">Author Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-dc-muted text-xs uppercase tracking-wider border-b border-dc-border">
                      <th className="pb-3 text-left font-semibold">Author</th>
                      <th className="pb-3 text-right font-semibold">Articles</th>
                      <th className="pb-3 text-right font-semibold">Total Views</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dc-border">
                    {authors.map((a: AuthorStat) => (
                      <tr key={a.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 text-white font-medium">{a.full_name}</td>
                        <td className="py-3 text-right text-dc-muted">{a.article_count}</td>
                        <td className="py-3 text-right font-mono text-dc-green">{a.total_views?.toLocaleString() ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function normalizeViewsChart(payload: unknown): ViewsChartPoint[] {
  if (!Array.isArray(payload)) return []
  return payload
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      if (typeof row.date !== 'string') return null
      return {
        date: row.date,
        views: toSafeNumber(row.views),
      }
    })
    .filter((item): item is ViewsChartPoint => item !== null)
}
