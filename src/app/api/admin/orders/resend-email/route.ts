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

    const customerEmail = order.email || order.shippingEmail || '';
    if (!customerEmail) {
      return NextResponse.json({ error: 'Pas d\'email client pour cette commande' }, { status: 400 });
    }

    // Send confirmation email
    const customerResult = await sendOrderConfirmation({
      to: customerEmail,
      orderNumber: order.orderNumber || order.id,
      amount: order.total?.toString() || '0',
      items: order.items.map((item: any) => ({
        name: item.name || item.productName || 'Produit',
        quantity: item.quantity || 1,
        price: item.price?.toString() || '0',
      })),
    });

    // Also notify admin
    const adminResult = await sendAdminNotification({
      orderNumber: order.orderNumber || order.id,
      amount: order.total?.toString() || '0',
      customerEmail,
    });

    return NextResponse.json({
      success: true,
      order: { id: order.id, orderNumber: order.orderNumber, email: customerEmail },
      customer: customerResult,
      admin: adminResult,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
