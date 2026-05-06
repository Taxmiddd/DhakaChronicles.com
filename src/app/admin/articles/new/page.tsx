'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArticleSchema, type ArticleFormData } from '@/lib/validations'
import { TipTapEditor } from '@/components/admin/TipTapEditor'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, Save, Send, Clock } from 'lucide-react'
import { ImageDropZone } from '@/components/admin/ImageDropZone'
import Link from 'next/link'
import { slugify } from '@/lib/utils'

interface Category { id: string; name: string }

export default function NewArticlePage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'en' | 'bn'>('en')
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setCategories(d.categories ?? d.data ?? []) })
      .catch(() => {})
  }, [])

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } =
    useForm<ArticleFormData>({
      resolver: zodResolver(ArticleSchema) as any,
      defaultValues: {
        status: 'draft',
        article_type: 'news',
        content: { type: 'doc', content: [] },
        content_bn: { type: 'doc', content: [] },
        is_breaking: false,
        is_featured: false,
        allow_comments: true,
      }
    })

  const title = watch('title')

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setValue('title', newTitle, { shouldDirty: true })
    const slug = watch('slug')
    if (!slug || slugify(slug) === slugify(title || '')) {
      setValue('slug', slugify(newTitle), { shouldDirty: true })
    }
  }

  const onError = (errs: any) => {
    const first = Object.values(errs)[0] as any
    toast.error(first?.message ?? 'Please fix form errors before publishing.')
  }

  const onSubmit = async (data: ArticleFormData, targetStatus?: string) => {
    setIsSaving(true)
    try {
      let finalStatus = targetStatus || data.status
      
      // Only set to scheduled if explicitly requested and date is in future
      if (targetStatus === 'published' && data.published_at && new Date(data.published_at) > new Date()) {
        finalStatus = 'scheduled'
      }

      const payload = { ...data, status: finalStatus }
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to create')

      toast.success(
        result.data.status === 'published' ? 'Article published!' : 
        result.data.status === 'scheduled' ? 'Article scheduled!' : 'Draft created.'
      )
      router.push(`/admin/articles/${result.data.id}/edit`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/articles" className="p-2 rounded-lg bg-dc-surface hover:bg-dc-surface-2 text-dc-text transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-headline font-bold text-white">Create New Article</h1>
        </div>
        
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
      </div>

      <form onSubmit={handleSubmit((d) => onSubmit(d), onError)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
        </div>

        <div className="space-y-5">
          <div className="glass p-5 rounded-xl space-y-4">
            <h3 className="font-headline font-bold text-white border-b border-dc-border pb-2">Publishing</h3>
            
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
              <p className="text-xs text-gray-500 mt-1">Leave blank to publish immediately</p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSubmit((d) => onSubmit(d, 'published'), onError)}
                className="btn-primary flex-1 py-2.5 text-sm"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <><Send className="w-4 h-4" /> Publish</>}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-ghost flex-1 py-2.5 text-sm"
              >
                <Save className="w-4 h-4" /> Save Draft
              </button>
            </div>
          </div>

          <div className="glass p-5 rounded-xl space-y-4">
            <h3 className="font-headline font-bold text-white border-b border-dc-border pb-2">Media & SEO</h3>
            <div>
              <label className="form-label mb-2 block">Featured / OG Image</label>
              <Controller
                name="featured_image_url"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <ImageDropZone value={field.value ?? ''} onChange={field.onChange} />
                )}
              />
            </div>
          </div>

          <div className="glass p-5 rounded-xl space-y-4">
            <h3 className="font-headline font-bold text-white border-b border-dc-border pb-2">Settings</h3>

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
              <label className="form-label" htmlFor="article_type">Article Type</label>
              <select {...register('article_type')} id="article_type" className="form-input text-sm">
                <option value="news">News Report</option>
                <option value="opinion">Opinion</option>
                <option value="feature">Feature Story</option>
                <option value="interview">Interview</option>
                <option value="photo_essay">Photo Essay</option>
                <option value="video">Video Report</option>
                <option value="live_blog">Live Blog</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
