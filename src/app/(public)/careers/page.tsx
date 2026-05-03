import type { Metadata } from 'next'
import { Mail, MapPin, Clock, Briefcase, Code2, PenTool, TrendingUp, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Careers – Dhaka Chronicles',
  description: 'Join the Dhaka Chronicles team. Open roles in journalism, technology, and design.',
}

const OPENINGS = [
  {
    icon: PenTool,
    title: 'Staff Reporter — Politics & Policy',
    type: 'Full-time',
    location: 'Dhaka, Bangladesh',
    department: 'Editorial',
    description: 'Cover national politics, parliament, and policy for our English-language audience. A strong source network and a sharp eye for the story behind the story are essential.',
    color: '#F42A41',
  },
  {
    icon: Code2,
    title: 'Frontend Engineer (Next.js)',
    type: 'Full-time / Remote',
    location: 'Remote (BD-based preferred)',
    department: 'Engineering',
    description: 'Own the Dhaka Chronicles frontend — performance, new features, and developer experience. Proficiency with Next.js App Router and TypeScript required.',
    color: '#06B6D4',
  },
  {
    icon: PenTool,
    title: 'Bangla Content Editor',
    type: 'Full-time',
    location: 'Dhaka, Bangladesh',
    department: 'Editorial',
    description: 'Edit and publish Bangla-language content across all sections. A deep command of written Bangla and rigorous news style is a must.',
    color: '#00A651',
  },
  {
    icon: TrendingUp,
    title: 'Social Media & Growth',
    type: 'Part-time / Contract',
    location: 'Remote',
    department: 'Growth',
    description: 'Drive audience growth across Facebook, YouTube, and X. You will own the social strategy, content calendar, and engagement analytics.',
    color: '#8B5CF6',
  },
]

const PERKS = [
  { icon: Heart,    title: 'Mission-driven',  desc: 'We exist to serve the public, not shareholders.' },
  { icon: Code2,    title: 'Modern Tech',     desc: 'Built on a cutting-edge stack; always experimenting.' },
  { icon: Briefcase, title: 'Flexible Work',  desc: 'Remote-friendly. We care about output, not hours.' },
]

export default function CareersPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section
        className="py-20 sm:py-24"
        style={{ background: 'var(--dc-surface)', borderBottom: '1px solid var(--dc-border)' }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <span className="text-xs font-bold uppercase tracking-widest text-dc-green">Careers</span>
          <h1 className="font-headline font-black text-5xl sm:text-6xl mt-3 mb-5 leading-tight" style={{ color: 'var(--dc-text)' }}>
            Build the Future<br />of Bangladeshi Media.
          </h1>
          <p className="text-xl leading-relaxed max-w-2xl" style={{ color: 'var(--dc-text-muted)' }}>
            We are building Bangladesh&apos;s most trusted independent news platform. If you care
            about journalism, technology, and storytelling — we want to hear from you.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-14">

        {/* ── Perks ── */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PERKS.map(p => (
              <div
                key={p.title}
                className="rounded-2xl p-7"
                style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
              >
                <p.icon className="w-6 h-6 text-dc-green mb-4" />
                <h3 className="font-headline font-bold text-base mb-2" style={{ color: 'var(--dc-text)' }}>
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--dc-text-muted)' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Openings ── */}
        <section>
          <h2 className="font-headline font-bold text-2xl mb-7" style={{ color: 'var(--dc-text)' }}>
            Open Positions
          </h2>
          <div className="space-y-4">
            {OPENINGS.map(job => (
              <div
                key={job.title}
                className="rounded-2xl p-7 transition-all"
                style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${job.color}18` }}
                    >
                      <job.icon className="w-5 h-5" style={{ color: job.color }} />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-lg leading-snug" style={{ color: 'var(--dc-text)' }}>
                        {job.title}
                      </h3>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: job.color }}
                      >
                        {job.department}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                    style={{ background: `${job.color}15`, color: job.color }}
                  >
                    {job.type}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs mb-4" style={{ color: 'var(--dc-text-muted)' }}>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-dc-green" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-dc-green" /> Open now
                  </span>
                </div>

                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--dc-text-muted)' }}>
                  {job.description}
                </p>

                <a
                  href={`mailto:careers@dhakachronicles.com?subject=Application: ${encodeURIComponent(job.title)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors hover:border-dc-green hover:text-dc-green"
                  style={{ color: 'var(--dc-text-muted)', borderColor: 'var(--dc-border)' }}
                >
                  <Mail className="w-3.5 h-3.5" /> Apply via Email
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── Speculative CTA ── */}
        <section
          className="rounded-2xl p-10 text-center"
          style={{
            background: 'linear-gradient(135deg, #0d1a12, #0a0a0a)',
            border: '1px solid rgba(0,166,81,0.2)',
          }}
        >
          <h2 className="font-headline font-bold text-2xl text-white mb-3">
            Don&apos;t See Your Role?
          </h2>
          <p className="text-white/50 text-sm mb-7 max-w-sm mx-auto">
            We are always looking for talented people. Send us a speculative application and
            tell us what you would build.
          </p>
          <a
            href="mailto:careers@dhakachronicles.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--dc-green)' }}
          >
            <Mail className="w-4 h-4" />
            careers@dhakachronicles.com
          </a>
        </section>
      </div>
    </div>
  )
}
