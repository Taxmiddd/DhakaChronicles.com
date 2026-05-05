# Article Visibility Issues - Diagnosis & Fixes

## Problems Found & Fixed

### 1. **Missing `/news` Page (CRITICAL)**
- **Issue**: Homepage "View all" link pointed to `/news` but page didn't exist
- **Impact**: Users couldn't browse all news articles
- **Status**: ✅ FIXED - Created [src/app/(public)/news/page.tsx](src/app/(public)/news/page.tsx)
- **Details**: New page lists all published articles with pagination and category browser

### 2. **"Unsaved Changes" Persists After Save**
- **Issue**: After publishing/saving, form still showed "Unsaved changes" indicator
- **Root Cause**: Form wasn't being reset after successful API response
- **Status**: ✅ FIXED - Updated [src/app/admin/articles/[id]/edit/page.tsx](src/app/admin/articles/[id]/edit/page.tsx)
- **Details**: Now calls `reset(formData)` after save to clear `isDirty` state

### 3. **Database Enum Mismatch (CRITICAL)**
- **Issue**: Code tried to use status='scheduled'/'archived' but database enum only supported 'draft'/'review'/'published'
- **Root Cause**: Schema mismatch between database and validation schema
- **Impact**: Articles with future `published_at` dates would fail to create
- **Status**: ✅ FIXED - Updated [schema_supplement.sql](schema_supplement.sql)
- **Details**: Migration now updates the enum to support all 5 statuses

### 4. **Scheduling Logic Bug**
- **Issue**: New article form would force any article with future `published_at` to 'scheduled' status, even when publishing immediately
- **Root Cause**: Missing check for `targetStatus === 'published'` before override
- **Status**: ✅ FIXED - Updated [src/app/admin/articles/new/page.tsx](src/app/admin/articles/new/page.tsx)
- **Details**: Now only schedules if explicitly publishing to a future date

---

## What You Need to Do

### Step 1: Run Database Migration
Run the updated `schema_supplement.sql` on your Supabase database to update the article_status enum:
```sql
-- Run this in Supabase SQL Editor
-- The migration safely handles schema updates
```

### Step 2: Deploy Code Changes
The following files have been updated:
- `src/app/(public)/news/page.tsx` - NEW PAGE
- `src/app/admin/articles/[id]/edit/page.tsx` - Form reset fix
- `src/app/admin/articles/new/page.tsx` - Scheduling logic fix  
- `schema_supplement.sql` - Enum migration

### Step 3: Test Article Creation
1. Go to **Admin → Articles → New Article**
2. Fill in title, content, and select a category (e.g., Business)
3. Click **Publish** button
4. Should see toast: "Article published!"
5. Check:
   - **Homepage** → Should appear in "Latest Stories" section
   - **Category page** → Should appear in the category you selected
   - **/news** → Should appear in the all-news listing

---

## Why Articles Weren't Showing

**Root Cause Chain:**
1. When user tried to create article with future `published_at`, code set `status='scheduled'`
2. Database rejected `scheduled` status (enum mismatch)  
3. Article creation failed silently or with unclear error
4. Even if article was created, only `status='published'` rows show on website (RLS policy)

**The Queries Filter By:**
- `status = 'published'` on homepage, category pages, and `/news`
- RLS policy: "Public can view published articles" only shows `status='published'` rows

---

## Files Modified

| File | Changes |
|------|---------|
| `src/app/(public)/news/page.tsx` | **NEW** - Lists all published articles |
| `src/app/admin/articles/[id]/edit/page.tsx` | Form reset after save (lines ~156-187) |
| `src/app/admin/articles/new/page.tsx` | Scheduling logic fix (lines ~55-61) |
| `schema_supplement.sql` | Enum update migration (lines ~7-32) |

---

## Architecture Notes

### Article Status Workflow
```
draft → (Save as Draft)
     → (Publish) → published
     → (Publish with future date) → scheduled
     → (Archive) → archived
     → (Review) → review
```

### Visibility Rules (RLS)
- **Public users**: Can see articles with `status='published'` only
- **Admins/Founders**: Can see all statuses
- **Publishers**: Can see their own articles in any status

### What Triggers Visibility
An article appears on the website **only** when:
1. `status = 'published'` ✓
2. Category is selected ✓ (for category pages only)
3. RLS policy allows viewing ✓

---

## Next Steps

If articles still don't show after these fixes:
1. Check browser console for fetch errors
2. Check Supabase logs for database errors
3. Verify article was created: Admin → Articles → filter by status=published
4. Check category was saved: article row should have category_id value
