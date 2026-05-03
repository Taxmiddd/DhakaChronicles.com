import { NewsArticle, WithContext } from 'schema-dts'

interface JsonLdProps {
  article: {
    title: string
    slug: string
    excerpt: string | null
    featured_image_url: string | null
    published_at: string | null
    updated_at: string | null
    author: { full_name: string | null } | null
    category: { name: string; slug: string } | null
  }
}

const BASE = 'https://dhakachronicles.com'

export default function JsonLd({ article }: JsonLdProps) {
  const articleUrl = `${BASE}/news/${article.slug}`

  const newsArticle: WithContext<NewsArticle> = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt ?? article.title,
    image: article.featured_image_url
      ? [{ '@type': 'ImageObject', url: article.featured_image_url }]
      : [`${BASE}/og-default.png`],
    datePublished: article.published_at ?? new Date().toISOString(),
    dateModified: article.updated_at ?? article.published_at ?? new Date().toISOString(),
    url: articleUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    author: {
      '@type': 'Person',
      name: article.author?.full_name ?? 'Dhaka Chronicles Staff',
      url: BASE,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'Dhaka Chronicles',
      url: BASE,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE}/dc-logo-black.svg`,
      },
    },
    ...(article.category?.name && { articleSection: article.category.name }),
    inLanguage: 'en',
    copyrightHolder: {
      '@type': 'Organization',
      name: 'Dhaka Chronicles',
    },
    copyrightYear: new Date(article.published_at ?? Date.now()).getFullYear(),
  }

  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
    ...(article.category
      ? [{ '@type': 'ListItem', position: 2, name: article.category.name, item: `${BASE}/category/${article.category.slug}` }]
      : []),
    { '@type': 'ListItem', position: article.category ? 3 : 2, name: article.title, item: articleUrl },
  ]

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  )
}
