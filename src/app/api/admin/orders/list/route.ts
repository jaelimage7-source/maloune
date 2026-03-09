import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const orders = await prisma.order.findMany({
      ...(status ? { where: { status: status as any } } : {}),
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: (o as any).orderNumber || o.id,
        status: o.status,
        total: (o as any).total || (o as any).amount || 0,
        email: (o as any).email || (o as any).shippingEmail || (o as any).customerEmail || 'N/A',
        name: [(o as any).shippingFirstName || (o as any).firstName, (o as any).shippingLastName || (o as any).lastName].filter(Boolean).join(' ') || 'N/A',
        trackingNumber: (o as any).trackingNumber || null,
        trackingUrl: (o as any).trackingUrl || null,
        items: o.items.map((i: any) => ({
          name: i.name || i.productName || 'Produit',
          quantity: i.quantity,
          price: i.price,
        })),
        createdAt: o.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
