import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const key = request.headers.get('x-admin-key');
  const origin = request.headers.get('origin') || request.headers.get('referer') || '';
  const isLocal = origin.includes('maloune.fr');
  if (key !== process.env.ADMIN_API_KEY && !isLocal) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const threshold = parseInt(request.nextUrl.searchParams.get('threshold') || '5');
    const variants = await prisma.productVariant.findMany({
      where: { cjInventory: { lte: threshold } },
      include: {
        product: {
          include: { translations: { where: { locale: 'fr' }, take: 1 } }
        }
      },
      orderBy: { cjInventory: 'asc' },
      take: 50,
    });

    const alerts = variants.map((v: any) => ({
      id: v.id,
      variantName: v.name,
      productName: v.product?.translations?.[0]?.name || 'Produit inconnu',
      productId: v.productId,
      sku: v.sku,
      stock: v.inventory,
      isOutOfStock: v.inventory <= 0,
    }));

    return NextResponse.json({
      success: true,
      total: alerts.length,
      outOfStock: alerts.filter((a: any) => a.isOutOfStock).length,
      lowStock: alerts.filter((a: any) => !a.isOutOfStock).length,
      alerts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

