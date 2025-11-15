import Head from 'next/head'

interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  image?: string
  type?: string
}

export default function SEO({ 
  title = "Origiganics by Wallian - Premium Dry Fruits",
  description = "Premium organic dry fruits sourced directly from the finest orchards. 100% organic, premium quality, fast delivery.",
  canonical,
  image = "/og-image.jpg",
  type = "website"
}: SEOProps) {
  const fullTitle = title.includes('Origiganics by Wallian') 
    ? title 
    : `${title} | Origiganics by Wallian`

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {canonical && <meta property="og:url" content={canonical} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    </Head>
  )
}
