import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createOrder } from '@/lib/services/order.service';

/**
 * myPOS Checkout — IPCPurchase
 * 
 * Signature algorithm (from official docs):
 * 1. Concatenate all POST values (NOT keys) with dash "-" separator
 *    (in the EXACT order they appear in the form, excluding Signature)
 * 2. Base64 encode the concatenated string
 * 3. Sign with RSA-SHA256 using merchant private key
 * 4. Base64 encode the signature
 * 
 * Field order per official IPCPurchase documentation:
 * IPCmethod, IPCVersion, IPCLanguage, SID, walletnumber, Amount, Currency,
 * OrderID, URL_OK, URL_Cancel, URL_Notify, CardTokenRequest, KeyIndex,
 * PaymentParametersRequired, PaymentMethod, customeremail, customerfirstnames,
 * customerfamilyname, customerphone, customercountry, customercity,
 * customerzipcode, customeraddress, Note, Source, CartItems,
 * [Article_N, Quantity_N, Price_N, Currency_N, Amount_N]..., delivery
 */

function getPrivateKey(): string {
  const b64Key = process.env.MYPOS_PRIVATE_KEY_B64;
  if (b64Key) return Buffer.from(b64Key, 'base64').toString('utf-8');
  const pk = process.env.MYPOS_PRIVATE_KEY || '';
  if (!pk) throw new Error('MYPOS_PRIVATE_KEY not configured');
  return pk.replace(/\\n/g, '\n');
}

function generateSignature(values: string[], privateKey: string): string {
  // Step 1: Join all values with dash
  const concatenated = values.join("-");
  // Step 2: Base64 encode the concatenated string
  const base64Data = Buffer.from(concatenated).toString("base64");
  // Step 3: Sign the base64 string with SHA256
  const sign = crypto.createSign("SHA256");
  sign.update(base64Data);
  sign.end();
  // Step 4: Return base64 encoded signature
  return sign.sign(privateKey, "base64");
}

