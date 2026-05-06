import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, BarChart2, Users, Globe, Zap, CheckCircle2, ChevronRight, TrendingUp, Eye } from 'lucide-react'
import { AdvertiseForm } from '@/components/advertise/AdvertiseForm'
import { supabaseAdmin } from '@/lib/db/admin'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Advertise – Dhaka Chronicles',
  description: 'Reach Bangladesh\'s most engaged digital audience. Partner with Dhaka Chronicles.',
}

// ── Types ────────────────────────────────────────────────────────────────────

interface AdPackage {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: string[]
  is_highlighted: boolean
  cta_label: string
}

interface MediaStat {
  id: string
  icon_name: string
  value: string
  label: string
}

interface PartnerLogo {
  id: string
  name: string
  logo_url: string
  website_url: string | null
}

// ── Static fallbacks ─────────────────────────────────────────────────────────

const FALLBACK_STATS: MediaStat[] = [
  { id: '1', icon_name: 'Users',    value: '500K+',        label: 'Monthly Readers' },
  { id: '2', icon_name: 'Globe',    value: 'BD + Diaspora', label: 'Audience Reach' },
  { id: '3', icon_name: 'BarChart2', value: '4:30',         label: 'Avg. Time on Site' },
  { id: '4', icon_name: 'Zap',      value: '12M+',          label: 'Annual Impressions' },
]

const FALLBACK_PACKAGES: AdPackage[] = [
  {
    id: '1',
    name: 'Standard',
    price: '৳15,000',
    period: '/month',
    description: 'Perfect for growing brands looking to build awareness.',
    features: [
      'Banner ad (728×90, 300×250)',
      'Up to 50,000 impressions/month',
      'Desktop & mobile placement',
      'Monthly performance report',
    ],
    is_highlighted: false,
    cta_label: 'Get Started',
  },
  {
    id: '2',
    name: 'Premium',
    price: '৳35,000',
    period: '/month',
    description: 'Maximum visibility for established brands.',
    features: [
      'Homepage feature slot',
      'Up to 150,000 impressions/month',
      'Newsletter placement (30K+ subscribers)',
      'Bi-weekly performance report',
      'Priority customer support',
      'A/B creative testing',
    ],
    is_highlighted: true,
    cta_label: 'Most Popular',
  },
  {
    id: '3',
    name: 'Sponsor',
    price: 'Custom',
    period: 'pricing',
    description: 'Full-service partnerships built around your goals.',
    features: [
      'Branded native content',
      'Category sponsorship',
      'Social media amplification',
      'Dedicated account manager',
      'Full analytics dashboard',
      'Custom creative production',
    ],
    is_highlighted: false,
    cta_label: 'Contact Sales',
  },
]

const ICON_MAP: Record<string, React.ElementType> = {
  Users, Globe, BarChart2, Zap, TrendingUp, Eye, Mail,
}

// ── Data fetching ────────────────────────────────────────────────────────────

async function getAdPackages(): Promise<AdPackage[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('ad_packages')
      .select('id, name, price, period, description, features, is_highlighted, cta_label')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    if (error || !data || data.length === 0) return []
    return data as AdPackage[]
  } catch {
    return []
  }
}

async function getMediaStats(): Promise<MediaStat[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('media_stats')
      .select('id, icon_name, value, label')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    if (error || !data || data.length === 0) return []
    return data as MediaStat[]
  } catch {
    return []
  }
}

