import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, orderNumber } = await request.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.maloune.fr',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: { user: process.env.SMTP_USER || 'contact@maloune.fr', pass: process.env.SMTP_PASS || '' },
    });
    await transporter.sendMail({
      from: `"Maloune Contact" <${process.env.SMTP_USER || 'contact@maloune.fr'}>`,
      to: process.env.ADMIN_EMAIL || 'contact@maloune.fr',
      replyTo: email,
      subject: `[Contact] ${subject || 'Message'} — ${name}`,
      html: `<h2 style="color:#F97316;">Nouveau message</h2><p><b>Nom:</b> ${name}</p><p><b>Email:</b> ${email}</p>${subject ? `<p><b>Sujet:</b> ${subject}</p>` : ''}${orderNumber ? `<p><b>Commande:</b> ${orderNumber}</p>` : ''}<div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;white-space:pre-wrap;">${message}</div>`,
    });
    await transporter.sendMail({
      from: `"Maloune" <${process.env.SMTP_USER || 'contact@maloune.fr'}>`,
      to: email,
      subject: `Merci pour votre message — Maloune`,
      html: `<h2 style="color:#F97316;">Merci ${name} !</h2><p>Nous avons bien reçu votre message et vous répondrons sous 48h ouvrées.</p><p style="color:#9ca3af;font-size:12px;">— L'équipe Maloune</p>`,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contact error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

