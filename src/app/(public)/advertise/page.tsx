import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, BarChart2, Users, Globe, Zap, CheckCircle2, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Advertise – Dhaka Chronicles',
  description: 'Reach Bangladesh\'s most engaged digital audience. Partner with Dhaka Chronicles.',
}

const STATS = [
  { icon: Users,    value: '500K+',  label: 'Monthly Readers' },
  { icon: Globe,    value: 'BD + Diaspora', label: 'Audience Reach' },
  { icon: BarChart2, value: '4:30', label: 'Avg. Time on Site' },
  { icon: Zap,      value: '12M+',  label: 'Annual Impressions' },
]

const PACKAGES = [
  {
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
    cta: 'Get Started',
    highlight: false,
  },
  {
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
    cta: 'Most Popular',
    highlight: true,
  },
  {
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
    cta: 'Contact Sales',
    highlight: false,
  },
]

export default function AdvertisePage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section
        className="py-20 sm:py-24"
        style={{ background: 'var(--dc-surface)', borderBottom: '1px solid var(--dc-border)' }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-dc-green">Advertising</span>
          <h1 className="font-headline font-black text-4xl sm:text-5xl mt-3 mb-5 leading-tight" style={{ color: 'var(--dc-text)' }}>
            Reach Bangladesh&apos;s<br />Most Engaged Readers
          </h1>
          <p className="text-lg max-w-xl mx-auto leading-relaxed mb-10" style={{ color: 'var(--dc-text-muted)' }}>
            Dhaka Chronicles delivers independent journalism to hundreds of thousands of
            engaged readers across Bangladesh and the global diaspora.
          </p>
          <a
            href="mailto:ads@dhakachronicles.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
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
            {STATS.map(stat => (
              <div
                key={stat.label}
                className="rounded-2xl p-6 text-center"
                style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
              >
                <stat.icon className="w-6 h-6 text-dc-green mx-auto mb-3" />
                <p className="text-2xl font-black font-headline" style={{ color: 'var(--dc-text)' }}>
                  {stat.value}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--dc-text-muted)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Packages ── */}
        <section>
          <h2 className="font-headline font-bold text-2xl mb-8" style={{ color: 'var(--dc-text)' }}>
            Advertising Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PACKAGES.map(pkg => (
              <div
                key={pkg.name}
                className={`rounded-2xl p-7 flex flex-col relative ${pkg.highlight ? 'ring-2 ring-dc-green' : ''}`}
                style={{ background: 'var(--dc-surface)', border: pkg.highlight ? undefined : '1px solid var(--dc-border)' }}
              >
                {pkg.highlight && (
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
                  {pkg.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--dc-text-muted)' }}>
                      <CheckCircle2 className="w-4 h-4 text-dc-green shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:ads@dhakachronicles.com"
                  className={`text-center py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    pkg.highlight
                      ? 'text-white hover:opacity-90'
                      : 'border hover:border-dc-green hover:text-dc-green'
                  }`}
                  style={pkg.highlight
                    ? { background: 'var(--dc-green)' }
                    : { color: 'var(--dc-text-muted)', borderColor: 'var(--dc-border)' }
                  }
                >
                  {pkg.cta}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why us ── */}
        <section
          className="rounded-2xl p-8 sm:p-10 text-center"
          style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
        >
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
        </section>
      </div>
    </div>
  )
}