async function getPartnerLogos(): Promise<PartnerLogo[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('partner_logos')
      .select('id, name, logo_url, website_url')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    if (error || !data || data.length === 0) return []
    return data as PartnerLogo[]
  } catch {
    return []
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AdvertisePage() {
  const [dynamicPackages, dynamicStats, partnerLogos] = await Promise.all([
    getAdPackages(),
    getMediaStats(),
    getPartnerLogos(),
  ])

  const packages = dynamicPackages.length > 0 ? dynamicPackages : FALLBACK_PACKAGES
  const stats = dynamicStats.length > 0 ? dynamicStats : FALLBACK_STATS

  return (
    <div>
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-20 sm:py-28"
        style={{ background: 'var(--dc-surface)', borderBottom: '1px solid var(--dc-border)' }}
      >
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(0,166,81,0.07) 0%, transparent 70%)' }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1.5 rounded-full mb-5"
            style={{ color: '#00A651', background: 'rgba(0,166,81,0.1)', border: '1px solid rgba(0,166,81,0.2)' }}
          >
            Advertising
          </span>
          <h1
            className="font-headline font-black text-4xl sm:text-6xl mt-3 mb-5 leading-tight"
            style={{ color: 'var(--dc-text)' }}
          >
            Reach Bangladesh&apos;s<br />Most Engaged Readers
          </h1>
          <p className="text-lg max-w-xl mx-auto leading-relaxed mb-10" style={{ color: 'var(--dc-text-muted)' }}>
            Dhaka Chronicles delivers independent journalism to hundreds of thousands of
            engaged readers across Bangladesh and the global diaspora.
          </p>
          <a
            href="mailto:ads@dhakachronicles.com"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 shadow-lg"
            style={{ background: 'var(--dc-green)' }}
          >
            <Mail className="w-4 h-4" />
            Start a Conversation
          </a>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-16">

        {/* ── Stats ── */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map(stat => {
              const Icon = ICON_MAP[stat.icon_name] ?? BarChart2
              return (
                <div
                  key={stat.id}
                  className="rounded-2xl p-6 text-center group transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'var(--dc-surface)',
                    border: '1px solid var(--dc-border)',
                    boxShadow: 'var(--card-shadow)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: 'rgba(0,166,81,0.1)' }}
                  >
                    <Icon className="w-5 h-5 text-dc-green" />
                  </div>
                  <p className="text-2xl font-black font-headline" style={{ color: 'var(--dc-text)' }}>
                    {stat.value}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--dc-text-muted)' }}>{stat.label}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Partner Logos ── shown only when data exists ── */}
        {partnerLogos.length > 0 && (
          <section>
            <div className="text-center mb-8">
              <p
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: 'var(--dc-text-muted)' }}
              >
                Trusted by leading brands
              </p>
            </div>
            <div
              className="rounded-2xl px-8 py-8"
              style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
            >
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
                {partnerLogos.map(logo => (
                  logo.website_url ? (
                    <a
                      key={logo.id}
                      href={logo.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                      title={logo.name}
                    >
                      <Image
                        src={logo.logo_url}
                        alt={logo.name}
                        width={120}
                        height={40}
                        className="h-8 w-auto object-contain"
                        unoptimized={logo.logo_url.startsWith('http')}
                      />
                    </a>
                  ) : (
                    <div
                      key={logo.id}
                      className="opacity-50"
                      title={logo.name}
                    >
                      <Image
                        src={logo.logo_url}
                        alt={logo.name}
                        width={120}
                        height={40}
                        className="h-8 w-auto object-contain"
                        unoptimized={logo.logo_url.startsWith('http')}
                      />
                    </div>
                  )
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Packages ── */}
        <section>
          <h2 className="font-headline font-bold text-2xl mb-8" style={{ color: 'var(--dc-text)' }}>
            Advertising Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {packages.map(pkg => (
              <div
                key={pkg.id}
                className={`rounded-2xl p-7 flex flex-col relative ${pkg.is_highlighted ? 'ring-2 ring-dc-green' : ''}`}
                style={{
                  background: 'var(--dc-surface)',
                  border: pkg.is_highlighted ? undefined : '1px solid var(--dc-border)',
                  boxShadow: pkg.is_highlighted ? '0 0 40px rgba(0,166,81,0.15)' : 'var(--card-shadow)',
                }}
              >
                {pkg.is_highlighted && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white"
                    style={{ background: 'var(--dc-green)' }}
                  >
                    Most Popular
                  </div>
                )}
                <h3 className="font-headline font-bold text-xl mb-1" style={{ color: 'var(--dc-text)' }}>
                  {pkg.name}
                </h3>
                <p className="text-xs mb-4" style={{ color: 'var(--dc-text-muted)' }}>{pkg.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black text-dc-green">{pkg.price}</span>
                  <span className="text-xs" style={{ color: 'var(--dc-text-muted)' }}>{pkg.period}</span>
                </div>
                <ul className="space-y-2.5 flex-1 mb-7">
                  {(pkg.features ?? []).map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--dc-text-muted)' }}>
                      <CheckCircle2 className="w-4 h-4 text-dc-green shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:ads@dhakachronicles.com"
                  className={`text-center py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    pkg.is_highlighted
                      ? 'text-white hover:opacity-90'
                      : 'border hover:border-dc-green hover:text-dc-green'
                  }`}
                  style={pkg.is_highlighted
                    ? { background: 'var(--dc-green)' }
                    : { color: 'var(--dc-text-muted)', borderColor: 'var(--dc-border)' }
                  }
                >
                  {pkg.cta_label ?? 'Get Started'}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why us ── */}
        <section
          className="rounded-2xl p-8 sm:p-10 relative overflow-hidden"
          style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 100% 100%, rgba(0,166,81,0.06) 0%, transparent 60%)' }}
          />
          <div className="relative text-center">
            <h2 className="font-headline font-bold text-2xl mb-3" style={{ color: 'var(--dc-text)' }}>
              Why Dhaka Chronicles?
            </h2>
            <p className="text-sm max-w-xl mx-auto mb-6" style={{ color: 'var(--dc-text-muted)' }}>
              Our readers are educated, politically engaged, and economically active. They choose
              quality journalism — making our platform a premium environment for your brand.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border transition-colors hover:border-dc-green hover:text-dc-green"
                style={{ color: 'var(--dc-text-muted)', borderColor: 'var(--dc-border)' }}
              >
                View Case Studies <ChevronRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:ads@dhakachronicles.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'var(--dc-green)' }}
              >
                <Mail className="w-4 h-4" />
                ads@dhakachronicles.com
              </a>
            </div>
          </div>
        </section>

        {/* ── Inquiry Form ── */}
        <section>
          <AdvertiseForm />
        </section>

      </div>
    </div>
  )
}
