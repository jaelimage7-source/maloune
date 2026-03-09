import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.maloune.fr',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'contact@maloune.fr',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orderId, trackingNumber, carrier, trackingUrl } = await request.json();
    if (!orderId || !trackingNumber) {
      return NextResponse.json({ error: 'orderId et trackingNumber requis' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    // Store tracking in note field (no trackingNumber column in schema)
    const trackingInfo = `Tracking: ${carrier || 'N/A'} - ${trackingNumber}${trackingUrl ? ' - ' + trackingUrl : ''}`;
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'SHIPPED' as any,
        
      },
    });

    // Send tracking email to customer
    const itemsList = order.items.map((item: any) =>
      `${item.productName || 'Produit'} x${item.quantity}`
    ).join(', ');

    await transporter.sendMail({
      from: `Maloune <${process.env.SMTP_USER || 'contact@maloune.fr'}>`,
      to: order.customerEmail,
      subject: `Votre commande ${order.orderNumber} a été expédiée - Maloune`,
      html: `
        <h2>Votre commande a été expédiée !</h2>
        <p>Bonjour ${order.shippingCustomerName},</p>
        <p>Votre commande <strong>${order.orderNumber}</strong> est en route.</p>
        <p><strong>Transporteur :</strong> ${carrier || 'Standard'}</p>
        <p><strong>Numéro de suivi :</strong> ${trackingNumber}</p>
        ${trackingUrl ? `<p><a href="${trackingUrl}">Suivre mon colis</a></p>` : ''}
        <p><strong>Articles :</strong> ${itemsList}</p>
        <p>Merci pour votre confiance !</p>
        <p>L'équipe Maloune</p>
      `,
    });

    return NextResponse.json({
      success: true,
      order: { id: order.id, orderNumber: order.orderNumber, status: 'SHIPPED' },
      tracking: { carrier, trackingNumber, trackingUrl },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
