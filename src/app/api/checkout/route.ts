import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' });

export async function POST(request: Request) {
  try {
    const { items, locale = 'fr' } = await request.json();
    if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://maloune.fr'}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://maloune.fr'}/${locale}/cart`,
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'CA', 'US', 'GB', 'DE', 'IT', 'ES', 'NL', 'PT', 'GP', 'MQ', 'GF', 'RE', 'HT'],
      },
      metadata: { locale },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (e: any) {
    console.error('Stripe Checkout Error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
