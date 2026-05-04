'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Users, FileText, Activity, RefreshCw, Eye, Plus, BarChart3 } from 'lucide-react'
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

interface QuickAction {
  title: string
  description: string
  href: string
  icon: React.ElementType
  color: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: 'New Article',
    description: 'Write a new story',
    href: '/admin/articles/new',
    icon: Plus,
    color: 'bg-dc-green',
  },
  {
    title: 'View Analytics',
    description: 'Check site performance',
    href: '/admin/analytics',
    icon: BarChart3,
    color: 'bg-blue-500',
  },
  {
    title: 'Manage Comments',
    description: 'Moderate user comments',
    href: '/admin/comments',
    icon: FileText,
    color: 'bg-purple-500',
  },
]

export default function MobileAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [topArticles, setTopArticles] = useState<TopArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboard = async (showToast = false) => {
    try {
      setRefreshing(true)
      const res = await fetch('/api/analytics/dashboard')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setTopArticles(data.topArticles || [])
        if (showToast) toast.success('Dashboard refreshed')
      }
    } catch (err) {
      console.error('Failed to fetch dashboard:', err)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header with refresh */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-dc-green/20 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-dc-green" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total_articles || 0}</p>
                <p className="text-xs text-gray-400">Articles</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total_views?.toLocaleString() || '0'}</p>
                <p className="text-xs text-gray-400">Views</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total_users?.toLocaleString() || '0'}</p>
                <p className="text-xs text-gray-400">Users</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.active_now || 0}</p>
                <p className="text-xs text-gray-400">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition-colors block"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">{action.title}</h3>
                      <p className="text-sm text-gray-400">{action.description}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Top Articles */}
        {topArticles.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Top Articles</h2>
            <div className="space-y-3">
              {topArticles.slice(0, 5).map((article) => (
                <Link
                  key={article.id}
                  href={`/admin/articles/${article.id}/edit`}
                  className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition-colors block"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">{article.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views?.toLocaleString() || '0'}
                        </span>
                        {article.published_at && (
                          <span>
                            {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Placeholder */}
        <div className="bg-gray-800 rounded-xl p-4">
          <h3 className="font-medium mb-2">Recent Activity</h3>
          <p className="text-sm text-gray-400">Activity feed coming soon...</p>
        </div>
      </div>
    </div>
  )
}