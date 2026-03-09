import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://maloune.fr';
  const locales = ['fr', 'en', 'ht'];

  const staticPages = ['', '/products', '/faq', '/contact', '/account',
    '/mentions-legales', '/conditions-generales', '/politique-confidentialite', '/politique-remboursement'];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({ url: `${baseUrl}/${locale}${page}`, lastModified: new Date(), changeFrequency: page === '' ? 'daily' : 'weekly', priority: page === '' ? 1 : 0.8 });
    }
  }

  try {
    const products = await prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
    for (const product of products) {
      for (const locale of locales) {
        entries.push({ url: `${baseUrl}/${locale}/products/${product.slug}`, lastModified: product.updatedAt, changeFrequency: 'weekly', priority: 0.7 });
      }
    }
  } catch { /* DB not available during build */ }

  return entries;
}

