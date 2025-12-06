export default function sitemap() {
  const baseUrl = 'https://origiganicsbywallian.com'
  
  const routes = [
    '',
    '/about',
    '/products',
    '/blog',
    '/contact',
    '/faq',
    '/privacy',
    '/terms',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : route.includes('/blog') || route.includes('/products') ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route.includes('/products') ? 0.9 : route.includes('/blog') ? 0.7 : 0.5,
  }))
}
