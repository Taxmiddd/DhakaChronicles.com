'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Edit, Eye, Trash, Loader2, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Article {
  id: string
  title: string
  slug: string
  status: string
  published_at: string | null
  created_at: string
  author: { full_name: string } | null
  category: { name: string } | null
}

const STATUS_FILTERS = ['all', 'published', 'draft', 'review', 'scheduled', 'archived']

const STATUS_COLOR: Record<string, string> = {
  published: 'bg-dc-green/10 text-dc-green',
  draft: 'bg-dc-muted/10 text-dc-muted',
  review: 'bg-amber-500/10 text-amber-500',
  scheduled: 'bg-blue-500/10 text-blue-400',
  archived: 'bg-dc-surface-2 text-dc-muted',
}

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (searchTerm) params.set('search', searchTerm)
      const res = await fetch(`/api/articles?${params}`)
      const json = await res.json()
      if (json.data) setArticles(json.data)
    } catch {
      toast.error('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Article deleted')
      setArticles(prev => prev.filter(a => a.id !== id))
    } catch {
      toast.error('Failed to delete article')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white">Articles</h1>
          <p className="text-dc-muted text-sm mt-1">Manage your news content and publishing workflow.</p>
        </div>
        <Link href="/admin/articles/new" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Create Article
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dc-muted" />
          <input
            type="text"
            placeholder="Search articles..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilters(v => !v)}
            className="btn-ghost flex items-center gap-2 px-4 h-full"
          >
            <Filter className="w-4 h-4" />
            {statusFilter === 'all' ? 'All Statuses' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            <ChevronDown className="w-4 h-4" />
          </button>
          {showFilters && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-dc-surface border border-dc-border rounded-xl shadow-xl z-20 overflow-hidden">
              {STATUS_FILTERS.map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setShowFilters(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm capitalize hover:bg-dc-surface-2 transition-colors ${
                    statusFilter === s ? 'text-dc-green font-semibold' : 'text-dc-text'
                  }`}
                >
                  {s === 'all' ? 'All Statuses' : s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-dc-green" />
        </div>
      ) : (
        <div className="glass overflow-hidden rounded-xl border border-dc-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-dc-surface-2 text-dc-muted text-xs uppercase font-black tracking-widest border-b border-dc-border">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dc-border">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-dc-surface/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-white font-bold text-sm line-clamp-1">{article.title}</p>
                      <p className="text-dc-muted text-xs font-mono mt-0.5">/{article.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${STATUS_COLOR[article.status] ?? 'bg-dc-surface-2 text-dc-muted'}`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-dc-muted">{article.category?.name || 'Uncategorized'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-dc-green/20 flex items-center justify-center text-[10px] font-bold text-dc-green">
                          {article.author?.full_name?.substring(0, 2).toUpperCase() || 'DC'}
                        </div>
                        <span className="text-xs text-white font-medium">{article.author?.full_name || 'Staff'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-dc-muted">
                      {article.published_at
                        ? format(new Date(article.published_at), 'MMM d, yyyy')
                        : format(new Date(article.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/news/${article.slug}`}
                          target="_blank"
                          className="p-2 hover:bg-dc-surface-2 rounded-lg text-dc-muted hover:text-white transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="p-2 hover:bg-dc-surface-2 rounded-lg text-dc-muted hover:text-dc-green transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id, article.title)}
                          disabled={deleting === article.id}
                          className="p-2 hover:bg-dc-surface-2 rounded-lg text-dc-muted hover:text-dc-red transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === article.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredArticles.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-dc-muted italic">No articles found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
