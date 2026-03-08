import nodemailer from 'nodemailer';

// LWS SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.maloune.fr',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // SSL/TLS on port 465
  auth: {
    user: process.env.SMTP_USER || 'contact@maloune.fr',
    pass: process.env.SMTP_PASS || '',
  },
});

const FROM_EMAIL = process.env.SMTP_USER || 'contact@maloune.fr';
const FROM_NAME = 'Maloune';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'contact@maloune.fr';

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  shippingCountry: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
}

function buildItemsHtml(items: OrderEmailData['items']): string {
  return items.map(item => `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;font-size:14px;">${item.name}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:center;font-size:14px;">${item.quantity}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;font-size:14px;font-weight:600;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join('');
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  try {
    await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: data.customerEmail,
      subject: `Confirmation de commande ${data.orderNumber} - Maloune`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      <div style="background:#f97316;padding:30px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:24px;">MALOUNE</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Merci pour votre commande !</p>
      </div>
      <div style="padding:30px;">
        <p style="font-size:16px;color:#333;">Bonjour <strong>${data.customerName}</strong>,</p>
        <p style="font-size:14px;color:#666;line-height:1.6;">
          Votre commande <strong style="color:#f97316;">${data.orderNumber}</strong> a bien été reçue.
          Nous vous tiendrons informé de son avancement par email.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:10px 8px;text-align:left;font-size:12px;color:#666;text-transform:uppercase;">Article</th>
              <th style="padding:10px 8px;text-align:center;font-size:12px;color:#666;text-transform:uppercase;">Qté</th>
              <th style="padding:10px 8px;text-align:right;font-size:12px;color:#666;text-transform:uppercase;">Prix</th>
            </tr>
          </thead>
          <tbody>${buildItemsHtml(data.items)}</tbody>
        </table>
        <div style="background:#f9fafb;border-radius:12px;padding:16px;margin:20px 0;">
          <table style="width:100%;">
            <tr><td style="color:#666;font-size:14px;padding:4px 0;">Sous-total</td><td style="text-align:right;font-size:14px;">${formatPrice(data.subtotal)}</td></tr>
            <tr><td style="color:#666;font-size:14px;padding:4px 0;">Livraison</td><td style="text-align:right;font-size:14px;color:${data.shipping === 0 ? '#16a34a' : '#333'};">${data.shipping === 0 ? 'Gratuit' : formatPrice(data.shipping)}</td></tr>
            <tr><td colspan="2" style="border-top:1px solid #e5e7eb;padding-top:8px;"></td></tr>
            <tr><td style="font-weight:700;font-size:16px;padding:4px 0;">Total</td><td style="text-align:right;font-weight:700;font-size:18px;color:#f97316;">${formatPrice(data.total)}</td></tr>
          </table>
        </div>
        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin:20px 0;">
          <p style="margin:0 0 4px;font-size:12px;color:#f97316;font-weight:600;text-transform:uppercase;">Adresse de livraison</p>
          <p style="margin:0;font-size:14px;color:#333;line-height:1.5;">
            ${data.customerName}<br>
            ${data.shippingAddress}<br>
            ${data.shippingZip} ${data.shippingCity}<br>
            ${data.shippingCountry}
          </p>
        </div>
        <p style="font-size:13px;color:#999;text-align:center;margin-top:30px;">
          Une question ? Répondez directement à cet email ou contactez-nous à
          <a href="mailto:contact@maloune.fr" style="color:#f97316;">contact@maloune.fr</a>
        </p>
      </div>
      <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #eee;">
        <p style="margin:0;font-size:12px;color:#999;">Maloune — Votre boutique en ligne</p>
        <p style="margin:4px 0 0;font-size:12px;color:#ccc;">maloune.fr</p>
      </div>
    </div>
  </div>
</body>
</html>
      `,
    });
    console.log('Email confirmation sent to:', data.customerEmail);
    return true;
  } catch (error) {
    console.error('Email confirmation error:', error);
    return false;
  }
}

export async function sendAdminNotification(data: OrderEmailData) {
  try {
    await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `NOUVELLE COMMANDE ${data.orderNumber} - ${formatPrice(data.total)}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:monospace;padding:20px;background:#1a1a2e;color:#e0e0e0;">
  <div style="max-width:600px;margin:0 auto;">
    <h1 style="color:#f97316;font-size:22px;">NOUVELLE COMMANDE</h1>
    <hr style="border-color:#333;">
    <table style="width:100%;font-size:14px;">
      <tr><td style="color:#888;padding:6px 0;width:120px;">Commande:</td><td style="color:#f97316;font-weight:bold;">${data.orderNumber}</td></tr>
      <tr><td style="color:#888;padding:6px 0;">Client:</td><td>${data.customerName}</td></tr>
      <tr><td style="color:#888;padding:6px 0;">Email:</td><td><a href="mailto:${data.customerEmail}" style="color:#60a5fa;">${data.customerEmail}</a></td></tr>
      <tr><td style="color:#888;padding:6px 0;">Total:</td><td style="color:#4ade80;font-weight:bold;font-size:20px;">${formatPrice(data.total)}</td></tr>
      <tr><td style="color:#888;padding:6px 0;">Adresse:</td><td>${data.shippingAddress}, ${data.shippingZip} ${data.shippingCity}, ${data.shippingCountry}</td></tr>
    </table>
    <hr style="border-color:#333;">
    <h3 style="color:#ccc;margin-bottom:8px;">Articles:</h3>
    ${data.items.map(i => `<p style="margin:4px 0;color:#e0e0e0;">• ${i.name} x${i.quantity} = ${formatPrice(i.price * i.quantity)}</p>`).join('')}
    <hr style="border-color:#333;">
    <p style="color:#666;font-size:11px;margin-top:20px;">Envoyé automatiquement par Maloune | maloune.fr</p>
  </div>
</body>
</html>
      `,
    });
    console.log('Admin notification sent to:', ADMIN_EMAIL);
    return true;
  } catch (error) {
    console.error('Admin notification error:', error);
    return false;
  }
}
