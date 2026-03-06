import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log('=== myPOS Payment Notification ===');
    console.log('OrderID:', data.OrderID);
    console.log('Amount:', data.Amount);
    console.log('Currency:', data.Currency);
    console.log('Status:', data.Status || data.IPCmethod);
    console.log('==================================');

    // TODO: Update order status in database
    // TODO: Trigger Printful order if applicable

    // myPOS requires "OK" response
    return new NextResponse('OK', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('myPOS webhook error:', error);
    return new NextResponse('OK', { status: 200 });
  }
}
