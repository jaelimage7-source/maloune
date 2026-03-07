import { NextRequest } from 'next/server';
import crypto from 'crypto';

function getPrivateKey(): string {
  const b64Key = process.env.MYPOS_PRIVATE_KEY_B64;
  if (b64Key) {
    return Buffer.from(b64Key, 'base64').toString('utf-8');
  }
  let pk = process.env.MYPOS_PRIVATE_KEY || '';
  pk = pk.replace(/\\n/g, '\n');
  return pk;
}

// Exact same signing as official myPOS JS SDK (Helper.js createSignature)
function createSignature(postData: Record<string, string>): string {
  // Clean key exactly like SDK does
  const key = getPrivateKey().trim().split('\n').map(x => x.trim()).join('\n');

  // Decode URI components like SDK does
  const values = Object.values(postData).map(v => decodeURIComponent(String(v)));
  
  // Join with dash
  const payload = values.join('-');
  
  // Base64 encode
  const concData = Buffer.from(payload).toString('base64');
  
  // Sign with SHA256
  const sign = crypto.createSign('SHA256');
  sign.write(concData);
  sign.end();
  
  return sign.sign(key, 'base64');
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

    const SID = process.env.MYPOS_SID || '1306645';
    const WALLET = process.env.MYPOS_WALLET || '40016394476';
    const KEY_INDEX = process.env.MYPOS_KEY_INDEX || '1';
    const isSandbox = process.env.MYPOS_LIVE !== 'true';
    const API_URL = isSandbox 
      ? 'https://www.mypos.com/vmp/checkout-test' 
      : 'https://www.mypos.com/vmp/checkout';

    const orderId = `MAL-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const cartItems = items.map((item) => ({
      name: item.name.substring(0, 100),
      quantity: item.quantity || 1,
      price: item.price,
    }));

    const totalAmount = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

    // Build POST data - match PHP example order EXACTLY
    const postData: Record<string, string> = {};
    postData['IPCmethod'] = 'IPCPurchase';
    postData['IPCVersion'] = '1.4';
    postData['IPCLanguage'] = 'fr';
    postData['SID'] = SID;
    postData['WalletNumber'] = WALLET;
    postData['Amount'] = totalAmount.toFixed(2);
    postData['Currency'] = 'EUR';
    postData['OrderID'] = orderId;
    postData['URL_OK'] = `https://maloune.fr/${locale}/checkout/success?order=${orderId}`;
    postData['URL_Cancel'] = `https://maloune.fr/${locale}/cart`;
    postData['URL_Notify'] = `https://maloune.fr/api/mypos/webhook`;
    postData['CardTokenRequest'] = '0';
    postData['KeyIndex'] = KEY_INDEX;
    postData['PaymentParametersRequired'] = '3';
    postData['PaymentMethod'] = '1';
    postData['Note'] = '';
    postData['Source'] = 'MALOUNE';
    postData['CartItems'] = String(cartItems.length);

    cartItems.forEach((item, index) => {
      const idx = index + 1;
      postData[`Article_${idx}`] = item.name;
      postData[`Quantity_${idx}`] = String(item.quantity);
      postData[`Price_${idx}`] = item.price.toFixed(2);
      postData[`Currency_${idx}`] = 'EUR';
      postData[`Amount_${idx}`] = (item.price * item.quantity).toFixed(2);
    });

    // Sign (signature must be added LAST)
    postData['Signature'] = createSignature(postData);

    // Return auto-submitting HTML form
    const formFields = Object.entries(postData)
      .map(([k, v]) => `<input type="hidden" name="${k}" value="${v.replace(/"/g, '&quot;')}">`)
      .join('\n');

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Redirection...</title>
<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f5;}
.loader{text-align:center;}.spinner{width:40px;height:40px;border:4px solid #ddd;border-top:4px solid #333;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;}
@keyframes spin{to{transform:rotate(360deg)}}</style></head>
<body><div class="loader"><div class="spinner"></div><p>Redirection vers la page de paiement...</p></div>
<form id="f" method="POST" action="${API_URL}">
${formFields}
<noscript><button type="submit">Continuer</button></noscript>
</form>
<script>document.getElementById('f').submit();</script>
</body></html>`;

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
