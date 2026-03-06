import { NextResponse } from 'next/server';
import { createCheckoutForm } from '@/lib/mypos';

export async function POST(request: Request) {
  try {
    const { items, locale = 'fr' } = await request.json();
    const origin = request.headers.get('origin') || 'https://maloune.fr';

    if (!items || !items.length) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Generate unique order ID
    const orderId = `MAL-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Build cart items
    const cartItems = items.map((item: { name: string; price: number; quantity: number }) => ({
      name: item.name.substring(0, 100),
      quantity: item.quantity || 1,
      price: item.price,
    }));

    // Create myPOS checkout form data
    const checkout = createCheckoutForm({
      orderId,
      amount: cartItems.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0),
      currency: 'EUR',
      cartItems,
      urlOk: `${origin}/${locale}/checkout/success?order=${orderId}`,
      urlCancel: `${origin}/${locale}/cart`,
      urlNotify: `${origin}/api/mypos/webhook`,
      expirationDays: 1,
    });

    return NextResponse.json({
      url: checkout.url,
      fields: checkout.fields,
      orderId,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('Checkout error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
