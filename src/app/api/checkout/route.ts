import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createOrder } from '@/lib/services/order.service';

function getPrivateKey(): string {
  const b64 = process.env.MYPOS_PRIVATE_KEY_B64;
  if (!b64) throw new Error('MYPOS_PRIVATE_KEY_B64 not set');
  return Buffer.from(b64, 'base64').toString('utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const items = JSON.parse(formData.get('items') as string || '[]');
    const shipping = {
      firstName: formData.get('firstName') as string || '',
      lastName: formData.get('lastName') as string || '',
      email: formData.get('email') as string || '',
      phone: formData.get('phone') as string || '',
      address: formData.get('address') as string || '',
      city: formData.get('city') as string || '',
      zip: formData.get('zip') as string || '',
      country: formData.get('country') as string || 'FR',
    };

    const totalAmount = items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    ).toFixed(2);

    let orderNumber = 'MAL-' + Date.now();
    try {
      const order = await createOrder({
        items, shipping,
        totalAmount: parseFloat(totalAmount),
        currency: 'EUR',
      });
      orderNumber = order.orderNumber;
    } catch (e) {
      console.error('Order save error (continuing):', e);
    }

    const privateKey = getPrivateKey();
    const sid = process.env.MYPOS_SID || '';
    const wallet = process.env.MYPOS_WALLET || '';
    const keyIndex = process.env.MYPOS_KEY_INDEX || '1';
    const isLive = process.env.MYPOS_LIVE === 'true';
    
    const checkoutUrl = isLive 
      ? 'https://www.mypos.eu/vmp/checkout' 
      : 'https://www.mypos.eu/vmp/checkout-test';

    const urlOk = `https://maloune.fr/fr/checkout/success?order=${orderNumber}`;
    const urlCancel = 'https://maloune.fr/fr/cart';
    const urlNotify = 'https://maloune.fr/api/mypos/webhook';
    const note = `Commande ${orderNumber}`;
    const source = 'SDK_NODE_1.0';

    // Build ordered form params - EXACT order from myPOS PHP SDK
    // This order determines signature calculation
    const orderedParams: [string, string][] = [];
    
    orderedParams.push(['IPCmethod', 'IPCPurchase']);
    orderedParams.push(['IPCVersion', '1.4']);
    orderedParams.push(['IPCLanguage', 'fr']);
    orderedParams.push(['SID', sid]);
    orderedParams.push(['walletnumber', wallet]);
    orderedParams.push(['Amount', totalAmount]);
    orderedParams.push(['Currency', 'EUR']);
    orderedParams.push(['OrderID', orderNumber]);
    orderedParams.push(['URL_OK', urlOk]);
    orderedParams.push(['URL_Cancel', urlCancel]);
    orderedParams.push(['URL_Notify', urlNotify]);
    orderedParams.push(['Note', note]);
    
    // Cart items
    orderedParams.push(['CartItems', items.length.toString()]);
    items.forEach((item: any, i: number) => {
      const n = i + 1;
      const price = parseFloat(item.price).toFixed(2);
      const qty = (item.quantity || 1).toString();
      const itemAmount = (parseFloat(item.price) * (item.quantity || 1)).toFixed(2);
      orderedParams.push([`Article_${n}`, item.name || `Product ${n}`]);
      orderedParams.push([`Quantity_${n}`, qty]);
      orderedParams.push([`Price_${n}`, price]);
      orderedParams.push([`Currency_${n}`, 'EUR']);
      orderedParams.push([`Amount_${n}`, itemAmount]);
    });
    
    orderedParams.push(['CardTokenRequest', '0']);
    orderedParams.push(['PaymentParametersRequired', '3']);
    orderedParams.push(['PaymentMethod', '1']);
    orderedParams.push(['KeyIndex', keyIndex]);
    orderedParams.push(['Source', source]);

    // Generate signature per myPOS docs:
    // 1. Concatenate all VALUES with "-"
    // 2. Base64 encode the concatenated string
    // 3. Sign with SHA256+RSA private key
    // 4. Base64 encode the signature
    const values = orderedParams.map(([, v]) => v);
    const concatenated = values.join('-');
    const toSign = Buffer.from(concatenated).toString('base64');
    
    const sign = crypto.createSign('SHA256');
    sign.update(toSign);
    sign.end();
    const signature = sign.sign(privateKey, 'base64');

    // Add signature to form
    orderedParams.push(['Signature', signature]);

    // Build auto-submit HTML form
    const hiddenInputs = orderedParams
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value.replace(/"/g, '&quot;')}" />`)
      .join('\n');

    const html = `<!DOCTYPE html>
<html>
<head><title>Redirection vers myPOS...</title></head>
<body>
  <p>Redirection vers la page de paiement...</p>
  <form id="mypos-form" method="POST" action="${checkoutUrl}">
    ${hiddenInputs}
  </form>
  <script>document.getElementById('mypos-form').submit();</script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error: any) {
    console.error('Payment processing error:', error.message);
    return NextResponse.json(
      { error: 'Payment processing failed', details: error.message },
      { status: 500 }
    );
  }
}