export async function POST(request: NextRequest) {
  try {
    let items: { name: string; price: number; quantity: number; productId?: string; variantId?: string; image?: string }[];
    let locale = 'fr';
    let shipping: { firstName?: string; lastName?: string; email?: string; phone?: string; address?: string; city?: string; zip?: string; country?: string } = {};

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

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'No items' }), { status: 400 });
    }

    const privateKey = getPrivateKey();
    const sid = process.env.MYPOS_SID || '1306645';
    const wallet = process.env.MYPOS_WALLET || '40016394476';
    const keyIndex = process.env.MYPOS_KEY_INDEX || '1';
    const isLive = process.env.MYPOS_LIVE === 'true';
    const checkoutUrl = isLive
      ? 'https://www.mypos.com/vmp/checkout'
      : 'https://www.mypos.eu/vmp/checkout-test';

    const baseUrl = 'https://maloune.fr';
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderNumber = `MAL-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Save order to DB before redirect
    try {
      await createOrder({
        orderId: orderNumber,
        items: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          productId: item.productId || undefined,
          variantId: item.variantId || undefined,
          image: item.image || undefined,
        })),
        totalAmount: total,
        currency: 'EUR',
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
      });
    } catch (dbErr) {
      console.error('Order save error (continuing):', dbErr);
    }

    // Customer info
    const customerEmail = shipping.email || '';
    const customerFirstNames = shipping.firstName || '';
    const customerFamilyName = shipping.lastName || '';
    const customerPhone = shipping.phone || '';
    const customerCountry = (shipping.country || 'FRA').substring(0, 3).toUpperCase();
    const customerCity = shipping.city || '';
    const customerZipCode = shipping.zip || '';
    const customerAddress = shipping.address || '';

    // Build ordered field values for signature
    // EXACT order from official docs IPCPurchase example
    const signatureValues: string[] = [
      'IPCPurchase',           // IPCmethod
      '1.4',                   // IPCVersion
      locale === 'fr' ? 'FR' : 'EN',  // IPCLanguage
      sid,                     // SID
      wallet,                  // walletnumber
      total.toFixed(2),        // Amount
      'EUR',                   // Currency
      orderNumber,             // OrderID
      `${baseUrl}/${locale}/checkout/success?order=${orderNumber}`,  // URL_OK
      `${baseUrl}/${locale}/checkout?cancelled=1`,                   // URL_Cancel
      `${baseUrl}/api/mypos/webhook`,                                // URL_Notify
      '0',                     // CardTokenRequest
      keyIndex,                // KeyIndex
      '3',                     // PaymentParametersRequired
      '2',                     // PaymentMethod (2 = all methods)
      customerEmail,           // customeremail
      customerFirstNames,      // customerfirstnames
      customerFamilyName,      // customerfamilyname
      customerPhone,           // customerphone
      customerCountry,         // customercountry
      customerCity,            // customercity
      customerZipCode,         // customerzipcode
      customerAddress,         // customeraddress
      '',                      // Note (empty)
      '',                      // Source (empty)
      String(items.length),    // CartItems
    ];

    // Add cart items in order: Article_N, Quantity_N, Price_N, Currency_N, Amount_N
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemTotal = (item.price * item.quantity).toFixed(2);
      signatureValues.push(item.name);                      // Article_N
      signatureValues.push(String(item.quantity));           // Quantity_N
      signatureValues.push(item.price.toFixed(2));           // Price_N
      signatureValues.push('EUR');                           // Currency_N
      signatureValues.push(itemTotal);                       // Amount_N
    }

    // Add delivery field
    signatureValues.push('4');

    // Generate signature
    const signature = generateSignature(signatureValues, privateKey);

    // Build HTML form with fields in EXACT same order
    const formFields: [string, string][] = [
      ['IPCmethod', 'IPCPurchase'],
      ['IPCVersion', '1.4'],
      ['IPCLanguage', locale === 'fr' ? 'FR' : 'EN'],
      ['SID', sid],
      ['walletnumber', wallet],
      ['Amount', total.toFixed(2)],
      ['Currency', 'EUR'],
      ['OrderID', orderNumber],
      ['URL_OK', `${baseUrl}/${locale}/checkout/success?order=${orderNumber}`],
      ['URL_Cancel', `${baseUrl}/${locale}/checkout?cancelled=1`],
      ['URL_Notify', `${baseUrl}/api/mypos/webhook`],
      ['CardTokenRequest', '0'],
      ['KeyIndex', keyIndex],
      ['PaymentParametersRequired', '3'],
      ['PaymentMethod', '2'],
      ['customeremail', customerEmail],
      ['customerfirstnames', customerFirstNames],
      ['customerfamilyname', customerFamilyName],
      ['customerphone', customerPhone],
      ['customercountry', customerCountry],
      ['customercity', customerCity],
      ['customerzipcode', customerZipCode],
      ['customeraddress', customerAddress],
      ['Note', ''],
      ['Source', ''],
      ['CartItems', String(items.length)],
    ];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const n = i + 1;
      const itemTotal = (item.price * item.quantity).toFixed(2);
      formFields.push([`Article_${n}`, item.name]);
      formFields.push([`Quantity_${n}`, String(item.quantity)]);
      formFields.push([`Price_${n}`, item.price.toFixed(2)]);
      formFields.push([`Currency_${n}`, 'EUR']);
      formFields.push([`Amount_${n}`, itemTotal]);
    }

    formFields.push(['delivery', '4']);
    formFields.push(['Signature', signature]);

    // Build auto-submit HTML form
    const hiddenInputs = formFields
      .map(([name, value]) => `<input type="hidden" name="${name}" value="${escapeHtml(value)}" />`)
      .join('\n      ');

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Redirection vers le paiement...</title></head>
<body>
  <p style="text-align:center;margin-top:100px;font-family:sans-serif;">Redirection vers le paiement sécurisé...</p>
  <form id="mypos-form" method="POST" action="${checkoutUrl}">
      ${hiddenInputs}
  </form>
  <script>document.getElementById('mypos-form').submit();</script>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });

  } catch (error: unknown) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
