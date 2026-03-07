import { NextRequest, NextResponse } from 'next/server';
import { encrypt, maskSensitive } from '@/lib/security/encryption';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    // Encrypt sensitive payment data before logging
    const sensitiveFields = ['OrderID', 'Amount', 'Currency', 'Status', 'IPCmethod'];
    const logSafe: Record<string, string> = {};
    for (const [key, val] of Object.entries(data)) {
      if (key === 'Signature' || key.includes('Card') || key.includes('Token')) {
        logSafe[key] = maskSensitive(val);
      } else if (sensitiveFields.includes(key)) {
        logSafe[key] = val; // OK to log these
      }
    }

    console.log('=== myPOS Payment Notification ===');
    console.log('OrderID:', logSafe.OrderID || 'N/A');
    console.log('Amount:', logSafe.Amount || 'N/A');
    console.log('Status:', logSafe.Status || logSafe.IPCmethod || 'N/A');

    // Encrypt full notification data for secure storage
    const encryptedData = encrypt(JSON.stringify(data));
    console.log('Encrypted notification stored, length:', encryptedData.length);

    // TODO: Store encryptedData in database
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
