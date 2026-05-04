import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from 'sonner'
import CookieConsent from '@/components/common/CookieConsent'
import { ThemeProvider } from '@/components/common/ThemeProvider'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Dhaka Chronicles',
    default: 'Dhaka Chronicles — News from the Heart of Bangladesh',
  },
  description: 'Your trusted bilingual source for breaking news, analysis, and stories from Dhaka and Bangladesh. আপনার বিশ্বস্ত দ্বিভাষিক সংবাদ উৎস।',
  keywords: [
    'Bangladesh news', 'Dhaka news', 'Bangladesh breaking news',
    'Dhaka Chronicles', 'বাংলাদেশ সংবাদ', 'ঢাকা ক্রনিকেলস',
    'Bangladesh politics', 'Bangladesh business', 'Dhaka today',
  ],
  authors: [{ name: 'Dhaka Chronicles', url: 'https://dhakachronicles.com' }],
  creator: 'NOÉTIC Studio',
  publisher: 'Dhaka Chronicles',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://dhakachronicles.com'),
  alternates: {
    canonical: 'https://dhakachronicles.com',
    types: {
      'application/rss+xml': 'https://dhakachronicles.com/api/rss',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'bn_BD',
    siteName: 'Dhaka Chronicles',
    url: 'https://dhakachronicles.com',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Dhaka Chronicles' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@DhakaChronicles',
    creator: '@DhakaChronicles',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification token here
    // google: 'your-google-verification-token',
  },
  category: 'news',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
}

import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  name: 'Dhaka Chronicles',
  url: 'https://dhakachronicles.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://dhakachronicles.com/icons/icon-192.png',
    width: 192,
    height: 192,
  },
  sameAs: [
    'https://facebook.com/dhakachronicles',
    'https://twitter.com/dhakachronicles',
    'https://youtube.com/@dhakachronicles',
    'https://instagram.com/dhakachronicles',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'hello@dhakachronicles.com',
    contactType: 'editorial',
  },
  foundingDate: '2024',
  description: 'Bangladesh\'s leading independent digital news platform.',
  publishingPrinciples: 'https://dhakachronicles.com/about',
  masthead: 'https://dhakachronicles.com/about',
}

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Dhaka Chronicles',
  url: 'https://dhakachronicles.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://dhakachronicles.com/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const isProduction = process.env.NODE_ENV === 'production'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh flex flex-col" style={{ background: 'var(--background)', color: 'var(--dc-text)' }}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TNDBDWZQ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* Structured data — always present so Googlebot can read it */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }} />

        {isProduction && (
          <>
            {/* Google Tag Manager */}
            <Script
              id="gtm"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TNDBDWZQ');`,
              }}
            />
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
            <Script
              id="hotjar"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(h,o,t,j,a,r){
                      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                      h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID || '1234567'},hjsv:6};
                      a=o.getElementsByTagName('head')[0];
                      r=o.createElement('script');r.async=1;
                      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                      a.appendChild(r);
                  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                `,
              }}
            />
            <Script
              src="https://t.contentsquare.net/uxa/2a2b8d46a08f9.js"
              strategy="afterInteractive"
            />
            <Script
              src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
              strategy="lazyOnload"
            />
            <Script
              id="onesignal-init"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: `
                  window.OneSignalDeferred = window.OneSignalDeferred || [];
                  OneSignalDeferred.push(function(OneSignal) {
                    OneSignal.init({
                      appId: "${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || ''}",
                    });
                  });
                `,
              }}
            />
          </>
        )}

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Analytics />
          <CookieConsent />
          <Toaster
            richColors
            position="bottom-right"
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
