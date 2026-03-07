import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // V-18: Verify request comes from Printful
    const userAgent = request.headers.get('user-agent') || '';
    if (!userAgent.includes('Printful')) {
      console.warn('Printful webhook: suspicious user-agent:', userAgent);
    }

    const body = await request.json();
    const { type, data } = body;

    console.log('=== Printful Webhook ===');
    console.log('Type:', type);
    console.log('Data keys:', Object.keys(data || {}));

    // Handle different event types
    switch (type) {
      case 'package_shipped':
        console.log('Order shipped:', data?.order?.id);
        // TODO: Update order status in database
        break;
      case 'order_created':
        console.log('Order created:', data?.order?.id);
        break;
      case 'order_failed':
        console.error('Order FAILED:', data?.order?.id, data?.reason);
        break;
      default:
        console.log('Unhandled event:', type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Printful webhook error:', error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
