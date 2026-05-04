import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Users, BarChart2, TrendingUp, Award, ChevronRight, Mail,
  FileText, Monitor, Trophy, Mic, Share2, Layers,
  ArrowRight, ExternalLink, Sparkles, Target, Zap,
  Star, Clock, Globe, Heart,
} from 'lucide-react'
import { supabaseAdmin } from '@/lib/db/admin'
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Brand Collaborations – Dhaka Chronicles',
  description: 'See how leading brands partner with Dhaka Chronicles to reach Bangladesh\'s most engaged digital audience.',
}

// ── Types ────────────────────────────────────────────────────────────────────

interface PortfolioItem {
  id: string
  brand_name: string
  project_name: string
  category: string
  description: string
  outcome: string | null
  logo_url: string | null
  featured_image_url: string | null
  external_link: string | null
  display_order: number
}

interface PartnerBrand {
  id: string
  name: string
  category: string
  logo_url: string | null
  color: string
  initial: string
  website_url: string | null
}

interface PortfolioService {
  id: string
  icon_name: string
  title: string
  description: string
}

// ── Static fallbacks ─────────────────────────────────────────────────────────

const FALLBACK_PARTNERS: PartnerBrand[] = [
  { id: '1',  name: 'bKash',              category: 'Fintech',       logo_url: null, color: '#E2136E', initial: 'bK', website_url: null },
  { id: '2',  name: 'PRAN',               category: 'Food & Bev.',   logo_url: null, color: '#D62828', initial: 'PR', website_url: null },
  { id: '3',  name: 'Hyundai',            category: 'Automotive',    logo_url: null, color: '#003087', initial: 'HY', website_url: null },
  { id: '4',  name: 'Philip Morris Intl', category: 'FMCG',          logo_url: null, color: '#1A1A2E', initial: 'PM', website_url: null },
  { id: '5',  name: 'JTI',                category: 'FMCG',          logo_url: null, color: '#004B87', initial: 'JT', website_url: null },
  { id: '6',  name: "Le d'Or",            category: 'Hospitality',   logo_url: null, color: '#8B6914', initial: 'LD', website_url: null },
  { id: '7',  name: 'United Group',       category: 'Conglomerate',  logo_url: null, color: '#F97316', initial: 'UG', website_url: null },
  { id: '8',  name: 'Gold Kinen',         category: 'Lifestyle',     logo_url: null, color: '#B8860B', initial: 'GK', website_url: null },
  { id: '9',  name: 'Clubhouse DHK',      category: 'Entertainment', logo_url: null, color: '#7C3AED', initial: 'CH', website_url: null },
  { id: '10', name: 'Fair Electronics',   category: 'Electronics',   logo_url: null, color: '#0EA5E9', initial: 'FE', website_url: null },
  { id: '11', name: 'Hisense',            category: 'Electronics',   logo_url: null, color: '#E63946', initial: 'HI', website_url: null },
  { id: '12', name: 'Footsteps',          category: 'Fashion',       logo_url: null, color: '#16A34A', initial: 'FS', website_url: null },
]

const FALLBACK_SERVICES: PortfolioService[] = [
  { id: '1', icon_name: 'FileText',  title: 'Native Content',          description: 'Long-form sponsored stories that blend seamlessly with our editorial voice.' },
  { id: '2', icon_name: 'Monitor',   title: 'Display Advertising',     description: 'Premium banner placements across homepage, article pages, and category sections.' },
  { id: '3', icon_name: 'Mail',      title: 'Newsletter Sponsorship',  description: 'Exclusive placement in our Morning Briefing — reaching 30K+ engaged subscribers.' },
  { id: '4', icon_name: 'Trophy',    title: 'Category Sponsorship',    description: 'Own a section. Get month-long prominent branding across an entire content vertical.' },
  { id: '5', icon_name: 'Mic',       title: 'Event Partnership',       description: 'Co-brand live events, panel discussions, and community activations.' },
  { id: '6', icon_name: 'Share2',    title: 'Social Amplification',    description: 'Extend campaign reach through our 100K+ social media following.' },
]

