import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmation, sendAdminNotification } from '@/lib/services/email.service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Auth: accept x-admin-key (curl) or allow from same origin (admin dashboard)
    const adminKey = request.headers.get('x-admin-key');
    const origin = request.headers.get('origin') || '';
    const isAdmin = (adminKey && adminKey === process.env.ADMIN_API_KEY) || origin.includes('maloune.fr') || origin.includes('localhost');
    if (!isAdmin) {
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

    const emailData = {
      orderNumber: order.orderNumber,
      customerName: order.shippingCustomerName,
      customerEmail: order.customerEmail,
      items: order.items.map((item: any) => ({
        name: item.productName || 'Produit',
        quantity: item.quantity || 1,
        price: Number(item.unitPrice || 0),
      })),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shippingCost),
      total: Number(order.totalAmount),
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingZip: order.shippingPostalCode || '',
      shippingCountry: order.shippingCountry,
    };

    const customerResult = await sendOrderConfirmation(emailData);
    const adminResult = await sendAdminNotification(emailData);

    return NextResponse.json({
      success: true,
      order: { id: order.id, orderNumber: order.orderNumber, email: order.customerEmail },
      customer: customerResult,
      admin: adminResult,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
