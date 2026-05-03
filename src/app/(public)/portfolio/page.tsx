import type { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/db/admin'
import { ExternalLink, TrendingUp, Users, BarChart2, Award } from 'lucide-react'

export const dynamic = 'force-dynamic'

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

const CATEGORY_COLORS: Record<string, string> = {
  Fashion:   '#EC4899',
  'F&B':     '#F59E0B',
  Tech:      '#06B6D4',
  Lifestyle: '#8B5CF6',
  Corporate: '#00A651',
  Media:     '#F42A41',
  NGO:       '#6366F1',
}

const STATS = [
  { icon: Users,    value: '500K+',  label: 'Monthly Readers' },
  { icon: BarChart2, value: '4:30',  label: 'Avg. Time on Site' },
  { icon: TrendingUp, value: '12M+', label: 'Annual Impressions' },
  { icon: Award,     value: '40+',   label: 'Brand Partners' },
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
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #0d1a12 60%, #0a0a0a 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-dc-green mb-4 px-3 py-1 rounded-full border border-dc-green/30 bg-dc-green/10">
            Brand Collaborations
          </span>
          <h1 className="font-headline font-black text-4xl sm:text-6xl text-white leading-tight mb-6">
            Reach Bangladesh&apos;s Most{' '}
            <span className="text-dc-green">Engaged</span> Audience
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
            From native content to category sponsorships, we craft campaigns that resonate with
            our readers — and deliver measurable results for your brand.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/advertise"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'var(--dc-green)' }}
            >
              Partner With Us
            </Link>
            <a
              href="mailto:partnerships@dhakachronicles.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border transition-colors"
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div style={{ background: '#0d1a12', borderBottom: '1px solid rgba(0,166,81,0.2)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label}>
                <Icon className="w-5 h-5 text-dc-green mx-auto mb-2" />
                <p className="text-3xl font-black font-headline text-white">{value}</p>
                <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Work grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {items.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-lg font-headline font-bold" style={{ color: 'var(--dc-text)' }}>
              Campaigns coming soon.
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--dc-text-muted)' }}>
              Check back shortly — or{' '}
              <a href="mailto:partnerships@dhakachronicles.com" className="text-dc-green hover:underline">
                get in touch
              </a>{' '}
              to start a partnership.
            </p>
          </div>
        ) : (
          <>
            {/* Category filter chips (decorative — full filtering would need client state) */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-10">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'var(--dc-green)', color: '#fff' }}
                >
                  All
                </span>
                {categories.map(cat => (
                  <span
                    key={cat}
                    className="px-3 py-1 rounded-full text-xs font-semibold border"
                    style={{
                      color: CATEGORY_COLORS[cat] ?? 'var(--dc-text-muted)',
                      borderColor: `${CATEGORY_COLORS[cat] ?? 'var(--dc-border)'}40`,
                      background: `${CATEGORY_COLORS[cat] ?? '#888'}12`,
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => (
                <article
                  key={item.id}
                  className="group rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-1"
                  style={{
                    background: 'var(--dc-surface)',
                    border: '1px solid var(--dc-border)',
                    boxShadow: 'var(--card-shadow)',
                  }}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden" style={{ background: 'var(--dc-surface-2)' }}>
                    {item.featured_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.featured_image_url}
                        alt={item.project_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.logo_url} alt={item.brand_name} className="h-16 w-auto object-contain opacity-40" />
                        ) : (
                          <span className="text-4xl font-black font-headline opacity-10" style={{ color: 'var(--dc-text)' }}>
                            {item.brand_name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}
                    {/* Category badge */}
                    <span
                      className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{
                        background: `${CATEGORY_COLORS[item.category] ?? '#888'}22`,
                        color: CATEGORY_COLORS[item.category] ?? 'var(--dc-text-muted)',
                        backdropFilter: 'blur(8px)',
                        border: `1px solid ${CATEGORY_COLORS[item.category] ?? '#888'}30`,
                      }}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Brand */}
                    <div className="flex items-center gap-2.5 mb-3">
                      {item.logo_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.logo_url}
                          alt={item.brand_name}
                          className="h-6 w-auto object-contain"
                        />
                      )}
                      <span className="text-xs font-semibold" style={{ color: 'var(--dc-text-muted)' }}>
                        {item.brand_name}
                      </span>
                    </div>

                    <h3
                      className="font-headline font-bold text-lg leading-snug mb-2"
                      style={{ color: 'var(--dc-text)' }}
                    >
                      {item.project_name}
                    </h3>

                    <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--dc-text-muted)' }}>
                      {item.description}
                    </p>

                    {/* Outcome */}
                    {item.outcome && (
                      <div
                        className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold"
                        style={{ background: 'var(--dc-green)15', color: 'var(--dc-green)' }}
                      >
                        <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                        {item.outcome}
                      </div>
                    )}

                    {/* External link */}
                    {item.external_link && (
                      <a
                        href={item.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-dc-green hover:underline"
                      >
                        View campaign <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── CTA ── */}
      <section
        className="py-20 px-4"
        style={{ background: 'var(--dc-surface)', borderTop: '1px solid var(--dc-border)' }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-headline font-black text-3xl sm:text-4xl mb-4" style={{ color: 'var(--dc-text)' }}>
            Ready to work together?
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--dc-text-muted)' }}>
            Our partnerships team will design a campaign tailored to your goals and audience.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/advertise"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'var(--dc-green)' }}
            >
              See Packages
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
