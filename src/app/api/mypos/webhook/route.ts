import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function getPublicCert(): string {
  const b64Key = process.env.MYPOS_PUBLIC_CERT_B64;
  if (b64Key) return Buffer.from(b64Key, 'base64').toString('utf-8');
  return '';
}

function verifySignature(data: Record<string, string>): boolean {
  try {
    const publicCert = getPublicCert();
    if (!publicCert) return false;

    const signature = data['Signature'];
    if (!signature) return false;

    const dataWithoutSig = { ...data };
    delete dataWithoutSig['Signature'];

    const payload = Object.values(dataWithoutSig).join('-');
    const concData = Buffer.from(payload).toString('base64');

    const key = publicCert.trim().split('\n').map(x => x.trim()).join('\n');
    const verifier = crypto.createVerify('SHA256');
    verifier.update(concData);

    return verifier.verify(key, signature, 'base64');
  } catch (e) {
    console.error('Signature verification error:', e);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    // V-23: Verify myPOS signature
    const isValid = verifySignature(data);
    if (!isValid) {
      console.warn('myPOS webhook: INVALID SIGNATURE');
      // Still return OK to avoid retries, but don't process
      return new NextResponse('OK', { status: 200 });
    }

    console.log('=== myPOS Payment Notification (Verified) ===');
    console.log('OrderID:', data.OrderID);
    console.log('Amount:', data.Amount, data.Currency);
    console.log('Status:', data.Status || data.IPCmethod);

    // TODO: Update order status in database
    // TODO: Trigger Printful order if applicable

    return new NextResponse('OK', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('myPOS webhook error:', error);
    return new NextResponse('OK', { status: 200 });
  }
}
