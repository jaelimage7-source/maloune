import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  try {
    // Get private key
    const b64Key = process.env.MYPOS_PRIVATE_KEY_B64 || '';
    const privateKey = b64Key
      ? Buffer.from(b64Key, 'base64').toString('utf-8')
      : (process.env.MYPOS_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    // Get public cert
    const b64Cert = process.env.MYPOS_PUBLIC_CERT_B64 || '';
    const publicCert = b64Cert
      ? Buffer.from(b64Cert, 'base64').toString('utf-8')
      : '';

    // Test: sign with private key, verify with public cert
    const testData = 'test-signature-verification';
    const base64Data = Buffer.from(testData).toString('base64');

    const sign = crypto.createSign('SHA256');
    sign.update(base64Data);
    sign.end();
    const signature = sign.sign(privateKey, 'base64');

    // Verify with public cert
    let pubKeyMatch = false;
    let verifyError = '';
    if (publicCert) {
      try {
        const verify = crypto.createVerify('SHA256');
        verify.update(base64Data);
        verify.end();
        pubKeyMatch = verify.verify(publicCert, signature, 'base64');
      } catch (e: any) {
        verifyError = e.message;
      }
    }

    // Extract public key from private key (what SHOULD be on myPOS)
    const pubFromPrivate = crypto.createPublicKey(privateKey);
    const pemPublic = pubFromPrivate.export({ type: 'spki', format: 'pem' });

    return NextResponse.json({
      privateKeyOk: true,
      publicCertSet: !!publicCert,
      publicCertPreview: publicCert ? publicCert.substring(0, 60) + '...' : 'NOT SET',
      signatureGenerated: true,
      publicKeyMatchesPrivateKey: pubKeyMatch,
      verifyError: verifyError || null,
      note: pubKeyMatch
        ? 'Keys match! Problem is elsewhere.'
        : 'KEYS DO NOT MATCH! Upload the correct public certificate to myPOS portal.',
      correctPublicKey: pemPublic.toString().substring(0, 200) + '...',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
