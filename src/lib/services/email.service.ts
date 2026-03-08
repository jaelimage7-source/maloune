import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'Maloune <noreply@maloune.fr>';
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
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Confirmation de commande ${data.orderNumber} - Maloune`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="background:#f97316;padding:30px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:24px;">MALOUNE</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Merci pour votre commande !</p>
      </div>
      
      <!-- Content -->
      <div style="padding:30px;">
        <p style="font-size:16px;color:#333;">Bonjour <strong>${data.customerName}</strong>,</p>
        <p style="font-size:14px;color:#666;line-height:1.6;">
          Votre commande <strong style="color:#f97316;">${data.orderNumber}</strong> a bien été reçue. 
          Nous vous tiendrons informé de son avancement par email.
        </p>

        <!-- Items -->
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:10px 8px;text-align:left;font-size:12px;color:#666;text-transform:uppercase;">Article</th>
              <th style="padding:10px 8px;text-align:center;font-size:12px;color:#666;text-transform:uppercase;">Qté</th>
              <th style="padding:10px 8px;text-align:right;font-size:12px;color:#666;text-transform:uppercase;">Prix</th>
            </tr>
          </thead>
          <tbody>
            ${buildItemsHtml(data.items)}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="background:#f9fafb;border-radius:12px;padding:16px;margin:20px 0;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:#666;font-size:14px;">Sous-total</span>
            <span style="font-size:14px;">${formatPrice(data.subtotal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:#666;font-size:14px;">Livraison</span>
            <span style="font-size:14px;color:${data.shipping === 0 ? '#16a34a' : '#333'};">${data.shipping === 0 ? 'Gratuit' : formatPrice(data.shipping)}</span>
          </div>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0;">
          <div style="display:flex;justify-content:space-between;">
            <span style="font-weight:700;font-size:16px;">Total</span>
            <span style="font-weight:700;font-size:18px;color:#f97316;">${formatPrice(data.total)}</span>
          </div>
        </div>

        <!-- Shipping -->
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
          Une question ? Contactez-nous à <a href="mailto:contact@maloune.fr" style="color:#f97316;">contact@maloune.fr</a>
        </p>
      </div>

      <!-- Footer -->
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
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Nouvelle commande ${data.orderNumber} - ${formatPrice(data.total)}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:monospace;padding:20px;background:#1a1a2e;color:#e0e0e0;">
  <div style="max-width:600px;margin:0 auto;">
    <h1 style="color:#f97316;">NOUVELLE COMMANDE</h1>
    <hr style="border-color:#333;">
    <table style="width:100%;font-size:14px;">
      <tr><td style="color:#888;padding:4px 0;">Commande:</td><td style="color:#f97316;font-weight:bold;">${data.orderNumber}</td></tr>
      <tr><td style="color:#888;padding:4px 0;">Client:</td><td>${data.customerName}</td></tr>
      <tr><td style="color:#888;padding:4px 0;">Email:</td><td><a href="mailto:${data.customerEmail}" style="color:#60a5fa;">${data.customerEmail}</a></td></tr>
      <tr><td style="color:#888;padding:4px 0;">Total:</td><td style="color:#4ade80;font-weight:bold;font-size:18px;">${formatPrice(data.total)}</td></tr>
      <tr><td style="color:#888;padding:4px 0;">Adresse:</td><td>${data.shippingAddress}, ${data.shippingZip} ${data.shippingCity}</td></tr>
    </table>
    <hr style="border-color:#333;">
    <h3 style="color:#ccc;">Articles:</h3>
    ${data.items.map(i => `<p style="margin:4px 0;">- ${i.name} x${i.quantity} = ${formatPrice(i.price * i.quantity)}</p>`).join('')}
    <hr style="border-color:#333;">
    <p style="color:#666;font-size:12px;">Envoyé automatiquement par Maloune</p>
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
