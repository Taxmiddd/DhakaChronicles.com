-- ==========================================
-- DHAKA CHRONICLES - SCHEMA SUPPLEMENT v2
-- Run this AFTER schema.sql
-- Safe to re-run: every statement uses IF NOT EXISTS / OR REPLACE / DO blocks
-- ==========================================

-- ── Users: drop legacy column, add missing social/contact fields ──────────────
ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone        TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS twitter_url  TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- ── Articles: missing analytics & workflow columns ────────────────────────────
-- view_count  (schema.sql used "views_count"; code uses "view_count")
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS view_count    INTEGER DEFAULT 0;
-- comment_count / share_count (incremented by comments & share routes)
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS share_count   INTEGER DEFAULT 0;
-- reading_time (displayed on article cards and article page)
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS reading_time  INTEGER;
-- version counter (used by article_versions history)
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS version       INTEGER DEFAULT 1;
-- scheduled_at (workflow: article scheduled for future publish)
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS scheduled_at   TIMESTAMPTZ;
-- allow_comments (toggle per-article comment section)
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS allow_comments BOOLEAN DEFAULT true;

-- ── Categories: ordering and timestamps ──────────────────────────────────────
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ DEFAULT NOW();

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_modtime') THEN
    CREATE TRIGGER update_categories_modtime
      BEFORE UPDATE ON public.categories
      FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
  END IF;
END $$;

-- ── Ads ───────────────────────────────────────────────────────────────────────
-- Positions: homepage_banner, article_sidebar, article_inline, feed_native,
--            sticky_mobile, before_footer, category_banner
-- Sizes:     leaderboard, rectangle, skyscraper, native, bite-sized
CREATE TABLE IF NOT EXISTS public.ads (
  id               UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name      TEXT    NOT NULL,
  title            TEXT    NOT NULL,
  image_url        TEXT    NOT NULL,
  link_url         TEXT    NOT NULL,
  position         TEXT    NOT NULL,
  size             TEXT    NOT NULL,
  is_active        BOOLEAN DEFAULT true,
  starts_at        TIMESTAMPTZ,
  ends_at          TIMESTAMPTZ,
  click_count      INTEGER DEFAULT 0,
  impression_count INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ads_position  ON public.ads(position);
CREATE INDEX IF NOT EXISTS idx_ads_is_active ON public.ads(is_active);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ads' AND policyname = 'Public can view active ads') THEN
    CREATE POLICY "Public can view active ads"
      ON public.ads FOR SELECT
      USING (is_active = true
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (ends_at   IS NULL OR ends_at   >  NOW()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ads' AND policyname = 'Admins can manage ads') THEN
    CREATE POLICY "Admins can manage ads"
      ON public.ads FOR ALL
      USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('founder', 'admin')));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ads_modtime') THEN
    CREATE TRIGGER update_ads_modtime
      BEFORE UPDATE ON public.ads
      FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
  END IF;
END $$;

-- ── Breaking news banners ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.breaking_news_banners (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message    TEXT NOT NULL,
  url        TEXT,
  is_active  BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.breaking_news_banners ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'breaking_news_banners' AND policyname = 'Public can view active banners') THEN
    CREATE POLICY "Public can view active banners"
      ON public.breaking_news_banners FOR SELECT
      USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'breaking_news_banners' AND policyname = 'Staff can manage banners') THEN
    CREATE POLICY "Staff can manage banners"
      ON public.breaking_news_banners FOR ALL
      USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('founder', 'admin')));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_breaking_banners_modtime') THEN
    CREATE TRIGGER update_breaking_banners_modtime
      BEFORE UPDATE ON public.breaking_news_banners
      FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
  END IF;
END $$;

-- ── Article views (analytics) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.article_views (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id  UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  session_id  TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  referrer    TEXT,
  device_type TEXT,
  viewed_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_views_article    ON public.article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_viewed_at  ON public.article_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_views_session    ON public.article_views(session_id);

ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'article_views' AND policyname = 'Anyone can insert views') THEN
    CREATE POLICY "Anyone can insert views"
      ON public.article_views FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'article_views' AND policyname = 'Admins can read views') THEN
    CREATE POLICY "Admins can read views"
      ON public.article_views FOR SELECT
      USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('founder', 'admin')));
  END IF;
END $$;

-- ── Article reactions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.article_reactions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id    UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like','love','insightful','sad','angry')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reactions_article ON public.article_reactions(article_id);
ALTER TABLE public.article_reactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'article_reactions' AND policyname = 'Anyone can read reactions') THEN
    CREATE POLICY "Anyone can read reactions"
      ON public.article_reactions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'article_reactions' AND policyname = 'Anyone can insert reactions') THEN
    CREATE POLICY "Anyone can insert reactions"
      ON public.article_reactions FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'article_reactions' AND policyname = 'Users can delete own reactions') THEN
    CREATE POLICY "Users can delete own reactions"
      ON public.article_reactions FOR DELETE
      USING (user_id = auth.uid() OR user_id IS NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'article_reactions' AND policyname = 'Users can update own reactions') THEN
    CREATE POLICY "Users can update own reactions"
      ON public.article_reactions FOR UPDATE
      USING (user_id = auth.uid() OR user_id IS NULL);
  END IF;
