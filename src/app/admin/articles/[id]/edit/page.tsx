'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArticleSchema, type ArticleFormData } from '@/lib/validations'
import { TipTapEditor } from '@/components/admin/TipTapEditor'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, Save, Send, Eye, Clock, Image as ImageIcon, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { slugify } from '@/lib/utils'
import { LiveBlogEditor } from '@/components/admin/LiveBlogEditor'
import EditorialNotes from '@/components/admin/EditorialNotes'
import { format } from 'date-fns'

interface Category { id: string; name: string }

type Props = { params: Promise<{ id: string }> }

export default function EditArticlePage({ params }: Props) {
  const router = useRouter()
  // React 19 unwrap params
  const { id } = use(params)
  const articleId = id
  
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentSlug, setCurrentSlug] = useState('')
  const [activeTab, setActiveTab] = useState<'en' | 'bn'>('en')
  const [versions, setVersions] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setCategories(d.categories ?? d.data ?? []) })
      .catch(() => {})
  }, [])

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isDirty } } =
    useForm<ArticleFormData>({
      resolver: zodResolver(ArticleSchema) as any,
    })

  const title = watch('title')

  const fetchVersions = useCallback(async () => {
    try {
      const res = await fetch(`/api/articles/${articleId}/versions`)
      if (res.ok) {
        const data = await res.json()
        setVersions(data.versions)
      }
    } catch (err) {
      console.error('Failed to load versions', err)
    }
  }, [articleId])

  useEffect(() => {
    fetch(`/api/articles/${articleId}`)
      .then(r => r.json())
      .then(({ data }) => {
        if (data) {
          // Format published_at for datetime-local input
          const publishedAt = data.published_at 
            ? new Date(data.published_at).toISOString().slice(0, 16) 
            : undefined

          reset({
            title: data.title || '',
            title_bn: data.title_bn || '',
            slug: data.slug || '',
            subtitle: data.subtitle || '',
            content: data.content || { type: 'doc', content: [] },
            content_bn: data.content_bn || { type: 'doc', content: [] },
            excerpt: data.excerpt || '',
            excerpt_bn: data.excerpt_bn || '',
            featured_image_url: data.featured_image_url || '',
            featured_image_caption: data.featured_image_caption || '',
            meta_title: data.meta_title || '',
            meta_description: data.meta_description || '',
            category_id: data.category_id || '',
            article_type: data.article_type || 'news',
            status: data.status || 'draft',
            is_breaking: data.is_breaking || false,
            is_featured: data.is_featured || false,
            is_trending: data.is_trending || false,
            is_editors_pick: data.is_editors_pick || false,
            allow_comments: data.allow_comments ?? true,
            is_sponsored: data.is_sponsored || false,
            published_at: publishedAt,
          })
          setCurrentSlug(data.slug)
          fetchVersions()
        }
      })
      .catch(() => toast.error('Failed to load article'))
      .finally(() => setLoading(false))
  }, [articleId, reset, fetchVersions])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setValue('title', newTitle, { shouldDirty: true })
    const slug = watch('slug')
    if (!slug || slugify(slug) === slugify(title || '')) {
      setValue('slug', slugify(newTitle), { shouldDirty: true })
    }
  }

  const onSubmit = async (data: ArticleFormData, targetStatus?: string) => {
    if (!articleId) return
    setIsSaving(true)
    try {
      let finalStatus = targetStatus || data.status
      if (data.published_at && new Date(data.published_at) > new Date() && targetStatus === 'published') {
        finalStatus = 'scheduled'
      }

      const payload = { ...data, status: finalStatus }
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to save')

      toast.success(
        result.data.status === 'published' ? 'Article published!' : 
        result.data.status === 'scheduled' ? 'Article scheduled!' : 'Changes saved.'
      )
      
      // Auto-snapshot a version if published/scheduled
      if (targetStatus === 'published' || finalStatus === 'scheduled') {
         await fetch(`/api/articles/${articleId}/versions`, { method: 'POST' })
         fetchVersions()
      }
      
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const restoreVersion = async (version: any) => {
    if (!confirm('Are you sure you want to restore this version? Current unsaved changes will be lost.')) return
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: version.title,
          content: version.content,
          excerpt: version.excerpt
        })
      })
      if (res.ok) {
        toast.success('Version restored')
        window.location.reload()
      } else {
        toast.error('Failed to restore version')
      }
    } catch {
      toast.error('Network error')
    }
  }

  const createVersionSnapshot = async () => {
    try {
      const res = await fetch(`/api/articles/${articleId}/versions`, { method: 'POST' })
      if (res.ok) {
        toast.success('Version snapshot created')
        fetchVersions()
      } else {
        toast.error('Failed to create snapshot')
      }
    } catch {
      toast.error('Network error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-dc-green" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/articles" className="p-2 rounded-lg bg-dc-surface hover:bg-dc-surface-2 text-dc-text transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-headline font-bold text-white">Edit Article</h1>
            {isDirty && <p className="text-xs text-amber-400 mt-0.5">Unsaved changes</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Language Tabs */}
          <div className="flex bg-black/50 rounded-lg p-1 border border-white/10">
            <button
              onClick={() => setActiveTab('en')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeTab === 'en' ? 'bg-[#00A651] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              English
            </button>
            <button
              onClick={() => setActiveTab('bn')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeTab === 'bn' ? 'bg-[#00A651] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              বাংলা
            </button>
          </div>

          {currentSlug && (
            <a
              href={`/news/${currentSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost px-3 py-2 text-sm flex items-center gap-2"
            >
              <Eye className="w-4 h-4" /> Preview
            </a>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => onSubmit(d))} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-xl space-y-5">
            {/* ENGLISH FIELDS */}
            <div className={activeTab === 'en' ? 'block' : 'hidden'}>
              <div className="mb-5">
                <label className="form-label" htmlFor="title">Headline (English)</label>
                <input
                  {...register('title')}
                  onChange={handleTitleChange}
                  id="title"
                  className="form-input text-lg font-headline"
                  placeholder="Enter English title..."
                />
                {errors.title && <p className="text-dc-red text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div className="mb-5">
                <label className="form-label" htmlFor="content">Content (English)</label>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <TipTapEditor
                      content={field.value}
                      onChange={field.onChange}
                      placeholder="Write the full story in English..."
                    />
                  )}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="excerpt">Excerpt (English)</label>
                <textarea
                  {...register('excerpt')}
                  id="excerpt"
                  className="form-input min-h-[90px] resize-y"
                  placeholder="A brief summary..."
                />
              </div>
            </div>

            {/* BANGLA FIELDS */}
            <div className={activeTab === 'bn' ? 'block' : 'hidden'}>
              <div className="mb-5">
                <label className="form-label" htmlFor="title_bn">Headline (Bangla)</label>
                <input
                  {...register('title_bn')}
                  id="title_bn"
                  className="form-input text-lg font-headline font-bengali"
                  placeholder="বাংলা শিরোনাম লিখুন..."
                  dir="ltr"
                />
              </div>

              <div className="mb-5">
                <label className="form-label" htmlFor="content_bn">Content (Bangla)</label>
                <Controller
                  name="content_bn"
                  control={control}
                  render={({ field }) => (
                    <div className="font-bengali">
                      <TipTapEditor
                        content={field.value as any}
                        onChange={field.onChange}
                        placeholder="বিস্তারিত সংবাদ লিখুন..."
                      />
                    </div>
                  )}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="excerpt_bn">Excerpt (Bangla)</label>
                <textarea
                  {...register('excerpt_bn')}
                  id="excerpt_bn"
                  className="form-input min-h-[90px] resize-y font-bengali"
                  placeholder="সংক্ষিপ্তসার..."
                  dir="ltr"
                />
              </div>
            </div>
          </div>
          
          {watch('article_type') === 'live_blog' && (
            <LiveBlogEditor articleId={articleId} />
          )}
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-5">
          {/* Publishing */}
          <div className="glass p-5 rounded-xl space-y-4">
            <h3 className="font-headline font-bold text-white border-b border-dc-border pb-2">Publishing</h3>

            <div>
              <label className="form-label">Status</label>
              <select {...register('status')} className="form-input">
                <option value="draft">Draft</option>
                <option value="review">In Review</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="form-label flex items-center gap-2" htmlFor="published_at">
                <Clock className="w-4 h-4" /> Schedule Date/Time
              </label>
              <input 
                type="datetime-local" 
                {...register('published_at')} 
                id="published_at" 
                className="form-input text-sm" 
              />
              <p className="text-xs text-gray-500 mt-1">If set to future date, article will be scheduled.</p>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-white/10">
              {[
                { field: 'is_breaking' as const, label: 'Breaking News', color: 'accent-dc-red' },
                { field: 'is_featured' as const, label: 'Featured Article', color: 'accent-dc-green' },
                { field: 'is_trending' as const, label: 'Trending', color: 'accent-amber-400' },
                { field: 'is_editors_pick' as const, label: "Editor's Pick", color: 'accent-dc-green' },
                { field: 'allow_comments' as const, label: 'Allow Comments', color: 'accent-dc-green' },
                { field: 'is_sponsored' as const, label: 'Sponsored Content', color: 'accent-dc-text-muted' },
              ].map(({ field, label, color }) => (
                <label key={field} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register(field)} className={`w-4 h-4 ${color} bg-dc-surface border-dc-border rounded`} />
                  <span className="text-sm text-dc-text font-medium">{label}</span>
                </label>
              ))}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSubmit((d) => onSubmit(d, 'published'))}
                className="btn-primary flex-1 py-2.5 text-sm"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <><Send className="w-4 h-4" /> Publish</>}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-ghost flex-1 py-2.5 text-sm bg-white/5 hover:bg-white/10 text-white"
              >
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>

          {/* SEO & Meta */}
          <div className="glass p-5 rounded-xl space-y-4">
            <h3 className="font-headline font-bold text-white border-b border-dc-border pb-2">SEO & Media</h3>

            <div>
              <label className="form-label" htmlFor="category_id">Category</label>
              <select {...register('category_id')} id="category_id" className="form-input text-sm">
                <option value="">— Select Category —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" htmlFor="slug">URL Slug</label>
              <input {...register('slug')} id="slug" className="form-input text-sm font-mono" />
              {errors.slug && <p className="text-dc-red text-sm mt-1">{errors.slug.message}</p>}
            </div>

            <div>
              <label className="form-label flex items-center gap-2" htmlFor="featured_image_url">
                <ImageIcon className="w-4 h-4" /> Featured / OG Image URL
              </label>
              <input {...register('featured_image_url')} id="featured_image_url" className="form-input text-sm" placeholder="https://..." />
            </div>

            <div>
              <label className="form-label" htmlFor="featured_image_caption">Image Caption</label>
              <input {...register('featured_image_caption')} id="featured_image_caption" className="form-input text-sm" />
            </div>

            <div>
              <label className="form-label" htmlFor="article_type">Article Type</label>
              <select {...register('article_type')} id="article_type" className="form-input text-sm">
                <option value="news">News Report</option>
                <option value="opinion">Opinion</option>
                <option value="feature">Feature Story</option>
                <option value="interview">Interview</option>
                <option value="photo_essay">Photo Essay</option>
                <option value="video">Video Report</option>
                <option value="live_blog">Live Blog</option>
                <option value="sponsored">Sponsored</option>
              </select>
            </div>
          </div>

          {/* Version History */}
          <div className="glass p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-dc-border pb-2">
              <h3 className="font-headline font-bold text-white">Version History</h3>
              <button type="button" onClick={createVersionSnapshot} className="text-xs bg-[#00A651]/20 hover:bg-[#00A651]/40 text-[#00A651] px-2 py-1 rounded">
                Snapshot
              </button>
            </div>
            
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {versions.length === 0 ? (
                <p className="text-sm text-gray-500">No versions saved yet.</p>
              ) : (
                versions.map((v) => (
                  <div key={v.id} className="flex items-center justify-between text-sm bg-black/20 p-2 rounded border border-white/5">
                    <div>
                      <p className="text-gray-300 font-medium">v{v.version}</p>
                      <p className="text-gray-500 text-xs">{format(new Date(v.created_at), 'MMM d, h:mm a')}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => restoreVersion(v)}
                      className="text-gray-400 hover:text-white p-1"
                      title="Restore this version"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Editorial Notes */}
          <EditorialNotes articleId={articleId} />
        </div>
      </form>
    </div>
  )
}
