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

    // Build update data dynamically based on what fields exist
    const updateData: any = { status: 'SHIPPED' };
    // Try to set tracking fields - they may or may not exist in schema
    updateData.trackingNumber = trackingNumber;
    if (trackingUrl) updateData.trackingUrl = trackingUrl;
    if (carrier) updateData.note = `Transporteur: ${carrier}`;

    let order: any;
    try {
      order = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: { items: true },
      });
    } catch (prismaErr: any) {
      // If trackingNumber field doesn't exist, try without it
      if (prismaErr.message?.includes('Unknown argument')) {
        order = await prisma.order.update({
          where: { id: orderId },
          data: { status: 'SHIPPED' },
          include: { items: true },
        });
        // Store tracking in note field as fallback
        await prisma.order.update({
          where: { id: orderId },
          data: { note: `Tracking: ${trackingNumber} | ${carrier || ''} | ${trackingUrl || ''}` },
        }).catch(() => {});
      } else {
        throw prismaErr;
      }
    }

    const customerEmail = order.email || order.shippingEmail || order.customerEmail || '';
    if (!customerEmail) {
      return NextResponse.json({
        success: true,
        warning: 'Tracking ajouté mais pas d\'email client',
        order: { id: order.id, trackingNumber, status: 'SHIPPED' },
      });
    }

    const itemsList = order.items.map((item: any) =>
      `<tr><td style="padding:8px;border-bottom:1px solid #eee">${item.name || (item as any).productName || 'Produit'}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity || 1}</td></tr>`
    ).join('');

    const trackLink = trackingUrl
      ? `<a href="${trackingUrl}" style="display:inline-block;padding:12px 24px;background:#f97316;color:white;text-decoration:none;border-radius:8px;font-weight:bold">Suivre mon colis</a>`
      : `<p style="font-size:16px;background:#f3f4f6;padding:12px;border-radius:8px;text-align:center;font-family:monospace">${trackingNumber}</p>`;

    const orderNum = order.orderNumber || order.id;

    await transporter.sendMail({
      from: `"MALOUNE" <${process.env.SMTP_USER || 'contact@maloune.fr'}>`,
      to: customerEmail,
      subject: `Votre commande ${orderNum} a été expédiée !`,
      html: `<div style="max-width:600px;margin:0 auto;font-family:sans-serif"><div style="background:#1a1a1a;padding:20px;text-align:center"><h1 style="color:#f97316;margin:0;font-size:24px">MALOUNE</h1></div><div style="padding:30px;background:#fff"><h2 style="color:#1a1a1a">Bonne nouvelle ! Votre commande est en route</h2><p>Bonjour,</p><p>Votre commande <strong>${orderNum}</strong> a été expédiée${carrier ? ' via <strong>' + carrier + '</strong>' : ''}.</p><h3 style="margin-top:20px">Numéro de suivi</h3>${trackLink}<h3 style="margin-top:20px">Articles commandés</h3><table style="width:100%;border-collapse:collapse"><tr style="background:#f9fafb"><th style="padding:8px;text-align:left">Produit</th><th style="padding:8px;text-align:center">Qté</th></tr>${itemsList}</table><p style="margin-top:20px;color:#6b7280;font-size:14px">Les délais de livraison sont généralement de 10 à 20 jours ouvrés.</p><p style="margin-top:20px">Une question ? <a href="mailto:contact@maloune.fr" style="color:#f97316">contact@maloune.fr</a></p></div><div style="background:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#9ca3af">© 2026 MALOUNE — maloune.fr</div></div>`,
    });

    return NextResponse.json({
      success: true,
      order: { id: order.id, orderNumber: orderNum, trackingNumber, status: 'SHIPPED' },
      emailSent: true,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