const STATS = [
  { icon: Users,      value: '500K+', label: 'Monthly Readers',    color: '#00A651', trend: '+12%' },
  { icon: BarChart2,  value: '4:30',  label: 'Avg. Time on Site',  color: '#06B6D4', trend: '+8%' },
  { icon: TrendingUp, value: '12M+',  label: 'Annual Impressions', color: '#8B5CF6', trend: '+25%' },
  { icon: Award,      value: '40+',   label: 'Brand Partners',     color: '#F59E0B', trend: '+15%' },
]

const ICON_MAP: Record<string, React.ElementType> = {
  FileText, Monitor, Mail, Trophy, Mic, Share2, Layers,
  Users, BarChart2, TrendingUp, Award,
}

// ── Data fetching ────────────────────────────────────────────────────────────

async function getPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('portfolio_items')
      .select('id, brand_name, project_name, category, description, outcome, logo_url, featured_image_url, external_link, display_order')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (error || !data) return []
    return data as PortfolioItem[]
  } catch {
    return []
  }
}

async function getPartnerBrands(): Promise<PartnerBrand[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('portfolio_partners')
      .select('id, name, category, logo_url, color, initial, website_url')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    if (error || !data || data.length === 0) return []
    return data as PartnerBrand[]
  } catch {
    return []
  }
}

