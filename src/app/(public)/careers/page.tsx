import type { Metadata } from 'next'
import { Mail, MapPin, Clock, Briefcase, Code2, PenTool, TrendingUp, Heart, Zap, Users } from 'lucide-react'
import { supabaseAdmin } from '@/lib/db/admin'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Careers – Dhaka Chronicles',
  description: 'Join the Dhaka Chronicles team. Open roles in journalism, technology, and design.',
}

// ── Types ────────────────────────────────────────────────────────────────────

interface JobOpening {
  id: string
  title: string
  department: string
  type: string
  location: string
  description: string
  color: string
}

interface Perk {
  id: string
  icon_name: string
  title: string
  description: string
}

// ── Static fallbacks ─────────────────────────────────────────────────────────

const FALLBACK_OPENINGS: JobOpening[] = [
  {
    id: '1',
    title: 'Staff Reporter — Politics & Policy',
    type: 'Full-time',
    location: 'Dhaka, Bangladesh',
    department: 'Editorial',
    description: 'Cover national politics, parliament, and policy for our English-language audience. A strong source network and a sharp eye for the story behind the story are essential.',
    color: '#F42A41',
  },
  {
    id: '2',
    title: 'Frontend Engineer (Next.js)',
    type: 'Full-time / Remote',
    location: 'Remote (BD-based preferred)',
    department: 'Engineering',
    description: 'Own the Dhaka Chronicles frontend — performance, new features, and developer experience. Proficiency with Next.js App Router and TypeScript required.',
    color: '#06B6D4',
  },
  {
    id: '3',
    title: 'Bangla Content Editor',
    type: 'Full-time',
    location: 'Dhaka, Bangladesh',
    department: 'Editorial',
    description: 'Edit and publish Bangla-language content across all sections. A deep command of written Bangla and rigorous news style is a must.',
    color: '#00A651',
  },
  {
    id: '4',
    title: 'Social Media & Growth',
    type: 'Part-time / Contract',
    location: 'Remote',
    department: 'Growth',
    description: 'Drive audience growth across Facebook, LinkedIn, and Instagram. You will own the social strategy, content calendar, and engagement analytics.',
    color: '#8B5CF6',
  },
]

const FALLBACK_PERKS: Perk[] = [
  { id: '1', icon_name: 'Heart',    title: 'Mission-driven',  description: 'We exist to serve the public, not shareholders.' },
  { id: '2', icon_name: 'Code2',    title: 'Modern Tech',     description: 'Built on a cutting-edge stack; always experimenting.' },
  { id: '3', icon_name: 'Briefcase', title: 'Flexible Work',  description: 'Remote-friendly. We care about output, not hours.' },
]

const ICON_MAP: Record<string, React.ElementType> = {
  Heart, Code2, Briefcase, PenTool, TrendingUp, Zap, Users, Mail, MapPin, Clock,
}

// ── Data fetching ────────────────────────────────────────────────────────────

async function getJobOpenings(): Promise<JobOpening[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('job_openings')
      .select('id, title, department, type, location, description, color')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    if (error || !data || data.length === 0) return []
    return data as JobOpening[]
  } catch {
    return []
  }
}

async function getPerks(): Promise<Perk[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('career_perks')
      .select('id, icon_name, title, description')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    if (error || !data || data.length === 0) return []
    return data as Perk[]
  } catch {
    return []
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function CareersPage() {
  const [dynamicOpenings, dynamicPerks] = await Promise.all([
    getJobOpenings(),
    getPerks(),
  ])

  const openings = dynamicOpenings.length > 0 ? dynamicOpenings : FALLBACK_OPENINGS
  const perks = dynamicPerks.length > 0 ? dynamicPerks : FALLBACK_PERKS

  return (
    <div>
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-20 sm:py-28"
        style={{ background: 'var(--dc-surface)', borderBottom: '1px solid var(--dc-border)' }}
      >
        {/* Decorative green glow */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,166,81,0.08) 0%, transparent 70%)' }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1.5 rounded-full mb-5"
            style={{ color: '#00A651', background: 'rgba(0,166,81,0.1)', border: '1px solid rgba(0,166,81,0.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-dc-green animate-pulse" />
            We&apos;re Hiring
          </span>
          <h1
            className="font-headline font-black text-5xl sm:text-6xl mt-3 mb-5 leading-tight"
            style={{ color: 'var(--dc-text)' }}
          >
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
            {perks.map(p => {
              const Icon = ICON_MAP[p.icon_name] ?? Briefcase
              return (
                <div
                  key={p.id}
                  className="rounded-2xl p-7 group transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'var(--dc-surface)',
                    border: '1px solid var(--dc-border)',
                    boxShadow: 'var(--card-shadow)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(0,166,81,0.1)' }}
                  >
                    <Icon className="w-5 h-5 text-dc-green" />
                  </div>
                  <h3 className="font-headline font-bold text-base mb-2" style={{ color: 'var(--dc-text)' }}>
                    {p.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--dc-text-muted)' }}>
                    {p.description}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Open Positions ── */}
        <section>
          <div className="flex items-center justify-between mb-7">
            <h2 className="font-headline font-bold text-2xl" style={{ color: 'var(--dc-text)' }}>
              Open Positions
            </h2>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,166,81,0.12)', color: '#00A651' }}
            >
              {openings.length} open
            </span>
          </div>

          <div className="space-y-4">
            {openings.map(job => (
              <div
                key={job.id}
                className="rounded-2xl p-6 sm:p-7 transition-all hover:shadow-lg group"
                style={{
                  background: 'var(--dc-surface)',
                  border: '1px solid var(--dc-border)',
                  boxShadow: 'var(--card-shadow)',
                }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: job.color }}
                />

                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${job.color}18` }}
                    >
                      <PenTool className="w-5 h-5" style={{ color: job.color }} />
                    </div>
                    <div>
                      <h3
                        className="font-headline font-bold text-lg leading-snug"
                        style={{ color: 'var(--dc-text)' }}
                      >
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
          className="rounded-2xl p-10 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0d1a12, #0a0a0a)',
            border: '1px solid rgba(0,166,81,0.2)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,166,81,0.12) 0%, transparent 70%)' }}
          />
          <div className="relative">
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
          </div>
        </section>

      </div>
    </div>
  )
}
