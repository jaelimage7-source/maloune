import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' as any });

    const body = await request.text();
    const sig = request.headers.get('stripe-signature')!;
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', (event.data.object as any).id);
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', (event.data.object as any).id);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
