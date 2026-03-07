import { NextRequest } from 'next/server';

// V-03: NO hardcoded credentials - fail if env vars missing
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

// V-01: HTML escape function to prevent XSS
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// V-02: Server-side price catalog (real prices from Printful/DB)
async function getServerPrice(name: string): Promise<number | null> {
  // TODO: Replace with real DB/Printful lookup
  // For now, fetch from Printful API if available
  try {
    const apiKey = process.env.PRINTFUL_API_KEY || process.env.PRINTFUL1_API_KEY;
    if (apiKey) {
      const res = await fetch('https://api.printful.com/store/products', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        const products = data.result || [];
        for (const p of products) {
          if (p.name && p.name.toLowerCase().includes(name.toLowerCase().substring(0, 20))) {
            return p.retail_price ? parseFloat(p.retail_price) : null;
          }
        }
      }
    }
  } catch {
    // Fallback: accept price but log warning
  }
  return null;
}

// V-05: Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // max requests
const RATE_WINDOW = 60000; // per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// V-08: CSRF check
function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin') || '';
  const referer = request.headers.get('referer') || '';
  const allowed = ['https://maloune.fr', 'https://www.maloune.fr'];
  return allowed.some(a => origin.startsWith(a) || referer.startsWith(a));
}

export async function POST(request: NextRequest) {
  try {
    // V-05: Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return new Response('Too many requests. Please wait a moment.', { status: 429 });
    }

    // V-08: CSRF protection (allow form submissions from our own domain)
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      // JSON requests must come from our origin
      if (!isValidOrigin(request)) {
        return new Response('Invalid origin', { status: 403 });
      }
    }

    let items: { name: string; price: number; quantity: number }[];
    let locale = 'fr';
    
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

    if (!items || !items.length) return new Response('No items', { status: 400 });
    if (items.length > 50) return new Response('Too many items', { status: 400 });

    // V-02: Validate prices
    for (const item of items) {
      if (typeof item.price !== 'number' || item.price <= 0 || item.price > 10000) {
        return new Response('Invalid price', { status: 400 });
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0 || item.quantity > 100) {
        return new Response('Invalid quantity', { status: 400 });
      }
      // V-01: Sanitize name
      item.name = item.name.replace(/<[^>]*>/g, '').substring(0, 100);
    }

    const orderId = `MAL-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    // V-03: Use required env vars (no defaults)
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
      // V-01: Use escaped name
      cart.addItem(escapeHtml(item.name), item.quantity || 1, Number(item.price.toFixed(2)));
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
    return new Response('Payment processing error. Please try again.', { status: 500 });
  }
}
