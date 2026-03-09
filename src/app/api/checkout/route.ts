import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createOrder } from '@/lib/services/order.service';

function getPrivateKey(): string {
  const b64 = process.env.MYPOS_PRIVATE_KEY_B64;
  if (!b64) throw new Error('MYPOS_PRIVATE_KEY_B64 not set');
  return Buffer.from(b64, 'base64').toString('utf-8');
}

function generateSignature(data: string[], privateKeyPem: string): string {
  // Per myPOS docs v1.4: concatenate values with "-", base64 encode, then sign with SHA256+RSA
  const concatenated = data.join('-');
  const toSign = Buffer.from(concatenated).toString('base64');
  const sign = crypto.createSign('SHA256');
  sign.update(toSign);
  sign.end();
  return sign.sign(privateKeyPem, 'base64');
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

    // Save order to DB
    let orderNumber = 'MAL-' + Date.now();
    try {
      const order = await createOrder({
        items,
        shipping,
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

    // Build cart HTML for myPOS
    const cartItems = items.map((item: any, i: number) => ({
      name: item.name || `Product ${i + 1}`,
      quantity: item.quantity || 1,
      price: parseFloat(item.price).toFixed(2),
    }));

    // myPOS required fields in EXACT order for signature
    const amount = totalAmount;
    const currency = 'EUR';
    const orderId = orderNumber;
    const urlOk = `https://maloune.fr/fr/checkout/success?order=${orderNumber}`;
    const urlCancel = 'https://maloune.fr/fr/cart';
    const urlNotify = 'https://maloune.fr/api/mypos/webhook';
    const cartItemsCount = cartItems.length.toString();
    const note = `Commande ${orderNumber}`;
    const cardTokenRequest = '0';
    const paymentParametersRequired = '3';
    const paymentMethod = '1';

    // Build cart article fields
    const articleFields: Record<string, string> = {};
    cartItems.forEach((item: any, i: number) => {
      const n = i + 1;
      articleFields[`Article_${n}`] = item.name;
      articleFields[`Quantity_${n}`] = item.quantity.toString();
      articleFields[`Price_${n}`] = item.price;
      articleFields[`Currency_${n}`] = currency;
    });

    // Signature data array - MUST match exact order per myPOS API v1.4 docs
    const signatureData = [
      sid,           // IPCmethod implicit - SID
      wallet,        // Wallet number  
      keyIndex,      // KeyIndex
      amount,        // Amount
      currency,      // Currency
      orderId,       // OrderID
      urlNotify,     // URL_Notify
      urlOk,         // URL_OK
      urlCancel,     // URL_Cancel
      note,          // Note
      cardTokenRequest,        // CardTokenRequest
      paymentParametersRequired, // PaymentParametersRequired
      paymentMethod, // PaymentMethod
    ];

    // Add cart items to signature
    cartItems.forEach((item: any) => {
      signatureData.push(item.name);
      signatureData.push(item.quantity.toString());
      signatureData.push(item.price);
      signatureData.push(currency);
    });

    const signature = generateSignature(signatureData, privateKey);

    // Build auto-submit HTML form
    const formFields: Record<string, string> = {
      'Signature': signature,
      'IPCmethod': 'IPCPurchase',
      'IPCVersion': '1.4',
      'IPCLanguage': 'fr',
      'SID': sid,
      'walletnumber': wallet,
      'KeyIndex': keyIndex,
      'Source': 'SDK_NODE_1.0',
      'Amount': amount,
      'Currency': currency,
      'OrderID': orderId,
      'URL_OK': urlOk,
      'URL_Cancel': urlCancel,
      'URL_Notify': urlNotify,
      'Note': note,
      'CardTokenRequest': cardTokenRequest,
      'PaymentParametersRequired': paymentParametersRequired,
      'PaymentMethod': paymentMethod,
      'CartItems': cartItemsCount,
      ...articleFields,
    };

    const hiddenInputs = Object.entries(formFields)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value.replace(/"/g, '&quot;')}" />`)
      .join('\n');

    const html = `
<!DOCTYPE html>
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
