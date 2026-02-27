import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = await request.text();
    const sig = request.headers.get('stripe-signature')!;
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', (event.data.object as any).id);
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', (event.data.object as any).id);
        break;
    }
    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
