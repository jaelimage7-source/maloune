import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Check admin key
  const adminKey = request.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { to, orderNumber, amount } = await request.json();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.maloune.fr',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'contact@maloune.fr',
        pass: process.env.SMTP_PASS || '',
      },
    });

    // Test SMTP connection first
    await transporter.verify();

    // Send customer email
    const customerResult = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Maloune <contact@maloune.fr>',
      to: to,
      subject: `Confirmation de commande ${orderNumber || 'TEST'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #D4A030;">Merci pour votre commande!</h1>
          <p>Votre commande <strong>${orderNumber || 'TEST-001'}</strong> a été confirmée.</p>
          <p>Montant: <strong>${amount || '0.00'} EUR</strong></p>
          <p>Nous vous tiendrons informé de l'avancement de votre commande.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Maloune - maloune.fr</p>
        </div>
      `,
    });

    // Send admin notification
    const adminResult = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Maloune <contact@maloune.fr>',
      to: process.env.ADMIN_EMAIL || 'contact@maloune.fr',
      subject: `Nouvelle commande ${orderNumber || 'TEST'}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Nouvelle commande reçue</h2>
          <p>Commande: <strong>${orderNumber || 'TEST-001'}</strong></p>
          <p>Client: <strong>${to}</strong></p>
          <p>Montant: <strong>${amount || '0.00'} EUR</strong></p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      smtp: { host: process.env.SMTP_HOST, user: process.env.SMTP_USER },
      customer: { accepted: customerResult.accepted },
      admin: { accepted: adminResult.accepted },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      smtp: { 
        host: process.env.SMTP_HOST || 'NOT SET',
        user: process.env.SMTP_USER || 'NOT SET',
        passSet: !!(process.env.SMTP_PASS),
      },
    }, { status: 500 });
  }
}
