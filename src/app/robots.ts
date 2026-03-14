import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://albertstructural.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/cursos_m', '/about', '/pricing', '/contact', '/testimonials'],
        disallow: [
          '/admin',
          '/dashboard',
          '/cursos',
          '/classroom',
          '/checkout',
          '/api',
          '/settings',
          '/profile',
          '/certificados',
          '/community',
          '/tools',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
