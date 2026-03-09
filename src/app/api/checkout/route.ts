import { NextRequest } from 'next/server';
import { createOrder } from '@/lib/services/order.service';

function getPrivateKey(): string {
  const b64Key = process.env.MYPOS_PRIVATE_KEY_B64;
  if (b64Key) return Buffer.from(b64Key, 'base64').toString('utf-8');
  let pk = process.env.MYPOS_PRIVATE_KEY || '';
  return pk.replace(/\\n/g, '\n');
}

function getPublicCert(): string {
  const b64Key = process.env.MYPOS_PUBLIC_CERT_B64;
  if (b64Key) return Buffer.from(b64Key, 'base64').toString('utf-8');
  return '';
}

export async function POST(request: NextRequest) {
  try {
    let items: { name: string; price: number; quantity: number; productId?: string; variantId?: string; image?: string }[];
    let locale = 'fr';
    let shipping: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      zip?: string;
      country?: string;
    } = {};
    
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await request.json();
      items = json.items;
      locale = json.locale || 'fr';
      shipping = json.shipping || {};
    } else {
      const formData = await request.formData();
      const data = JSON.parse(formData.get('data') as string);
      items = data.items;
      locale = data.locale || 'fr';
      shipping = data.shipping || {};
    }

    if (!items || !items.length) return new Response('No items', { status: 400 });

    const orderId = `MAL-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const privateKey = getPrivateKey();
    const publicCert = getPublicCert();
    const isLive = process.env.MYPOS_LIVE === 'true';
    const totalAmount = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    // Save order to DB BEFORE redirecting to myPOS
    try {
      await createOrder({
        orderId,
        items: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          productId: item.productId || undefined,
          variantId: item.variantId || undefined,
          image: item.image || undefined,
        })),
        shipping: {
          firstName: shipping.firstName || 'Client',
          lastName: shipping.lastName || '',
          email: shipping.email || '',
          phone: shipping.phone || '',
          address: shipping.address || '',
          city: shipping.city || '',
          zip: shipping.zip || '',
          country: shipping.country || 'FR',
        },
        locale,
        totalAmount,
        currency: 'EUR',
      });
      console.log('Order saved:', orderId, 'amount:', totalAmount, 'email:', shipping.email);
    } catch (dbErr) {
      console.error('DB save failed (continuing to payment):', dbErr);
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const MyPOS = require('mypos-js');
    
    const mypos = new MyPOS(true, {
      keyIndex: parseInt(process.env.MYPOS_KEY_INDEX || '1'),
      sid: process.env.MYPOS_SID || '1306645',
      wallet: parseInt(process.env.MYPOS_WALLET || '40016394476'),
      lang: 'fr',
      privateKey: privateKey,
      APIPublicKey: publicCert,
      encryptPublicKey: publicCert,
      ipcApiUrl: isLive 
        ? 'https://www.mypos.eu/vmp/checkout' 
        : 'https://www.mypos.eu/vmp/checkout-test',
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
      cart.addItem(item.name.substring(0, 100), item.quantity || 1, Number(item.price.toFixed(2)));
    }

    const html = await mypos.Purchase(null, cart, {
      orderId: orderId,
      currency: 'EUR',
      note: '',
    });

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('Checkout error:', msg);
    return new Response(`Error: ${msg}`, { status: 500 });
  }
}
