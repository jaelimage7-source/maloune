import { NextRequest } from 'next/server';

function getPrivateKey(): string {
  const b64Key = process.env.MYPOS_PRIVATE_KEY_B64;
  if (b64Key) {
    return Buffer.from(b64Key, 'base64').toString('utf-8');
  }
  let pk = process.env.MYPOS_PRIVATE_KEY || '';
  pk = pk.replace(/\\n/g, '\n');
  return pk;
}

export async function POST(request: NextRequest) {
  try {
    let items: { name: string; price: number; quantity: number }[];
    let locale = 'fr';
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const json = await request.json();
      items = json.items;
      locale = json.locale || 'fr';
    } else {
      const formData = await request.formData();
      const data = JSON.parse(formData.get('data') as string);
      items = data.items;
      locale = data.locale || 'fr';
    }

    if (!items || !items.length) {
      return new Response('No items', { status: 400 });
    }

    const orderId = `MAL-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const privateKey = getPrivateKey();
    const isSandbox = process.env.MYPOS_LIVE !== 'true';

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const MyPOS = require('mypos-js');
    
    const mypos = new MyPOS(!isSandbox, {
      keyIndex: parseInt(process.env.MYPOS_KEY_INDEX || '1'),
      sid: process.env.MYPOS_SID || '1306645',
      wallet: parseInt(process.env.MYPOS_WALLET || '40016394476'),
      lang: 'fr',
      privateKey: privateKey,
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