END $$;

-- ── Article versions (revision history) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.article_versions (
  id             UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id     UUID    REFERENCES public.articles(id) ON DELETE CASCADE,
  version        INTEGER NOT NULL,
  title          TEXT    NOT NULL,
  content        JSONB   NOT NULL,
  edited_by      UUID    REFERENCES public.users(id) ON DELETE SET NULL,
  change_summary TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_versions_article ON public.article_versions(article_id);
ALTER TABLE public.article_versions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'article_versions' AND policyname = 'Staff can manage article versions') THEN
    CREATE POLICY "Staff can manage article versions"
      ON public.article_versions FOR ALL
      USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('founder', 'admin', 'publisher')));
  END IF;
END $$;

-- ── Comments ──────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comment_status') THEN
    CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'rejected', 'spam');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.comments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id   UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  parent_id    UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  author_name  TEXT,
  author_email TEXT,
  author_ip    TEXT,
  content      TEXT NOT NULL,
  status       comment_status DEFAULT 'pending',
  upvotes      INTEGER DEFAULT 0,
  downvotes    INTEGER DEFAULT 0,
  deleted_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_article ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent  ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status  ON public.comments(status);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Public can view approved comments') THEN
    CREATE POLICY "Public can view approved comments"
      ON public.comments FOR SELECT
      USING (status = 'approved' AND deleted_at IS NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Anyone can insert comments') THEN
    CREATE POLICY "Anyone can insert comments"
      ON public.comments FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Admins can manage all comments') THEN
    CREATE POLICY "Admins can manage all comments"
      ON public.comments FOR ALL
      USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('founder', 'admin')));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Authors can update own comments') THEN
    CREATE POLICY "Authors can update own comments"
      ON public.comments FOR UPDATE
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_comments_modtime') THEN
    CREATE TRIGGER update_comments_modtime
      BEFORE UPDATE ON public.comments
      FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
  END IF;
END $$;

-- ── News tips ─────────────────────────────────────────────────────────────────
-- Column names match what the tip-submit API actually inserts:
--   subject, description, tipster_name, tipster_email, tipster_phone, location,
--   is_anonymous, status, priority
CREATE TABLE IF NOT EXISTS public.news_tips (
  id             UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject        TEXT    NOT NULL,
  description    TEXT    NOT NULL,
  tipster_name   TEXT,
  tipster_email  TEXT,
  tipster_phone  TEXT,
  location       TEXT,
  is_anonymous   BOOLEAN DEFAULT false,
  status         TEXT    DEFAULT 'new'    CHECK (status   IN ('new','reviewed','used','dismissed')),
  priority       TEXT    DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  internal_notes TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate existing installs that have the old column names
ALTER TABLE public.news_tips ADD COLUMN IF NOT EXISTS description    TEXT;
ALTER TABLE public.news_tips ADD COLUMN IF NOT EXISTS tipster_name   TEXT;
ALTER TABLE public.news_tips ADD COLUMN IF NOT EXISTS tipster_email  TEXT;
ALTER TABLE public.news_tips ADD COLUMN IF NOT EXISTS tipster_phone  TEXT;
ALTER TABLE public.news_tips ADD COLUMN IF NOT EXISTS location       TEXT;
ALTER TABLE public.news_tips ADD COLUMN IF NOT EXISTS priority       TEXT DEFAULT 'medium';
ALTER TABLE public.news_tips ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE public.news_tips ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ DEFAULT NOW();

-- Drop NOT NULL from old "message" column so old rows don't break
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'news_tips' AND column_name = 'message'
  ) THEN
    ALTER TABLE public.news_tips ALTER COLUMN message DROP NOT NULL;
  END IF;
END $$;

ALTER TABLE public.news_tips ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'news_tips' AND policyname = 'Anyone can submit tips') THEN
    CREATE POLICY "Anyone can submit tips"
      ON public.news_tips FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'news_tips' AND policyname = 'Admins can manage tips') THEN
    CREATE POLICY "Admins can manage tips"
      ON public.news_tips FOR ALL
      USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('founder', 'admin')));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_news_tips_modtime') THEN
    CREATE TRIGGER update_news_tips_modtime
      BEFORE UPDATE ON public.news_tips
      FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
  END IF;
END $$;

