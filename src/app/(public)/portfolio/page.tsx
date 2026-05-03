import type { Metadata } from 'next'
import Link from 'next/link'
import { Users, BarChart2, TrendingUp, Award, ChevronRight, Mail } from 'lucide-react'
import { supabaseAdmin } from '@/lib/db/admin'
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Brand Collaborations – Dhaka Chronicles',
  description: 'See how leading brands partner with Dhaka Chronicles to reach Bangladesh\'s most engaged digital audience.',
}

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

const STATS = [
  { icon: Users,      value: '500K+', label: 'Monthly Readers',     color: '#00A651' },
  { icon: BarChart2,  value: '4:30',  label: 'Avg. Time on Site',   color: '#06B6D4' },
  { icon: TrendingUp, value: '12M+',  label: 'Annual Impressions',  color: '#8B5CF6' },
  { icon: Award,      value: '40+',   label: 'Brand Partners',      color: '#F59E0B' },
]

const SERVICES = [
  {
    title: 'Native Content',
    description: 'Long-form sponsored stories and features that blend seamlessly with our editorial voice.',
    icon: '✍️',
  },
  {
    title: 'Display Advertising',
    description: 'Premium banner placements across homepage, article pages, and category sections.',
    icon: '📢',
  },
  {
    title: 'Newsletter Sponsorship',
    description: 'Exclusive placement in our Morning Briefing — reaching 20K+ engaged subscribers.',
    icon: '📧',
  },
  {
    title: 'Category Sponsorship',
    description: 'Own a section. Get month-long prominent branding across an entire content vertical.',
    icon: '🏆',
  },
  {
    title: 'Event Partnership',
    description: 'Co-brand live events, panel discussions, and community activations.',
    icon: '🎤',
  },
  {
    title: 'Social Amplification',
    description: 'Extend campaign reach through our 100K+ social media following.',
    icon: '📱',
  },
]

export default async function PortfolioPage() {
  const { data } = await supabaseAdmin
    .from('portfolio_items')
    .select('id, brand_name, project_name, category, description, outcome, logo_url, featured_image_url, external_link, display_order')
    .eq('is_published', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  const items = (data as PortfolioItem[]) ?? []
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #00A651, transparent 70%)' }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-1.5 text-xs mb-6 text-white/40">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/70">Brand Collaborations</span>
          </nav>

          <span className="inline-block text-xs font-bold uppercase tracking-widest text-dc-green mb-4 px-3 py-1.5 rounded-full border border-dc-green/30 bg-dc-green/10">
            Partner With Us
          </span>

          <h1 className="font-headline font-black text-4xl sm:text-6xl text-white leading-tight mb-5">
            Reach Bangladesh&apos;s Most{' '}
            <span className="text-dc-green">Engaged</span> Audience
          </h1>

          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
            From native content to category sponsorships — we craft campaigns that resonate
            with our readers and deliver measurable results for your brand.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/advertise"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: 'var(--dc-green)' }}
            >
              View Ad Packages
            </Link>
            <a
              href="mailto:partnerships@dhakachronicles.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
              style={{ color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <Mail className="w-4 h-4" />
              Email Partnerships
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div style={{ background: '#0d1a12', borderBottom: '1px solid rgba(0,166,81,0.2)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {STATS.map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="group">
                <Icon className="w-5 h-5 mx-auto mb-2 transition-transform group-hover:scale-110" style={{ color }} />
                <p className="text-2xl sm:text-3xl font-black font-headline text-white">{value}</p>
                <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Portfolio grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        {items.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-xl font-headline font-bold mb-2" style={{ color: 'var(--dc-text)' }}>
              Campaigns coming soon.
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
              <h2 className="font-headline font-black text-2xl sm:text-3xl mb-2" style={{ color: 'var(--dc-text)' }}>
                Featured Work
              </h2>
              <p className="text-sm" style={{ color: 'var(--dc-text-muted)' }}>
                A selection of campaigns we&apos;ve produced for brands across Bangladesh.
              </p>
            </div>
            <PortfolioGrid items={items} categories={categories} />
          </>
        )}
      </div>

      {/* ── Services grid ── */}
      <div
        className="py-16 sm:py-20"
        style={{ background: 'var(--dc-surface)', borderTop: '1px solid var(--dc-border)', borderBottom: '1px solid var(--dc-border)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-headline font-black text-2xl sm:text-3xl mb-3" style={{ color: 'var(--dc-text)' }}>
              How We Can Work Together
            </h2>
            <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--dc-text-muted)' }}>
              Flexible formats designed for every campaign goal and budget.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map(service => (
              <div
                key={service.title}
                className="p-5 rounded-xl transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)' }}
              >
                <span className="text-2xl mb-3 block">{service.icon}</span>
                <h3 className="font-headline font-bold text-base mb-1.5" style={{ color: 'var(--dc-text)' }}>
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--dc-text-muted)' }}>
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-headline font-black text-3xl sm:text-4xl mb-4" style={{ color: 'var(--dc-text)' }}>
            Ready to work together?
          </h2>
          <p className="text-sm leading-relaxed mb-8 max-w-md mx-auto" style={{ color: 'var(--dc-text-muted)' }}>
            Our partnerships team will design a campaign tailored to your goals and audience.
            Response within 24 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/advertise"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'var(--dc-green)' }}
            >
              See Ad Packages
            </Link>
            <a
              href="mailto:partnerships@dhakachronicles.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border transition-colors hover:border-dc-green hover:text-dc-green"
              style={{ color: 'var(--dc-text-muted)', borderColor: 'var(--dc-border)' }}
            >
              Email Us Directly
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