async function getPortfolioServices(): Promise<PortfolioService[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('portfolio_services')
      .select('id, icon_name, title, description')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    if (error || !data || data.length === 0) return []
    return data as PortfolioService[]
  } catch {
    return []
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function PortfolioPage() {
  const [items, dynamicPartners, dynamicServices] = await Promise.all([
    getPortfolioItems(),
    getPartnerBrands(),
    getPortfolioServices(),
  ])

  const partners = dynamicPartners.length > 0 ? dynamicPartners : FALLBACK_PARTNERS
  const services = dynamicServices.length > 0 ? dynamicServices : FALLBACK_SERVICES
  const categories = Array.from(new Set(items.map(i => i.category)))

  return (
    <div>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-20 sm:py-28"
        style={{ background: 'linear-gradient(135deg, #060d09 0%, #0d1a12 60%, #060d09 100%)' }}
      >
        {/* Dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #00A651 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,166,81,0.07) 0%, transparent 65%)' }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-1.5 text-xs mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Brand Collaborations</span>
          </nav>

          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1.5 rounded-full mb-5"
            style={{ color: '#00A651', background: 'rgba(0,166,81,0.12)', border: '1px solid rgba(0,166,81,0.25)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-dc-green animate-pulse" />
            Partner With Us
          </span>

          <h1 className="font-headline font-black text-4xl sm:text-6xl text-white leading-tight mt-3 mb-5">
            Reach Bangladesh&apos;s{' '}
            <span className="text-dc-green">Most Engaged</span>{' '}
            Audience
          </h1>

          <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.55)' }}>
            From native content to category sponsorships — we craft campaigns that resonate
            with our readers and deliver measurable results for your brand.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/advertise"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 shadow-lg"
              style={{ background: 'var(--dc-green)' }}
            >
              View Ad Packages <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:partnerships@dhakachronicles.com"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <Mail className="w-4 h-4" />
              Email Partnerships
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div style={{ background: '#0a1410', borderBottom: '1px solid rgba(0,166,81,0.18)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map(({ icon: Icon, value, label, color, trend }) => (
              <div key={label} className="group relative">
                {/* Animated background */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `${color}08` }}
                />
                <div
                  className="relative w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: `${color}18` }}
                >
                  <Icon className="w-6 h-6 transition-transform group-hover:scale-110" style={{ color }} />
                </div>
                <p className="text-3xl sm:text-4xl font-black font-headline text-white mb-1 group-hover:scale-105 transition-transform">{value}</p>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3" style={{ color }} />
                  <span className="text-[10px] font-semibold" style={{ color }}>{trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-18">

        {/* ── Partner Brands ── */}
        <section className="relative">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent via-dc-green/20 to-transparent"></div>

          <div className="text-center mb-12">
            <span
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] px-4 py-2 rounded-full mb-4"
              style={{ color: '#00A651', background: 'rgba(0,166,81,0.08)', border: '1px solid rgba(0,166,81,0.15)' }}
            >
              <Heart className="w-3 h-3" />
              Trusted By
            </span>
            <h2 className="font-headline font-black text-3xl sm:text-4xl mt-2 mb-4" style={{ color: 'var(--dc-text)' }}>
              Brands That Have Worked With Us
            </h2>
            <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--dc-text-muted)' }}>
              From fintech unicorns to legacy consumer brands — Bangladesh&apos;s top advertisers choose Dhaka Chronicles
              for our proven track record of delivering exceptional results.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {partners.map((partner, index) => {
              const card = (
                <div
                  className="group relative overflow-hidden rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up"
                  style={{
                    background: 'var(--dc-surface)',
                    border: '1px solid var(--dc-border)',
                    boxShadow: 'var(--card-shadow)',
                    animationDelay: `${index * 60}ms`,
                    minHeight: '110px',
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at center, ${partner.color}18 0%, transparent 70%)` }}
                  />

                  {/* Logo or initial */}
                  {partner.logo_url ? (
                    <div className="relative w-14 h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <Image
                        src={partner.logo_url}
                        alt={partner.name}
                        fill
                        className="object-contain"
                        unoptimized={partner.logo_url.startsWith('http')}
                        sizes="56px"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 transition-all duration-300 group-hover:scale-110"
                      style={{ background: partner.color }}
                    >
                      {partner.initial}
                    </div>
                  )}

                  {/* Name + category */}
                  <div className="relative">
                    <p className="font-headline font-bold text-xs leading-snug transition-colors group-hover:text-dc-green" style={{ color: 'var(--dc-text)' }}>
                      {partner.name}
                    </p>
                    <p className="text-[9px] uppercase tracking-wider mt-0.5 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--dc-text-muted)' }}>
                      {partner.category}
                    </p>
                  </div>

                  {partner.website_url && (
                    <ExternalLink
                      className="absolute top-2 right-2 w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity"
                      style={{ color: 'var(--dc-text-muted)' }}
                    />
                  )}
                </div>
              )

              return partner.website_url ? (
                <a
                  key={partner.id}
                  href={partner.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {card}
                </a>
              ) : (
                <div key={partner.id}>{card}</div>
              )
            })}
          </div>
        </section>

        {/* ── Portfolio grid ── */}
        <section>
          {items.length === 0 ? (
            <div
              className="py-24 text-center rounded-2xl"
              style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
            >
              <p className="text-xl font-headline font-bold mb-2" style={{ color: 'var(--dc-text)' }}>
                Campaign case studies coming soon.
              </p>
              <p className="text-sm" style={{ color: 'var(--dc-text-muted)' }}>
                In the meantime,{' '}
                <a href="mailto:partnerships@dhakachronicles.com" className="text-dc-green hover:underline">
                  get in touch
                </a>{' '}
                to start a partnership.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-dc-green">Our Work</span>
                <h2 className="font-headline font-black text-2xl sm:text-3xl mt-2 mb-2" style={{ color: 'var(--dc-text)' }}>
                  Featured Campaigns
                </h2>
                <p className="text-sm" style={{ color: 'var(--dc-text-muted)' }}>
                  A selection of campaigns we&apos;ve produced for brands across Bangladesh.
                </p>
              </div>
              <PortfolioGrid items={items} categories={categories} />
            </>
          )}
        </section>

        {/* ── Services ── */}
        <section className="relative">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent via-dc-green/20 to-transparent"></div>

          <div className="text-center mb-16">
            <span
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] px-4 py-2 rounded-full mb-4"
              style={{ color: '#00A651', background: 'rgba(0,166,81,0.08)', border: '1px solid rgba(0,166,81,0.15)' }}
            >
              <Target className="w-3 h-3" />
              What We Offer
            </span>
            <h2 className="font-headline font-black text-3xl sm:text-4xl mt-2 mb-4" style={{ color: 'var(--dc-text)' }}>
              How We Can Work Together
            </h2>
            <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--dc-text-muted)' }}>
              Flexible formats designed for every campaign goal and budget. From native content to category sponsorships,
              we have the perfect solution for your brand's unique needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = ICON_MAP[service.icon_name] ?? Layers
              const accent = ['#00A651', '#06B6D4', '#8B5CF6', '#F59E0B', '#F42A41', '#EC4899'][i % 6]
              return (
                <div
                  key={service.id}
                  className="group relative overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  {/* Animated background gradient */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(135deg, ${accent}08 0%, ${accent}05 100%)` }}
                  />

                  {/* Floating particles effect */}
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping" style={{ background: accent }}></div>
                  <div className="absolute bottom-4 left-4 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 animate-ping" style={{ background: accent }}></div>

                  <div
                    className="relative p-8 rounded-2xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl"
                    style={{
                      background: 'var(--dc-surface)',
                      border: '1px solid var(--dc-border)',
                      boxShadow: 'var(--card-shadow)',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                      style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}
                    >
                      <Icon className="w-6 h-6 transition-transform group-hover:scale-110" style={{ color: accent }} />
                    </div>
                    <h3 className="font-headline font-bold text-lg mb-3 transition-colors group-hover:text-dc-green" style={{ color: 'var(--dc-text)' }}>
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--dc-text-muted)' }}>
                      {service.description}
                    </p>

                    {/* Subtle arrow indicator */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight className="w-4 h-4" style={{ color: accent }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

      </div>

      {/* ── CTA ── */}
      <section
        className="py-24 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #060d09 0%, #0d1a12 60%, #060d09 100%)', borderTop: '1px solid rgba(0,166,81,0.15)' }}
      >
        {/* Enhanced background effects */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(0,166,81,0.1) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full animate-pulse delay-1000"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)' }}
        />

        {/* Floating elements */}
        <div className="absolute top-16 left-16 w-3 h-3 rounded-full bg-dc-green/20 animate-bounce"></div>
        <div className="absolute top-32 right-20 w-2 h-2 rounded-full bg-purple-400/20 animate-bounce delay-300"></div>
        <div className="absolute bottom-20 left-20 w-4 h-4 rounded-full bg-cyan-400/20 animate-bounce delay-700"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <span
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] px-4 py-2 rounded-full mb-6 animate-pulse"
              style={{ color: '#00A651', background: 'rgba(0,166,81,0.12)', border: '1px solid rgba(0,166,81,0.25)' }}
            >
              <Sparkles className="w-3 h-3 animate-spin" />
              Let&apos;s Talk
            </span>
            <h2 className="font-headline font-black text-4xl sm:text-5xl text-white mb-6 leading-tight">
              Ready to{' '}
              <span className="text-dc-green relative">
                work together
                <div className="absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r from-dc-green via-purple-400 to-cyan-400 rounded-full animate-pulse"></div>
              </span>
              ?
            </h2>
            <p className="text-lg leading-relaxed mb-12 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Our partnerships team will design a campaign tailored to your goals.
              From strategy to execution, we handle everything. Response within 24 hours.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link
              href="/advertise"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-2xl hover:shadow-dc-green/25 transform hover:-translate-y-1"
              style={{ background: 'var(--dc-green)' }}
            >
              <Target className="w-5 h-5 group-hover:animate-pulse" />
              See Ad Packages
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="mailto:partnerships@dhakachronicles.com"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-semibold transition-all hover:bg-white/10 hover:shadow-xl"
              style={{ color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <Mail className="w-5 h-5 group-hover:animate-bounce" />
              Email Us Directly
            </a>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-dc-green animate-pulse"></div>
              <span>24hr Response Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-300"></div>
              <span>Custom Campaign Design</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-700"></div>
              <span>Proven Results</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
