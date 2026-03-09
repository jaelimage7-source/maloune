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

    const where = status ? { status } : {};

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders: orders.map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        total: o.total,
        email: o.email || o.shippingEmail,
        name: [o.shippingFirstName, o.shippingLastName].filter(Boolean).join(' ') || 'N/A',
        trackingNumber: o.trackingNumber,
        trackingUrl: o.trackingUrl,
        items: o.items.map((i: any) => ({
          name: i.name || i.productName,
          quantity: i.quantity,
          price: i.price,
          sku: i.sku,
          externalId: i.externalId,
        })),
        createdAt: o.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
