import { z } from 'zod'

// ---- Auth ----
export const LoginSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address.' }).trim(),
  password: z.string().min(1, { error: 'Password is required.' }),
})

export const RegisterSchema = z.object({
  name: z.string().min(2, { error: 'Name must be at least 2 characters.' }).trim(),
  email: z.email({ error: 'Please enter a valid email address.' }).trim(),
  password: z
    .string()
    .min(8, { error: 'Password must be at least 8 characters.' })
    .regex(/[A-Z]/, { error: 'Must contain at least one uppercase letter.' })
    .regex(/[0-9]/, { error: 'Must contain at least one number.' }),
  role: z.enum(['founder', 'admin', 'publisher']).default('publisher'),
})

export const ForgotPasswordSchema = z.object({
  email: z.email().trim(),
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
})

// ---- Article ----
export const ArticleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.').max(200),
  title_bn: z.string().optional(),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
  subtitle: z.string().max(300).optional(),
  subtitle_bn: z.string().optional(),
  content: z.record(z.string(), z.unknown()),
  content_bn: z.record(z.string(), z.unknown()).optional(),
  excerpt: z.string().max(500).optional(),
  excerpt_bn: z.string().optional(),
  featured_image_url: z.string().url().optional().or(z.literal('')),
  featured_image_caption: z.string().optional(),
  featured_image_credit: z.string().optional(),
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
  meta_keywords: z.array(z.string()).optional(),
  category_id: z.string().uuid().optional().or(z.literal('')),
  article_type: z.enum(['news', 'opinion', 'feature', 'interview', 'photo_essay', 'video', 'live_blog', 'sponsored']).default('news'),
  status: z.enum(['draft', 'review', 'scheduled', 'published', 'archived']).default('draft'),
  is_breaking: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  is_trending: z.boolean().default(false),
  is_editors_pick: z.boolean().default(false),
  is_sponsored: z.boolean().default(false),
  allow_comments: z.boolean().default(true),
  published_at: z.string().optional(),
  scheduled_for: z.string().optional(),
  tags: z.array(z.string()).optional(),
  location_name: z.string().optional(),
  district: z.string().optional(),
  division: z.string().optional(),
})

export type ArticleFormData = z.infer<typeof ArticleSchema>

// ---- Category ----
export const CategorySchema = z.object({
  name: z.string().min(1, 'Name is required.').max(100),
  name_bn: z.string().optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  description_bn: z.string().optional(),
  parent_id: z.string().uuid().optional().or(z.literal('')),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#00A651'),
  is_featured: z.boolean().default(false),
  display_order: z.number().int().default(0),
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
})

// ---- Comment ----
export const CommentSchema = z.object({
  article_id: z.string().uuid(),
  parent_id: z.string().uuid().optional(),
  content: z.string().min(1, 'Comment cannot be empty.').max(2000),
  author_name: z.string().min(2).optional(),
  author_email: z.email().optional(),
})

// ---- Newsletter ----
export const NewsletterSubscribeSchema = z.object({
  email: z.email('Please enter a valid email.').trim(),
  name: z.string().min(2).optional(),
  language: z.enum(['en', 'bn']).default('en'),
  frequency: z.enum(['instant', 'daily', 'weekly']).default('daily'),
})

// ---- News Tip ----
export const NewsTipSchema = z.object({
  tipster_name: z.string().min(2).optional(),
  tipster_email: z.email().optional(),
  is_anonymous: z.boolean().default(false),
  subject: z.string().min(3, 'Subject is required.').max(200),
  description: z.string().min(10, 'Please provide more details.'),
  location: z.string().optional(),
  category_id: z.string().uuid().optional(),
})

// ---- User Profile ----
export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  facebook_url: z.string().url().optional().or(z.literal('')),
  twitter_url: z.string().url().optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  expertise_tags: z.array(z.string()).optional(),
})

export type LoginFormData = z.infer<typeof LoginSchema>
export type RegisterFormData = z.infer<typeof RegisterSchema>
export type CategoryFormData = z.infer<typeof CategorySchema>
export type CommentFormData = z.infer<typeof CommentSchema>
export type NewsletterFormData = z.infer<typeof NewsletterSubscribeSchema>
export type UpdateProfileFormData = z.infer<typeof UpdateProfileSchema>
