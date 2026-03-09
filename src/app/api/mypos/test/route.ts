import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const results: Record<string, any> = {};
  
  try {
    const b64 = process.env.MYPOS_PRIVATE_KEY_B64 || '';
    const privateKey = Buffer.from(b64, 'base64').toString('utf-8');
    const isLive = process.env.MYPOS_LIVE === 'true';
    
    results.config = {
      sid: process.env.MYPOS_SID,
      wallet: process.env.MYPOS_WALLET,
      keyIndex: process.env.MYPOS_KEY_INDEX,
      isLive,
      checkoutUrl: isLive ? 'https://www.mypos.eu/vmp/checkout' : 'https://www.mypos.eu/vmp/checkout-test',
      privateKeyOk: privateKey.startsWith('-----BEGIN RSA PRIVATE KEY-----'),
    };

    // Test signature generation
    const testData = ['1306645', '40016394476', '1', '10.00', 'EUR', 'TEST-123', 'https://example.com/notify', 'https://example.com/ok', 'https://example.com/cancel', 'Test note', '0', '3', '1', 'Test Product', '1', '10.00', 'EUR'];
    const concatenated = testData.join('-');
    const toSign = Buffer.from(concatenated).toString('base64');
    const sign = crypto.createSign('SHA256');
    sign.update(toSign);
    sign.end();
    const sig = sign.sign(privateKey, 'base64');
    
    results.signatureTest = {
      success: true,
      signaturePreview: sig.substring(0, 50) + '...',
      dataFieldCount: testData.length,
    };
  } catch (err: any) {
    results.error = err.message;
  }

  return NextResponse.json(results);
}
