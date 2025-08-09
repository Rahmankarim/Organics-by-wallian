export default function sitemap() {
  const baseUrl = 'https://organicorchard.com'
  
  const routes = [
    '',
    '/about',
    '/products',
    '/blog',
    '/contact',
    '/cart',
    '/login',
    '/register',
    '/profile',
    '/orders',
    '/faq',
    '/privacy',
    '/terms',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : route.includes('/blog') ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route.includes('/products') ? 0.8 : 0.5,
  }))
}
