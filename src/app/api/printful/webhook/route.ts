import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session } = body;

    if (!session?.metadata?.printful_items || !session?.shipping_details?.address) {
      return NextResponse.json({ received: true, info: 'No Printful items' });
    }

    const { createOrder } = await import('@/lib/printful');
    const addr = session.shipping_details.address;
    const items = JSON.parse(session.metadata.printful_items);

    const order = await createOrder({
      recipient: {
        name: session.shipping_details.name || 'Customer',
        address1: addr.line1 || '',
        city: addr.city || '',
        country_code: addr.country || 'FR',
        zip: addr.postal_code || '',
        email: session.customer_email || '',
      },
      items,
    }, false);

    return NextResponse.json({ received: true, printful_order_id: order.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ received: true, error: message });
  }
}
