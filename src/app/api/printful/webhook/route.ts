import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/printful';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Lè Stripe voye yon evènman checkout.session.completed
    // Ou ka verifye signature Stripe isit si ou vle (rekòmande pou pwodiksyon)
    
    const { session } = body;
    
    if (!session) {
      return NextResponse.json({ error: 'No session data' }, { status: 400 });
    }

    const shippingDetails = session.shipping_details || session.customer_details;
    const metadata = session.metadata;

    if (!shippingDetails?.address || !metadata?.printful_items) {
      return NextResponse.json({ received: true, info: 'No Printful items or address' });
    }

    const printfulItems = JSON.parse(metadata.printful_items);
    const address = shippingDetails.address;

    const printfulOrder = {
      recipient: {
        name: shippingDetails.name || 'Customer',
        address1: address.line1 || '',
        address2: address.line2 || undefined,
        city: address.city || '',
        state_code: address.state || undefined,
        country_code: address.country || 'FR',
        zip: address.postal_code || '',
        email: session.customer_email || undefined,
      },
      items: printfulItems,
    };

    // confirm=false → ou ka verifye kòmand nan Printful Dashboard avan
    const order = await createOrder(printfulOrder, false);
    console.log('✅ Printful order created:', order.id);

    return NextResponse.json({ received: true, printful_order_id: order.id });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ received: true, error: error.message });
  }
}
