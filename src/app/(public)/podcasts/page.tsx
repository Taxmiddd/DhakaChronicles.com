import { Metadata } from 'next'
import { Headphones, PlayCircle } from 'lucide-react'
import { supabaseAdmin } from '@/lib/db/admin'

export const metadata: Metadata = {
  title: 'Podcasts | Dhaka Chronicles',
  description: 'Listen to the latest audio stories, interviews, and deep dives from Dhaka Chronicles.',
}

export const revalidate = 3600 // Revalidate every hour

async function getPodcasts() {
  const { data, error } = await supabaseAdmin
    .from('podcast_series')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) return []
  return data
}

export default async function PodcastsPage() {
  const podcasts = await getPodcasts()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="w-16 h-16 bg-dc-green/10 rounded-full flex items-center justify-center mb-6">
          <Headphones className="w-8 h-8 text-dc-green" />
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">
          Dhaka Chronicles <span className="text-dc-green">Audio</span>
        </h1>
        <p className="text-lg text-dc-text-muted max-w-2xl">
          Dive deeper into the stories that matter. Original reporting, interviews, and analysis—now in audio.
        </p>
      </div>

      {podcasts.length === 0 ? (
        <div className="text-center py-24 bg-dc-surface rounded-2xl border border-dc-border">
          <p className="text-dc-text-muted text-lg">No podcast series available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {podcasts.map((series) => (
            <div key={series.id} className="group cursor-pointer">
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-dc-surface border border-dc-border shadow-lg transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-dc-green/20">
                {series.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={series.cover_image_url} 
                    alt={series.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-dc-surface-2">
                    <Headphones className="w-16 h-16 text-dc-border" />
                  </div>
                )}
                
                {/* Overlay Play Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-headline font-bold text-dc-text group-hover:text-dc-green transition-colors mb-2">
                {series.title}
              </h3>
              <p className="text-dc-text-muted line-clamp-2">
                {series.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
