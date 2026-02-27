import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { cjProductId, name, image, costPrice, sellPrice, category, weight, description } = await request.json();
    if (!name || !sellPrice) return NextResponse.json({ error: 'Nom et prix requis' }, { status: 400 });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80) + '-' + Date.now().toString(36);
    const catSlug = (category || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    let cat = await prisma.category.findFirst({ where: { slug: catSlug } });
    if (!cat) {
      cat = await prisma.category.create({
        data: { slug: catSlug, level: 1, isActive: true }
      });
      await prisma.categoryTranslation.createMany({
        data: [
          { categoryId: cat.id, locale: 'fr', name: category || 'Général' },
          { categoryId: cat.id, locale: 'en', name: category || 'General' },
        ]
      });
    }

    const product = await prisma.product.create({
      data: {
        cjProductId: cjProductId || null,
        category: { connect: { id: cat.id } },
        sellPrice: sellPrice,
        compareAtPrice: Math.ceil(sellPrice * 1.5 * 100) / 100,
        costPrice: costPrice || 0,
        cjSellPrice: costPrice || 0,
        mainImageUrl: image || '',
        images: image ? [image] : [],
        slug,
        isActive: true,
        weightGrams: weight || 0,
      }
    });

    await prisma.productTranslation.createMany({
      data: [
        { productId: product.id, locale: 'fr', name, description: description || name },
        { productId: product.id, locale: 'en', name, description: description || name },
      ]
    });

    return NextResponse.json({ success: true, product: { id: product.id, name, slug } });
  } catch (e: any) {
    console.error('Import Error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
