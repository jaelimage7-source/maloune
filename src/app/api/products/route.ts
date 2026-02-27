import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'fr';
    const cat = searchParams.get('cat') || '';

    const where: any = { isActive: true };
    if (cat) {
      where.category = { slug: cat };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        translations: { where: { locale: locale as any } },
        category: {
          include: { translations: { where: { locale: locale as any } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: { translations: { where: { locale: locale as any } } }
    });

    const formatted = products.map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.translations[0]?.name || 'Produit',
      description: p.translations[0]?.description || '',
      price: Number(p.sellPrice),
      comparePrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
      image: p.mainImageUrl || '',
      images: (p.images as string[]) || [],
      category: p.category?.translations[0]?.name || '',
      categorySlug: p.category?.slug || '',
      rating: 4.5,
      reviewCount: Math.floor(Math.random() * 200) + 50,
      inStock: true,
      tag: undefined,
    }));

    const formattedCats = categories.map(c => ({
      name: c.translations[0]?.name || c.slug,
      slug: c.slug,
    }));

    return NextResponse.json({ products: formatted, categories: formattedCats });
  } catch (e: any) {
    console.error('Products API Error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
