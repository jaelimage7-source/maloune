import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmation, sendAdminNotification } from '@/lib/services/email.service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'orderId requis' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    const o = order as any;
    const customerEmail = o.email || o.shippingEmail || o.customerEmail || '';
    if (!customerEmail) {
      return NextResponse.json({ error: 'Pas d\'email client pour cette commande' }, { status: 400 });
    }

    const orderNum = o.orderNumber || o.id;
    const amount = String(o.total || o.amount || '0');

    const customerResult = await sendOrderConfirmation({
      to: customerEmail,
      orderNumber: orderNum,
      amount,
      items: order.items.map((item: any) => ({
        name: item.name || item.productName || 'Produit',
        quantity: item.quantity || 1,
        price: String(item.price || '0'),
      })),
    });

    const adminResult = await sendAdminNotification({
      orderNumber: orderNum,
      amount,
      customerEmail,
    });

    return NextResponse.json({
      success: true,
      order: { id: order.id, orderNumber: orderNum, email: customerEmail },
      customer: customerResult,
      admin: adminResult,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
