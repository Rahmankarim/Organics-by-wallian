export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin/*',
          '/api/admin/*',
          '/profile/',
          '/orders/',
          '/cart/',
          '/checkout/',
          '/settings/',
          '/api/auth/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/admin/*', '/api/admin/*'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
    ],
    sitemap: 'https://origiganicsbywallian.com/sitemap.xml',
  }
}
