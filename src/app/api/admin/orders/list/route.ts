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
      orders: orders.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
        customerName: order.shippingCustomerName,
        status: order.status,
        total: Number(order.totalAmount),
        currency: order.currency,
        createdAt: order.createdAt,
        note: order.note,
        items: order.items.map((item: any) => ({
          name: item.productName || 'Produit',
          variant: item.variantName || null,
          quantity: item.quantity,
          price: Number(item.unitPrice),
          sku: item.sku,
        })),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
