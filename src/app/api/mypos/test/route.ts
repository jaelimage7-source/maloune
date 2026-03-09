import { NextResponse } from 'next/server';
import crypto from 'crypto';

function getPrivateKey(): string {
  const b64Key = process.env.MYPOS_PRIVATE_KEY_B64;
  if (b64Key) return Buffer.from(b64Key, 'base64').toString('utf-8');
  const pk = process.env.MYPOS_PRIVATE_KEY || '';
  return pk.replace(/\\n/g, '\n');
}

export async function GET() {
  const results: Record<string, any> = {};

  // Config check
  results.config = {
    sid: process.env.MYPOS_SID || 'NOT SET',
    wallet: process.env.MYPOS_WALLET || 'NOT SET',
    keyIndex: process.env.MYPOS_KEY_INDEX || 'NOT SET',
    isLive: process.env.MYPOS_LIVE === 'true',
    checkoutUrl: process.env.MYPOS_LIVE === 'true'
      ? 'https://www.mypos.com/vmp/checkout'
      : 'https://www.mypos.eu/vmp/checkout-test',
    privateKeyB64Set: !!process.env.MYPOS_PRIVATE_KEY_B64,
    publicCertB64Set: !!process.env.MYPOS_PUBLIC_CERT_B64,
  };

  // Signature test with official example values
  try {
    const pem = getPrivateKey();
    results.privateKey = {
      length: pem.length,
      startsCorrectly: pem.startsWith('-----BEGIN RSA PRIVATE KEY-----'),
      endsCorrectly: pem.trimEnd().endsWith('-----END RSA PRIVATE KEY-----'),
    };

    // Test signature: concatenate values with dash, base64 encode, sign
    const testValues = ['IPCPurchase', '1.4', 'FR', process.env.MYPOS_SID || '1306645'];
    const concatenated = testValues.join('-');
    const base64Data = Buffer.from(concatenated).toString('base64');
    
    const sign = crypto.createSign('SHA256');
    sign.update(base64Data);
    sign.end();
    const sig = sign.sign(pem, 'base64');

    results.signatureTest = {
      success: true,
      testInput: concatenated,
      base64Input: base64Data,
      signaturePreview: sig.substring(0, 50) + '...',
    };
  } catch (err: any) {
    results.signatureTest = { success: false, error: err.message };
  }

  return NextResponse.json(results);
}
