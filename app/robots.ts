export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/profile/', '/orders/', '/cart/'],
    },
    sitemap: 'https://organicorchard.com/sitemap.xml',
  }
}
