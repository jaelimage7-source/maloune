import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { cjProductId, name, image, costPrice, sellPrice, category, weight } = await request.json();
    if (!name || !sellPrice) return NextResponse.json({ error: 'Name and price required' }, { status: 400 });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80);

    let cat = await prisma.category.findFirst({ where: { name: category || 'Général' } });
    if (!cat) {
      cat = await prisma.category.create({
        data: { name: category || 'Général', slug: (category || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '-'), is_active: true },
      });
    }

    const product = await prisma.product.create({
      data: {
        name, slug: slug + '-' + Date.now().toString(36), description: name,
        price: sellPrice, compare_price: Math.ceil(sellPrice * 1.5 * 100) / 100, cost_price: costPrice,
        image_url: image || '', images: image ? [image] : [], category_id: cat.id,
        cj_product_id: cjProductId, weight: weight || 0, is_active: true, stock_quantity: 999,
        sku: 'CJ-' + (cjProductId?.substring(0, 12) || Date.now()),
      },
    });

    return NextResponse.json({ success: true, product: { id: product.id, name: product.name, slug: product.slug, price: product.price } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
