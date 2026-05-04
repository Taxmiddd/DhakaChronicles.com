'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ExternalLink, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

export function PortfolioGrid({ items, categories }: { items: PortfolioItem[]; categories: string[] }) {
  const [active, setActive] = useState('All')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filtered = active === 'All' ? items : items.filter(i => i.category === active)

  return (
    <>
      {/* Filter chips */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          {['All', ...categories].map((cat, index) => {
            const isActive = active === cat
            const color = cat === 'All' ? 'var(--dc-green)' : (CATEGORY_COLORS[cat] ?? '#888')
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className="relative px-4 py-2.5 rounded-full text-sm font-semibold border transition-all duration-300 hover:scale-105 animate-fade-in-up"
                style={{
                  animationDelay: `${index * 100}ms`,
                  background: isActive ? color : `${color}08`,
                  borderColor: isActive ? color : `${color}30`,
                  color: isActive ? '#fff' : color,
                  boxShadow: isActive ? `0 4px 20px ${color}30` : 'none'
                }}
              >
                {cat}
                {isActive && (
                  <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: `${color}20` }}></div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, index) => (
            <motion.article
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative rounded-3xl overflow-hidden flex flex-col animate-fade-in-up"
              style={{
                animationDelay: `${index * 150}ms`,
                background: 'var(--dc-surface)',
                border: '1px solid var(--dc-border)',
                boxShadow: 'var(--card-shadow)',
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden" style={{ background: 'var(--dc-surface-2)' }}>
                {item.featured_image_url ? (
                  <Image
                    src={item.featured_image_url}
                    alt={item.project_name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: `${CATEGORY_COLORS[item.category] ?? '#888'}10` }}
                  >
                    {item.logo_url ? (
                      <Image
                        src={item.logo_url}
                        alt={item.brand_name}
                        width={120}
                        height={48}
                        className="object-contain opacity-40"
                      />
                    ) : (
                      <span
                        className="text-4xl font-black font-headline opacity-10"
                        style={{ color: 'var(--dc-text)' }}
                      >
                        {item.brand_name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                {/* Category badge */}
                <span
                  className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md"
                  style={{
                    background: `${CATEGORY_COLORS[item.category] ?? '#888'}25`,
                    color: CATEGORY_COLORS[item.category] ?? 'var(--dc-text-muted)',
                    border: `1px solid ${CATEGORY_COLORS[item.category] ?? '#888'}35`,
                  }}
                >
                  {item.category}
                </span>

                {/* Logo overlay */}
                {item.logo_url && item.featured_image_url && (
                  <div
                    className="absolute bottom-3 left-3 px-2 py-1.5 rounded-lg backdrop-blur-md"
                    style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    <Image
                      src={item.logo_url}
                      alt={item.brand_name}
                      width={60}
                      height={24}
                      className="h-5 w-auto object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col flex-1">
                {/* Brand name */}
                {!item.logo_url && (
                  <span className="text-xs font-semibold uppercase tracking-wide mb-3 transition-colors group-hover:text-dc-green" style={{ color: 'var(--dc-text-muted)' }}>
                    {item.brand_name}
                  </span>
                )}
                {item.logo_url && !item.featured_image_url && (
                  <div className="flex items-center gap-3 mb-4">
                    <Image src={item.logo_url} alt={item.brand_name} width={28} height={28} className="object-contain transition-transform group-hover:scale-110" />
                    <span className="text-xs font-semibold uppercase tracking-wide transition-colors group-hover:text-dc-green" style={{ color: 'var(--dc-text-muted)' }}>
                      {item.brand_name}
                    </span>
                  </div>
                )}

                <h3
                  className="font-headline font-bold text-xl leading-snug mb-3 transition-all duration-300 group-hover:text-dc-green group-hover:translate-x-1"
                  style={{ color: 'var(--dc-text)' }}
                >
                  {item.project_name}
                </h3>

                <p className="text-sm leading-relaxed flex-1 mb-4 transition-colors group-hover:text-opacity-80" style={{ color: 'var(--dc-text-muted)' }}>
                  {item.description}
                </p>

                {/* Outcome */}
                {item.outcome && (
                  <div
                    className="mt-auto flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
                    style={{ background: 'rgba(0,166,81,0.08)', color: 'var(--dc-green)', border: '1px solid rgba(0,166,81,0.15)' }}
                  >
                    <TrendingUp className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
                    <span>{item.outcome}</span>
                  </div>
                )}

                {/* External link */}
                {item.external_link && (
                  <a
                    href={item.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300 hover:translate-x-1 group-hover:text-dc-green"
                    style={{ color: 'var(--dc-green)' }}
                  >
                    View campaign <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                )}
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="text-center py-16 text-sm" style={{ color: 'var(--dc-text-muted)' }}>
          No campaigns in this category yet.
        </p>
      )}
    </>
  )
}
