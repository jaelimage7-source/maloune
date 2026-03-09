import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const results: Record<string, any> = {};

  // 1. Check env vars
  results.env = {
    MYPOS_SID: process.env.MYPOS_SID ? 'SET (' + process.env.MYPOS_SID + ')' : 'MISSING',
    MYPOS_WALLET: process.env.MYPOS_WALLET ? 'SET (' + process.env.MYPOS_WALLET + ')' : 'MISSING',
    MYPOS_KEY_INDEX: process.env.MYPOS_KEY_INDEX ? 'SET (' + process.env.MYPOS_KEY_INDEX + ')' : 'MISSING',
    MYPOS_LIVE: process.env.MYPOS_LIVE || 'NOT SET (defaults to false)',
    MYPOS_PRIVATE_KEY_B64: process.env.MYPOS_PRIVATE_KEY_B64 ? 'SET (' + process.env.MYPOS_PRIVATE_KEY_B64.substring(0, 30) + '...)' : 'MISSING',
    MYPOS_PUBLIC_CERT_B64: process.env.MYPOS_PUBLIC_CERT_B64 ? 'SET (' + process.env.MYPOS_PUBLIC_CERT_B64.substring(0, 30) + '...)' : 'MISSING',
  };

  // 2. Try to decode and parse private key
  try {
    const b64 = process.env.MYPOS_PRIVATE_KEY_B64 || '';
    const pem = Buffer.from(b64, 'base64').toString('utf-8');
    results.privateKey = {
      decoded: pem.substring(0, 40) + '...',
      startsWithHeader: pem.startsWith('-----BEGIN RSA PRIVATE KEY-----'),
      endsWithFooter: pem.trim().endsWith('-----END RSA PRIVATE KEY-----'),
      length: pem.length,
      lineCount: pem.split('\n').length,
    };

    // Try to create a signer with it
    try {
      const testData = 'test-data';
      const sign = crypto.createSign('SHA256');
      sign.update(Buffer.from(testData).toString('base64'));
      sign.end();
      const sig = sign.sign(pem, 'base64');
      results.privateKey.canSign = true;
      results.privateKey.testSignature = sig.substring(0, 40) + '...';
    } catch (signErr: unknown) {
      results.privateKey.canSign = false;
      results.privateKey.signError = signErr instanceof Error ? signErr.message : String(signErr);
    }
  } catch (err: unknown) {
    results.privateKey = { error: err instanceof Error ? err.message : String(err) };
  }

  // 3. Try to decode public cert
  try {
    const b64 = process.env.MYPOS_PUBLIC_CERT_B64 || '';
    const pem = Buffer.from(b64, 'base64').toString('utf-8');
    results.publicCert = {
      decoded: pem.substring(0, 40) + '...',
      startsWithHeader: pem.startsWith('-----BEGIN CERTIFICATE-----'),
      length: pem.length,
    };
  } catch (err: unknown) {
    results.publicCert = { error: err instanceof Error ? err.message : String(err) };
  }

  // 4. Test SDK initialization
  try {
    const privateKey = Buffer.from(process.env.MYPOS_PRIVATE_KEY_B64 || '', 'base64').toString('utf-8');
    const publicCert = Buffer.from(process.env.MYPOS_PUBLIC_CERT_B64 || '', 'base64').toString('utf-8');

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const MyPOS = require('mypos-js');

    const mypos = new MyPOS(true, {
      keyIndex: parseInt(process.env.MYPOS_KEY_INDEX || '1'),
      sid: process.env.MYPOS_SID,
      wallet: parseInt(process.env.MYPOS_WALLET || '0'),
      lang: 'fr',
      privateKey: privateKey,
      APIPublicKey: publicCert,
      encryptPublicKey: publicCert,
    }, {
      cancelUrl: 'https://maloune.fr/fr/cart',
      notifyUrl: 'https://maloune.fr/api/mypos/webhook',
      okUrl: 'https://maloune.fr/fr/checkout/success',
    }, {
      paymentParametersRequired: 3,
      paymentMethod: 1,
      cardTokenRequest: 0,
    });

    results.sdk = { initialized: true };

    // Try a test purchase
    try {
      const cart = new mypos.Cart();
      cart.addItem('Test', 1, 1.00);

      const html = await mypos.Purchase(null, cart, {
        orderId: 'TEST-' + Date.now(),
        currency: 'EUR',
        note: '',
      });

      results.sdk.purchaseHtmlLength = html.length;
      results.sdk.purchaseSuccess = html.length > 100;
      
      // Extract signature from HTML
      const sigMatch = html.match(/name="Signature"\s+value="([^"]+)"/);
      if (sigMatch) {
        results.sdk.signatureFound = true;
        results.sdk.signaturePreview = sigMatch[1].substring(0, 40) + '...';
      }

      // Extract form action URL
      const actionMatch = html.match(/action="([^"]+)"/);
      if (actionMatch) {
        results.sdk.formAction = actionMatch[1];
      }

      // Check if it points to test or prod
      results.sdk.isTestUrl = html.includes('checkout-test');
      results.sdk.isProdUrl = html.includes('mypos.eu/vmp/checkout/') && !html.includes('checkout-test');

    } catch (purchaseErr: unknown) {
      results.sdk.purchaseError = purchaseErr instanceof Error ? purchaseErr.message : String(purchaseErr);
    }

  } catch (sdkErr: unknown) {
    results.sdk = { error: sdkErr instanceof Error ? sdkErr.message : String(sdkErr) };
  }

  return NextResponse.json(results, { status: 200 });
}
