import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createOrder } from '@/lib/services/order.service';

function getPrivateKey(): string {
  const b64Key = process.env.MYPOS_PRIVATE_KEY_B64;
  if (b64Key) return Buffer.from(b64Key, 'base64').toString('utf-8');
  const pk = process.env.MYPOS_PRIVATE_KEY || '';
  if (!pk) throw new Error('MYPOS_PRIVATE_KEY not configured');
  return pk.replace(/\\n/g, '\n');
}

function getRequiredEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`${name} not configured`);
  return val;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin') || '';
  const referer = request.headers.get('referer') || '';
  const allowed = ['https://maloune.fr', 'https://www.maloune.fr', 'http://localhost'];
  return allowed.some(a => origin.startsWith(a) || referer.startsWith(a));
}

/**
 * Generate myPOS signature per official docs:
 * 1. Concatenate all POST values (excluding Signature) with dash "-"
 * 2. Base64 encode the concatenated string
 * 3. Sign with RSA private key using SHA256
 * 4. Base64 encode the signature
 */
function generateSignature(params: Record<string, string>, privateKey: string): string {
  // Concatenate values with dash separator (order matters!)
  const concatenated = Object.values(params).join('-');
  
  // Base64 encode the concatenated string
  const base64Data = Buffer.from(concatenated).toString('base64');
  
  // Sign with SHA256 + RSA
  const sign = crypto.createSign('SHA256');
  sign.update(base64Data);
  sign.end();
  
  const signature = sign.sign(privateKey, 'base64');
  return signature;
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json') && !isValidOrigin(request)) {
      return new Response('Invalid origin', { status: 403 });
    }

    let items: { name: string; price: number; quantity: number; image?: string; productId?: string }[];
    let locale = 'fr';
    let shipping = null;

    if (contentType.includes('application/json')) {
      const json = await request.json();
      items = json.items;
      locale = json.locale || 'fr';
      shipping = json.shipping || null;
    } else {
      const formData = await request.formData();
      const data = JSON.parse(formData.get('data') as string);
      items = data.items;
      locale = data.locale || 'fr';
      shipping = data.shipping || null;
    }

    if (!items || !items.length) return new Response('No items', { status: 400 });
    if (items.length > 50) return new Response('Too many items', { status: 400 });

    for (const item of items) {
      if (typeof item.price !== 'number' || item.price <= 0 || item.price > 10000) {
        return new Response('Invalid price', { status: 400 });
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0 || item.quantity > 100) {
        return new Response('Invalid quantity', { status: 400 });
      }
      item.name = item.name.replace(/<[^>]*>/g, '').substring(0, 100);
    }

    const orderId = `MAL-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Save order to database BEFORE payment
    if (shipping && shipping.email) {
      try {
        await createOrder({ orderId, items, shipping, locale, totalAmount });
        console.log('Order saved to DB:', orderId);
      } catch (dbError) {
        console.error('DB save error (continuing to payment):', dbError);
      }
    }

    const privateKey = getPrivateKey();
    const SID = getRequiredEnv('MYPOS_SID');
    const WALLET = getRequiredEnv('MYPOS_WALLET');
    const KEY_INDEX = getRequiredEnv('MYPOS_KEY_INDEX');
    const isLive = process.env.MYPOS_LIVE === 'true';

    const ipcUrl = isLive
      ? 'https://mypos.eu/vmp/checkout/'
      : 'https://mypos.eu/vmp/checkout-test/';

    // Build cart items string for myPOS
    // Format: Article-Quantity-Price for each item, with separator
    const cartItems: string[] = [];
    let cartArticleCount = items.length;

    // Build ordered params for signature (order is CRITICAL)
    const params: Record<string, string> = {
      'IPCmethod': 'IPCPurchase',
      'IPCVersion': '1.4',
      'IPCLanguage': 'fr',
      'SID': SID,
      'walletnumber': WALLET,
      'KeyIndex': KEY_INDEX,
      'Source': 'AUTO',
      'Currency': 'EUR',
      'Amount': totalAmount.toFixed(2),
      'OrderID': orderId,
      'URL_OK': `https://maloune.fr/${locale}/checkout/success?order=${orderId}`,
      'URL_Cancel': `https://maloune.fr/${locale}/cart`,
      'URL_Notify': 'https://maloune.fr/api/mypos/webhook',
      'Note': '',
      'CartCreateInvoice': '0',
      'InvoiceInfo_buyerName': '',
      'InvoiceInfo_buyerEmail': '',
      'InvoiceInfo_buyerPhone': '',
      'InvoiceInfo_buyerAddress': '',
      'CardTokenRequest': '0',
      'PaymentParametersRequired': '3',
      'PaymentMethod': '1',
      'CartItemsCount': String(cartArticleCount),
    };

    // Add cart items to params
    for (let i = 0; i < items.length; i++) {
      const idx = i + 1;
      params[`CartItem_${idx}_Name`] = items[i].name.substring(0, 100);
      params[`CartItem_${idx}_Quantity`] = String(items[i].quantity);
      params[`CartItem_${idx}_Price`] = items[i].price.toFixed(2);
    }

    // Generate signature
    const signature = generateSignature(params, privateKey);

    // Build HTML form
    const formFields = Object.entries(params)
      .map(([k, v]) => `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(v)}" />`)
      .join('\n');

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Redirection vers le paiement...</title></head>
<body>
<p>Redirection vers le paiement sécurisé...</p>
<form id="mypos_form" method="POST" action="${ipcUrl}">
${formFields}
<input type="hidden" name="Signature" value="${escapeHtml(signature)}" />
<noscript><button type="submit">Continuer vers le paiement</button></noscript>
</form>
<script>document.getElementById('mypos_form').submit();</script>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('Checkout error:', msg);
    return new Response('Payment processing error. Please try again.', { status: 500 });
  }
}
