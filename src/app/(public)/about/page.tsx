import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, MapPin, Shield, Zap, Globe, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About – Dhaka Chronicles',
  description: 'Dhaka Chronicles is Bangladesh\'s leading independent digital news platform, delivering reliable journalism since 2025.',
}

const VALUES = [
  {
    icon: Shield,
    title: 'Independence',
    desc: 'Editorially and financially independent. We answer only to our readers — never to advertisers, political parties, or corporate interests.',
  },
  {
    icon: Zap,
    title: 'Accuracy',
    desc: 'Every claim is verified before publication. When we get something wrong, we correct it prominently and promptly.',
  },
  {
    icon: Globe,
    title: 'Inclusivity',
    desc: 'Bilingual English and Bangla coverage. Mobile-first. Built for all Bangladeshis, whether in Dhaka or the diaspora.',
  },
]

export default function AboutPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section
        className="relative py-20 sm:py-28 overflow-hidden"
        style={{ background: 'var(--dc-surface)', borderBottom: '1px solid var(--dc-border)' }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <span className="text-xs font-bold uppercase tracking-widest text-dc-green">About Us</span>
          <h1 className="font-headline font-black text-5xl sm:text-6xl mt-3 mb-6 leading-tight" style={{ color: 'var(--dc-text)' }}>
            The Pulse of<br />Bangladesh.
          </h1>
          <p className="text-xl leading-relaxed max-w-2xl" style={{ color: 'var(--dc-text-muted)' }}>
            An independent digital news organisation dedicated to delivering accurate, timely,
            and deeply reported journalism from Bangladesh and beyond.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-14">

        {/* ── Mission ── */}
        <section>
          <div
            className="rounded-2xl p-8 sm:p-10"
            style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1.5 h-5 rounded-full bg-dc-green shrink-0" />
              <h2 className="font-headline font-bold text-2xl" style={{ color: 'var(--dc-text)' }}>Our Mission</h2>
            </div>
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--dc-text)' }}>
              We believe that a well-informed citizenry is the cornerstone of a healthy democracy.
              Our mission is to produce journalism that holds power to account, amplifies
              underrepresented voices, and helps Bangladeshis understand the forces shaping their lives.
            </p>
            <p className="text-base leading-relaxed" style={{ color: 'var(--dc-text-muted)' }}>
              From breaking news and investigative reports to cultural features and data-driven analysis,
              Dhaka Chronicles covers the full spectrum of Bangladesh&apos;s dynamic story — in both
              English and Bangla.
            </p>
          </div>
        </section>

        {/* ── Values ── */}
        <section>
          <h2 className="font-headline font-bold text-2xl mb-6" style={{ color: 'var(--dc-text)' }}>
            Our Principles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {VALUES.map(v => (
              <div
                key={v.title}
                className="rounded-2xl p-7"
                style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
              >
                <v.icon className="w-6 h-6 text-dc-green mb-4" />
                <h3 className="font-headline font-bold text-lg mb-2" style={{ color: 'var(--dc-text)' }}>
                  {v.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--dc-text-muted)' }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Leadership ── */}
        <section>
          <h2 className="font-headline font-bold text-2xl mb-6" style={{ color: 'var(--dc-text)' }}>
            Founding Team
          </h2>
          <div
            className="rounded-2xl p-8 flex flex-col sm:flex-row items-start gap-6"
            style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl bg-dc-green/15 border border-dc-green/25 flex items-center justify-center text-dc-green font-black text-xl font-headline shrink-0"
            >
              TA
            </div>
            <div>
              <p className="font-headline font-bold text-xl" style={{ color: 'var(--dc-text)' }}>
                Tahmid Ashfaque
              </p>
              <p className="text-dc-green text-sm font-semibold mt-0.5">Founder & Publisher</p>
              <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--dc-text-muted)' }}>
                Founder of Dhaka Chronicles and principal at NOÉTIC Studio. Tahmid brings together
                technology, product design, and editorial vision to build the next generation of
                Bangladeshi digital media.
              </p>
            </div>
          </div>
        </section>

        {/* ── Contact CTA ── */}
        <section
          className="rounded-2xl p-8 sm:p-10"
          style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
        >
          <h2 className="font-headline font-bold text-xl mb-2" style={{ color: 'var(--dc-text)' }}>
            Get in Touch
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--dc-text-muted)' }}>
            Press enquiries, partnership opportunities, or editorial feedback.
          </p>
          <div className="space-y-3 text-sm mb-7">
            <a
              href="mailto:hello@dhakachronicles.com"
              className="flex items-center gap-3 hover:text-dc-green transition-colors"
              style={{ color: 'var(--dc-text)' }}
            >
              <Mail className="w-4 h-4 text-dc-green shrink-0" />
              hello@dhakachronicles.com
            </a>
            <div className="flex items-center gap-3" style={{ color: 'var(--dc-text)' }}>
              <MapPin className="w-4 h-4 text-dc-green shrink-0" />
              Dhaka, Bangladesh
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--dc-green)' }}
          >
            Contact Us <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  )
}
