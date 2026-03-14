import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://albertstructural.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/cursos_m`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/pricing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/testimonials`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Dynamic course pages from DB
  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: courses } = await admin
      .from('courses')
      .select('slug, updated_at')
      .eq('status', 'published');

    const courseRoutes: MetadataRoute.Sitemap = (courses || []).map((course: any) => ({
      url: `${siteUrl}/cursos_m/${course.slug}`,
      lastModified: course.updated_at ? new Date(course.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));

    return [...staticRoutes, ...courseRoutes];
  } catch {
    return staticRoutes;
  }
}
