import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import { Users, BookOpen } from 'lucide-react'
import { supabaseAdmin } from '@/lib/db/admin'
import { slugify } from '@/lib/utils'

export const revalidate = 3600

const BASE = 'https://dhakachronicles.com'

export const metadata: Metadata = {
  title: 'Our Team – Dhaka Chronicles',
  description: 'Meet the journalists, editors, and creators driving independent reporting at Dhaka Chronicles.',
  alternates: { canonical: `${BASE}/team` },
  openGraph: {
    type: 'website',
    url: `${BASE}/team`,
    siteName: 'Dhaka Chronicles',
    title: 'Our Team – Dhaka Chronicles',
    description: 'Meet the journalists, editors, and creators driving independent reporting at Dhaka Chronicles.',
    images: [{ url: `${BASE}/og-default.png`, width: 1200, height: 630, alt: 'Dhaka Chronicles' }],
  },
}

const ROLE_ORDER: Record<string, number> = {
  founder: 0,
  admin: 1,
  publisher: 2,
  photographer: 3,
  videographer: 4,
  designer: 5,
}

const ROLE_LABELS: Record<string, string> = {
  founder: 'Founder & Editor-in-Chief',
  admin: 'Editor',
  publisher: 'Staff Reporter',
  photographer: 'Photographer',
  videographer: 'Videographer',
  designer: 'Designer',
}

const ROLE_COLOR: Record<string, string> = {
  founder: '#00A651',
  admin: '#06B6D4',
  publisher: '#8B5CF6',
}

type TeamMember = {
  id: string
  full_name: string | null
  role: string | null
  avatar_url: string | null
  bio: string | null
  twitter_url: string | null
  linkedin_url: string | null
  facebook_url: string | null
}

export default async function TeamPage() {
  const { data } = await supabaseAdmin
    .from('team_members')
    .select('id, full_name, role, avatar_url, bio, twitter_url, linkedin_url, facebook_url, display_order')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  const members = ((data as TeamMember[] | null) ?? [])
    .filter(m => m.full_name)
    .sort((a, b) => (ROLE_ORDER[a.role ?? ''] ?? 99) - (ROLE_ORDER[b.role ?? ''] ?? 99))

  const founders = members.filter(m => m.role === 'founder')
  const team = members.filter(m => m.role !== 'founder')

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'Dhaka Chronicles',
    url: BASE,
    employee: members.map(m => ({
      '@type': 'Person',
      name: m.full_name,
      jobTitle: ROLE_LABELS[m.role ?? ''] ?? 'Journalist',
      image: m.avatar_url ?? undefined,
      url: `${BASE}/author/${slugify(m.full_name ?? '')}`,
    })),
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Script
        id="team-org-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      {/* ── Header ── */}
      <div className="text-center mb-12 sm:mb-16">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1.5 rounded-full border"
          style={{ color: 'var(--dc-green)', borderColor: 'rgba(0,166,81,0.3)', background: 'rgba(0,166,81,0.08)' }}
        >
          <Users className="w-3 h-3" />
          Our Team
        </span>
        <h1
          className="font-headline font-black text-3xl sm:text-5xl mb-4 leading-tight"
          style={{ color: 'var(--dc-text)' }}
        >
          The People Behind the Stories
        </h1>
        <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--dc-text-muted)' }}>
          Independent journalists and storytellers committed to honest, impactful reporting
          from Bangladesh and beyond.
        </p>
      </div>

      {/* ── Leadership ── */}
      {founders.length > 0 && (
        <section className="mb-14">
          <div
            className="flex items-center gap-3 mb-8 pb-4"
            style={{ borderBottom: '1px solid var(--dc-border)' }}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: 'var(--dc-green)' }}
            />
            <h2 className="font-headline font-bold text-lg" style={{ color: 'var(--dc-text)' }}>
              Leadership
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {founders.map(member => (
              <MemberCard key={member.id} member={member} featured />
            ))}
          </div>
        </section>
      )}

      {/* ── Editorial Team ── */}
      {team.length > 0 && (
        <section className="mb-14">
          <div
            className="flex items-center gap-3 mb-8 pb-4"
            style={{ borderBottom: '1px solid var(--dc-border)' }}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: '#06B6D4' }}
            />
            <h2 className="font-headline font-bold text-lg" style={{ color: 'var(--dc-text)' }}>
              Editorial Team
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {team.map(member => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}

      {/* ── Empty state ── */}
      {members.length === 0 && (
        <div className="py-24 text-center" style={{ color: 'var(--dc-text-muted)' }}>
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Team profiles coming soon.</p>
        </div>
      )}

      {/* ── Join CTA ── */}
      <section
        className="mt-4 py-14 px-6 sm:px-12 rounded-2xl text-center"
        style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
      >
        <span
          className="inline-block text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: 'var(--dc-green)' }}
        >
          Join Us
        </span>
        <h2 className="font-headline font-black text-2xl sm:text-3xl mb-3" style={{ color: 'var(--dc-text)' }}>
          Ready to tell important stories?
        </h2>
        <p className="text-sm leading-relaxed mb-6 max-w-md mx-auto" style={{ color: 'var(--dc-text-muted)' }}>
          We&apos;re always looking for bold, independent voices. Check our open roles or pitch your story.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--dc-green)' }}
          >
            View Openings
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border transition-colors hover:border-dc-green hover:text-dc-green"
            style={{ color: 'var(--dc-text-muted)', borderColor: 'var(--dc-border)' }}
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}

function MemberCard({ member, featured = false }: { member: TeamMember; featured?: boolean }) {
  const slug = slugify(member.full_name ?? '')
  const role = ROLE_LABELS[member.role ?? ''] ?? 'Journalist'
  const roleColor = ROLE_COLOR[member.role ?? ''] ?? 'var(--dc-text-muted)'

  return (
    <Link
      href={`/author/${slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
      style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)', boxShadow: 'var(--card-shadow)' }}
    >
      {/* Avatar */}
      <div
        className={`relative w-full overflow-hidden ${featured ? 'aspect-[3/2]' : 'aspect-square'}`}
        style={{ background: 'var(--dc-surface-2)' }}
      >
        {member.avatar_url ? (
          <Image
            src={member.avatar_url}
            alt={member.full_name ?? 'Team member'}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `${roleColor}15` }}
          >
            <span
              className="font-black text-4xl sm:text-5xl font-headline"
              style={{ color: roleColor }}
            >
              {(member.full_name ?? 'DC').substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Role badge */}
        <span
          className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full backdrop-blur-md"
          style={{ background: `${roleColor}cc`, color: '#fff' }}
        >
          {role}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3
          className="font-headline font-bold text-sm sm:text-base leading-snug mb-1 group-hover:text-dc-green transition-colors"
          style={{ color: 'var(--dc-text)' }}
        >
          {member.full_name}
        </h3>
        {member.bio && (
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: 'var(--dc-text-muted)' }}
          >
            {member.bio}
          </p>
        )}
        <span
          className="mt-2 text-[10px] font-semibold"
          style={{ color: 'var(--dc-green)' }}
        >
          View articles →
        </span>
      </div>
    </Link>
  )
}