-- ── Polls ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.polls (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  question    TEXT    NOT NULL,
  article_id  UUID    REFERENCES public.articles(id) ON DELETE SET NULL,
  is_active   BOOLEAN DEFAULT true,
  total_votes INTEGER DEFAULT 0,
  starts_at   TIMESTAMPTZ DEFAULT NOW(),
  ends_at     TIMESTAMPTZ,
  created_by  UUID    REFERENCES public.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.poll_options (
  id            UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id       UUID    REFERENCES public.polls(id) ON DELETE CASCADE,
  option_text   TEXT    NOT NULL,
  vote_count    INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id    UUID REFERENCES public.polls(id)        ON DELETE CASCADE,
  option_id  UUID REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES public.users(id)        ON DELETE SET NULL,
  session_id TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (poll_id, user_id),
  UNIQUE (poll_id, session_id)
);

ALTER TABLE public.polls        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes   ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'polls' AND policyname = 'Public can view active polls') THEN
    CREATE POLICY "Public can view active polls"
      ON public.polls FOR SELECT USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'polls' AND policyname = 'Admins can manage polls') THEN
    CREATE POLICY "Admins can manage polls"
      ON public.polls FOR ALL
      USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('founder', 'admin')));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'poll_options' AND policyname = 'Public can view poll options') THEN
    CREATE POLICY "Public can view poll options"
      ON public.poll_options FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'poll_options' AND policyname = 'Admins can manage poll options') THEN
    CREATE POLICY "Admins can manage poll options"
      ON public.poll_options FOR ALL
      USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('founder', 'admin')));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'poll_votes' AND policyname = 'Anyone can vote') THEN
    CREATE POLICY "Anyone can vote"
      ON public.poll_votes FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'poll_votes' AND policyname = 'Users can see own votes') THEN
    CREATE POLICY "Users can see own votes"
      ON public.poll_votes FOR SELECT
      USING (user_id = auth.uid() OR session_id IS NOT NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_polls_modtime') THEN
    CREATE TRIGGER update_polls_modtime
      BEFORE UPDATE ON public.polls
      FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
  END IF;
END $$;

-- ── Reading lists (saved articles) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reading_lists (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES public.users(id)   ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  added_at   TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, article_id)
);

-- Ensure added_at exists on tables created by older supplement run
ALTER TABLE public.reading_lists ADD COLUMN IF NOT EXISTS added_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_reading_lists_user ON public.reading_lists(user_id);
ALTER TABLE public.reading_lists ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reading_lists' AND policyname = 'Users can manage own reading list') THEN
    CREATE POLICY "Users can manage own reading list"
      ON public.reading_lists FOR ALL
      USING (user_id = auth.uid());
  END IF;
END $$;

-- ── Editorial calendar ────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'calendar_event_type') THEN
    CREATE TYPE calendar_event_type AS ENUM ('article_deadline','scheduled_publish','meeting','event_coverage');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.editorial_calendar (
  id          UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT                NOT NULL,
  event_type  calendar_event_type NOT NULL DEFAULT 'article_deadline',
  start_date  TIMESTAMPTZ         NOT NULL,
  end_date    TIMESTAMPTZ,
  article_id  UUID REFERENCES public.articles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.users(id)    ON DELETE SET NULL,
  color       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_start ON public.editorial_calendar(start_date);
ALTER TABLE public.editorial_calendar ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'editorial_calendar' AND policyname = 'Staff can view calendar') THEN
    CREATE POLICY "Staff can view calendar"
      ON public.editorial_calendar FOR SELECT
      USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('founder', 'admin', 'publisher')));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'editorial_calendar' AND policyname = 'Admins can manage calendar') THEN
    CREATE POLICY "Admins can manage calendar"
      ON public.editorial_calendar FOR ALL
      USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('founder', 'admin')));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_calendar_modtime') THEN
    CREATE TRIGGER update_calendar_modtime
      BEFORE UPDATE ON public.editorial_calendar
      FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
  END IF;
END $$;

-- ── Team members (public-facing profiles, separate from auth users) ───────────
CREATE TABLE IF NOT EXISTS public.team_members (
  id            UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name     TEXT    NOT NULL,
  role          TEXT    NOT NULL,
  bio           TEXT,
  avatar_url    TEXT,
  twitter_url   TEXT,
  linkedin_url  TEXT,
  facebook_url  TEXT,
  is_active     BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Public can view active team members') THEN
    CREATE POLICY "Public can view active team members"
      ON public.team_members FOR SELECT
      USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Admins can manage team members') THEN
    CREATE POLICY "Admins can manage team members"
      ON public.team_members FOR ALL
      USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('founder', 'admin')));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_team_members_modtime') THEN
    CREATE TRIGGER update_team_members_modtime
      BEFORE UPDATE ON public.team_members
      FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
  END IF;
END $$;

-- ── RPCs ──────────────────────────────────────────────────────────────────────

-- Atomically increment article view_count or comment_count
CREATE OR REPLACE FUNCTION increment_article_stat(article_id UUID, field TEXT)
RETURNS void AS $$
BEGIN
  IF field = 'view_count' THEN
    UPDATE public.articles SET view_count    = view_count    + 1 WHERE id = article_id;
  ELSIF field = 'comment_count' THEN
    UPDATE public.articles SET comment_count = comment_count + 1 WHERE id = article_id;
  ELSIF field = 'share_count' THEN
    UPDATE public.articles SET share_count   = share_count   + 1 WHERE id = article_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomically increment poll option vote_count and poll total_votes
CREATE OR REPLACE FUNCTION increment_poll_vote(p_poll_id UUID, p_option_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.poll_options SET vote_count  = vote_count  + 1 WHERE id = p_option_id;
  UPDATE public.polls         SET total_votes = total_votes + 1 WHERE id = p_poll_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
