# Dhaka Chronicles

> **The Voice of Dhaka** — A cinematic, multilingual digital newsroom built for speed, scale, and storytelling.

---

## Overview

Dhaka Chronicles is a full-stack digital news platform delivering English and Bangla journalism with a high-contrast cinematic aesthetic. Built on the Next.js App Router, it features a fully integrated editorial CMS, automated content pipelines, real-time analytics, and AI-assisted publishing workflows.

**Domain:** [dhakachronicles.com](https://dhakachronicles.com)
**Studio:** [NOÉTIC Studio](mailto:thenoeticstudio@gmail.com)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (PostgreSQL + RLS) |
| Caching | Upstash Redis |
| Rich Editor | TipTap (Bangla Unicode support) |
| Media | Cloudinary |
| Auth | NextAuth v5 + Supabase Adapter |
| Email | Resend |
| Monitoring | Sentry + UptimeRobot |
| Animations | Framer Motion |
| Analytics | Custom (Recharts dashboards) |

---

## Features

### Public Frontend
- Multilingual content (English / বাংলা) with localized JSON-LD structured data
- Article pages with reactions, threaded comments, and reading lists
- Live blog feed, podcast listing, and poll widgets
- Category browsing, full-text search, and RSS feeds per category
- Newsletter subscription, tip submission, and contact forms
- Cookie consent, privacy policy, and GDPR-ready pages
- PWA manifest and `next/font` optimized typography

### Editorial CMS (Admin)
- Role-based access: Founder / Admin / Publisher / Author
- TipTap rich-text editor with image embeds, tables, YouTube, and code blocks
- Article scheduling, version history, and editorial notes
- Podcast and live blog management
- Comment moderation and reader polls
- Assignment board and editorial calendar
- Subscriber management and newsletter broadcast
- Reader tips inbox
- Facebook post auto-import (Meta Graph API webhook → draft articles)

### Automation & Agents
| Agent | Role |
|---|---|
| **Sync-Node** | Ingests Facebook posts via webhook → CMS drafts |
| **Lexis-BN** | Manages TipTap JSON and Bangla metadata localization |
| **Pulse-Monitor** | Health checks for APIs and DB via Vercel Cron |
| **SEO-Bot** | Generates XML, News, and Image sitemaps via `next-sitemap` |

### Analytics
- Real-time active readers
- Traffic, article performance, author stats
- CSV/JSON export dashboard
- Per-article view tracking

---

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public-facing pages (articles, search, podcasts…)
│   ├── admin/             # Editorial CMS pages
│   └── api/               # API routes (articles, auth, analytics, webhooks…)
├── components/
│   ├── admin/             # CMS UI components
│   ├── article/           # Article-level widgets
│   ├── layout/            # Header, footer
│   ├── seo/               # JSON-LD structured data
│   └── ui/                # Shared UI primitives
├── lib/
│   ├── auth/              # RBAC + session management
│   ├── db/                # Supabase client + admin
│   └── utils/             # Rate limiting, helpers
└── types/                 # Shared TypeScript types
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Cloudinary](https://cloudinary.com) account
- An [Upstash Redis](https://upstash.com) database

### Installation

```bash
git clone https://github.com/your-org/dhaka-chronicles.git
cd dhaka-chronicles
npm install
```

### Environment Variables

Create a `.env.local` file at the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Resend (Email)
RESEND_API_KEY=

# Facebook (Webhook sync)
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_PAGE_ID=
FACEBOOK_VERIFY_TOKEN=

# Cron Security
CRON_SECRET=

# Local Weather / AQI / Traffic widgets
OPENWEATHERMAP_API_KEY=
TOMTOM_API_KEY=   # optional: enables numeric live traffic speed/congestion
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm run start
```

---

## Deployment

The platform is optimized for **Vercel** deployment. Push to your linked repository and Vercel handles builds, environment injection, and edge caching automatically.

Vercel Cron is used for:
- Scheduled Facebook sync (`/api/cron/facebook-sync`)
- Health pulse monitoring (`/api/health`)
- Sitemap regeneration

---

## Design System

| Token | Value |
|---|---|
| Background | `#000000` (Black) |
| Surface | `#111111` |
| Primary | `#FFFFFF` (White) |
| Accent Green | `#16a34a` |
| Accent Red | `#dc2626` |
| Body Font | Inter / System |
| Display Font | Cinematic Serif |

---

## Credits

**Lead Architect & Founder**
Tahmid Ashfaque — [NOÉTIC Studio](mailto:thenoeticstudio@gmail.com)

---

*Dhaka Chronicles — Implementation Timeline: 23 Weeks*
*Operational Document v2.1.0*
