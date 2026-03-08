import { NextRequest } from 'next/server';
import { createOrder } from '@/lib/services/order.service';

function getPrivateKey(): string {
  const b64Key = process.env.MYPOS_PRIVATE_KEY_B64;
  if (b64Key) return Buffer.from(b64Key, 'base64').toString('utf-8');
  const pk = process.env.MYPOS_PRIVATE_KEY || '';
  if (!pk) throw new Error('MYPOS_PRIVATE_KEY not configured');
  return pk.replace(/\\n/g, '\n');
}

function getPublicCert(): string {
  const b64Key = process.env.MYPOS_PUBLIC_CERT_B64;
  if (b64Key) return Buffer.from(b64Key, 'base64').toString('utf-8');
  throw new Error('MYPOS_PUBLIC_CERT_B64 not configured');
}

function getRequiredEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`${name} not configured`);
  return val;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin') || '';
  const referer = request.headers.get('referer') || '';
  const allowed = ['https://maloune.fr', 'https://www.maloune.fr'];
  return allowed.some(a => origin.startsWith(a) || referer.startsWith(a));
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
        await createOrder({
          orderId,
          items,
          shipping,
          locale,
          totalAmount,
        });
        console.log('Order saved to DB:', orderId);
      } catch (dbError) {
        console.error('DB save error (continuing to payment):', dbError);
      }
    }

    const privateKey = getPrivateKey();
    const publicCert = getPublicCert();
    const SID = getRequiredEnv('MYPOS_SID');
    const WALLET = getRequiredEnv('MYPOS_WALLET');
    const isLive = process.env.MYPOS_LIVE === 'true';

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const MyPOS = require('mypos-js');

    const mypos = new MyPOS(true, {
      keyIndex: parseInt(process.env.MYPOS_KEY_INDEX || '1'),
      sid: SID,
      wallet: parseInt(WALLET),
      lang: 'fr',
      privateKey: privateKey,
      APIPublicKey: publicCert,
      encryptPublicKey: publicCert,
    }, {
      cancelUrl: `https://maloune.fr/${locale}/cart`,
      notifyUrl: `https://maloune.fr/api/mypos/webhook`,
      okUrl: `https://maloune.fr/${locale}/checkout/success?order=${orderId}`,
    }, {
      paymentParametersRequired: 3,
      paymentMethod: 1,
      cardTokenRequest: 0,
    });

    const cart = new mypos.Cart();
    for (const item of items) {
      cart.addItem(escapeHtml(item.name), item.quantity || 1, Number(item.price.toFixed(2)));
    }

    let html = await mypos.Purchase(null, cart, {
      orderId: orderId,
      currency: 'EUR',
      note: '',
    });

    if (!isLive) {
      html = html.replaceAll('mypos.eu/vmp/checkout', 'mypos.eu/vmp/checkout-test');
    }

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
