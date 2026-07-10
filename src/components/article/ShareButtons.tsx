'use client'

import { Facebook, Twitter, Whatsapp } from '@/components/ui/BrandIcons'
import { Link2 } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonsProps {
  slug: string
  title: string
}

export default function ShareButtons({ slug, title }: ShareButtonsProps) {
  const url = `https://dhakachronicles.com/news/${slug}`

  const shareLinks = [
    { icon: Facebook, label: 'Facebook', href: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { icon: Twitter, label: 'Twitter', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
    { icon: Whatsapp, label: 'WhatsApp', href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${url}`)}` },
  ]

  return (
    <div className="flex items-center gap-3 mt-6">
      <span className="text-sm text-dc-text-muted font-medium">Share:</span>
      {shareLinks.map(({ icon: Icon, label, href }) => (
        <a 
          key={label} 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-dc-surface-2 hover:bg-dc-red text-dc-text-muted hover:text-white transition-all"
          title={`Share on ${label}`}
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
      <button 
        onClick={() => {
          navigator.clipboard?.writeText(window.location.href)
          toast.success('Link copied to clipboard!')
        }}
        className="p-2 rounded-lg bg-dc-surface-2 hover:bg-dc-surface text-dc-text-muted hover:text-white transition-all"
        title="Copy Link"
      >
        <Link2 className="w-4 h-4" />
      </button>
    </div>
  )
}

