import Link from 'next/link'
import { Home, Search, Newspaper, Globe, Users, ArrowRight } from 'lucide-react'

const DC_FACTS = [
  {
    emoji: '📅',
    label: 'Born',
    value: '17 July 2024',
    note: 'We are one of the newest voices in Bangladeshi journalism.',
  },
  {
    emoji: '🌐',
    label: 'Languages',
    value: 'English + বাংলা',
    note: 'Truly bilingual — every story lives in both worlds.',
  },
  {
    emoji: '📱',
    label: 'Followers',
    value: '100,000+',
    note: 'Across Facebook, Instagram & LinkedIn — and growing fast.',
  },
  {
    emoji: '⏱',
    label: 'Avg. visit',
    value: '4 min 30 sec',
    note: 'Readers actually stay. That says something.',
  },
]

const QUICK_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/category/politics', label: 'Politics', icon: Newspaper },
  { href: '/category/business', label: 'Business', icon: Globe },
  { href: '/about', label: 'About Us', icon: Users },
]

export default function NotFound() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full">
      {/* Hero */}
      <div className="text-center mb-16">
        <div
          className="inline-block font-headline font-black text-[8rem] sm:text-[12rem] leading-none select-none"
          style={{
            background: 'linear-gradient(135deg, var(--dc-green) 0%, #007a3c 50%, rgba(0,166,81,0.2) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </div>
        <h1 className="font-headline font-black text-3xl sm:text-4xl mt-4 mb-4" style={{ color: 'var(--dc-text)' }}>
          This page went off the record.
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--dc-text-muted)' }}>
          Our reporters couldn&apos;t find what you were looking for.
          It may have moved, been retracted, or never existed to begin with.
        </p>
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap justify-center gap-3 mb-20">
        {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
            style={{
              background: 'var(--dc-surface)',
              border: '1px solid var(--dc-border)',
              color: 'var(--dc-text)',
            }}
          >
            <Icon className="w-3.5 h-3.5 text-dc-green" />
            {label}
          </Link>
        ))}
      </div>

      {/* DC facts */}
      <div className="mb-16">
        <p className="text-xs font-bold uppercase tracking-widest text-dc-green text-center mb-6">
          While you&apos;re here — did you know?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DC_FACTS.map((fact) => (
            <div
              key={fact.label}
              className="rounded-xl p-5 flex gap-4 items-start"
              style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
            >
              <span className="text-2xl mt-0.5 shrink-0">{fact.emoji}</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--dc-text-muted)' }}>
                  {fact.label}
                </p>
                <p className="font-headline font-bold text-lg text-dc-green leading-tight mb-1">
                  {fact.value}
                </p>
                <p className="text-sm" style={{ color: 'var(--dc-text-muted)' }}>
                  {fact.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-dc-green text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Back to the newsroom
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
