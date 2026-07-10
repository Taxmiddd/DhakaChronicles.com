// ============================================
// DHAKA CHRONICLES - TypeScript Types
// ============================================

// ---- User & Auth ----
export type UserRole = 'founder' | 'admin' | 'publisher'

export interface User {
  id: string
  email: string
  name: string
  username?: string
  role: UserRole
  avatar_url?: string
  bio?: string
  phone?: string
  facebook_url?: string
  twitter_url?: string
  linkedin_url?: string
  expertise_tags?: string[]
  is_active: boolean
  email_verified: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatar_url?: string
}

// ---- Category ----
export interface Category {
  id: string
  name: string
  name_bn?: string
  slug: string
  description?: string
  description_bn?: string
  parent_id?: string
  parent?: Category
  icon?: string
  color: string
  display_order: number
  is_featured: boolean
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
  article_count?: number
}

// ---- Tag ----
export interface Tag {
  id: string
  name: string
  name_bn?: string
  slug: string
  usage_count: number
  created_at: string
}

// ---- Article ----
export type ArticleStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived' | 'deleted'
export type ArticleType = 'news' | 'opinion' | 'feature' | 'interview' | 'photo_essay' | 'video' | 'live_blog' | 'sponsored'

export interface Article {
  id: string
  title: string
  title_bn?: string
  slug: string
  subtitle?: string
  subtitle_bn?: string

  // Content
  content: Record<string, unknown> // TipTap JSON
  content_bn?: Record<string, unknown>
  excerpt?: string
  excerpt_bn?: string

  // Media
  featured_image_url?: string
  featured_image_caption?: string
  featured_image_credit?: string
  gallery_images?: GalleryImage[]

  // SEO
  meta_title?: string
  meta_description?: string
  meta_keywords?: string[]
  og_image_url?: string

  // Classification
  category_id?: string
  category?: Category
  author_id: string
  author?: User
  co_authors?: string[]
  tags?: Tag[]

  // Publishing
  status: ArticleStatus
  published_at?: string
  scheduled_for?: string

  // Type & Flags
  article_type: ArticleType
  is_breaking: boolean
  is_featured: boolean
  is_trending: boolean
  is_editors_pick: boolean
  is_sponsored: boolean
  allow_comments: boolean

  // Analytics
  view_count: number
  unique_view_count: number
  share_count: number
  comment_count: number
  reading_time?: number

  // Version
  version: number
  corrections?: Correction[]
  last_updated_note?: string

  // Location
  location_lat?: number
  location_lng?: number
  location_name?: string
  district?: string
  division?: string

  // External
  original_source_url?: string
  source_name?: string

  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface ArticleListItem {
  id: string
  title: string
  title_bn?: string
  slug: string
  excerpt?: string
  featured_image_url?: string
  category?: Pick<Category, 'id' | 'name' | 'name_bn' | 'slug' | 'color'>
  author?: Pick<User, 'id' | 'name' | 'avatar_url'>
  tags?: Pick<Tag, 'id' | 'name' | 'slug'>[]
  status: ArticleStatus
  article_type: ArticleType
  is_breaking: boolean
  is_featured: boolean
  is_trending: boolean
  view_count: number
  reading_time?: number
  published_at?: string
  created_at: string
}

export interface GalleryImage {
  url: string
  caption?: string
  credit?: string
  alt?: string
}

export interface Correction {
  text: string
  corrected_at: string
  corrected_by?: string
}

// ---- Media ----
export type MediaType = 'image' | 'video' | 'audio' | 'document'

export interface Media {
  id: string
  filename: string
  original_filename?: string
  url: string
  thumbnail_url?: string
  file_type: MediaType
  mime_type?: string
  file_size?: number
  width?: number
  height?: number
  duration?: number
  title?: string
  alt_text?: string
  caption?: string
  credit?: string
  copyright?: string
  folder?: string
  tags?: string[]
  uploaded_by?: string
  upload_source?: string
  is_processed: boolean
  cloudinary_id?: string
  created_at: string
  updated_at: string
}

// ---- Comment ----
export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam' | 'flagged'

export interface Comment {
  id: string
  article_id: string
  parent_id?: string
  user_id?: string
  author_name?: string
  author_email?: string
  content: string
  status: CommentStatus
  upvotes: number
  downvotes: number
  is_pinned: boolean
  is_edited: boolean
  replies?: Comment[]
  created_at: string
  updated_at: string
}

// ---- Ads ----
export interface PopupAd {
  id: string
  title: string
  image_url: string
  link_url?: string
  is_active: boolean
  display_frequency: 'always' | 'once_per_session' | 'once_per_day' | 'once_per_week'
  created_at: string
  updated_at: string
}

// ---- Newsletter Subscriber ----
export interface NewsletterSubscriber {
  id: string
  email: string
  name?: string
  status: 'active' | 'unsubscribed' | 'bounced'
  frequency?: 'instant' | 'daily' | 'weekly'
  categories?: string[]
  language: 'en' | 'bn'
  subscribed_at: string
}

// ---- API Responses ----
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ---- Article Filters ----
export interface ArticleFilters {
  status?: ArticleStatus
  category?: string
  author?: string
  tag?: string
  type?: ArticleType
  is_breaking?: boolean
  is_featured?: boolean
  search?: string
  from_date?: string
  to_date?: string
  page?: number
  limit?: number
  sort?: 'latest' | 'oldest' | 'popular' | 'trending'
  lang?: 'en' | 'bn'
}

// ---- Site Settings ----
export interface SiteSettings {
  site_name: string
  site_name_bn: string
  tagline: string
  tagline_bn: string
  logo_url: string
  favicon_url: string
  contact_email: string
  contact_phone: string
  address: string
  social_facebook: string
  social_twitter: string
  social_instagram: string
  social_youtube: string
  breaking_news_enabled: boolean
  maintenance_mode: boolean
}

// ---- Breaking News Banner ----
export interface BreakingNewsBanner {
  id: string
  title: string
  title_bn?: string
  link?: string
  is_active: boolean
  priority: number
  expires_at?: string
  created_at: string
}

// ---- Poll ----
export interface Poll {
  id: string
  question: string
  question_bn?: string
  poll_type: 'single' | 'multiple'
  article_id?: string
  is_active: boolean
  ends_at?: string
  total_votes: number
  options: PollOption[]
}

export interface PollOption {
  id: string
  option_text: string
  option_text_bn?: string
  display_order: number
  vote_count: number
}

// ---- Story Assignment ----
export type AssignmentStatus = 'assigned' | 'in_progress' | 'submitted' | 'completed' | 'cancelled'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface StoryAssignment {
  id: string
  title: string
  description?: string
  assigned_to?: string
  assigned_by: string
  category_id?: string
  deadline?: string
  priority: Priority
  status: AssignmentStatus
  article_id?: string
  notes?: string
  created_at: string
  updated_at: string
}
