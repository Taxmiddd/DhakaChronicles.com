import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dhaka Chronicles',
    short_name: 'DhakaChronicles',
    description: 'Breaking news, in-depth analysis, and stories from Bangladesh.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#00A651',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['news'],
    lang: 'en-BD',
    dir: 'ltr',
    shortcuts: [
      {
        name: 'Latest News',
        url: '/news',
        description: 'Read the latest articles',
      },
      {
        name: 'Search',
        url: '/search',
        description: 'Search Dhaka Chronicles',
      },
    ],
  }
}
