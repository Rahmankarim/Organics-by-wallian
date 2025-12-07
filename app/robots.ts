export default function robots() {
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/admin/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/admin/',
          '/profile/',
          '/orders/',
          '/cart/',
          '/checkout/',
          '/settings/',
          '/api/auth/',
        ],
      },
    ],
    sitemap: 'https://origiganicsbywallian.com/sitemap.xml',
  }
}
