import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { amount, currency = 'eur' } = await request.json();
    const paymentIntent = await stripe.paymentIntents.create({ amount: Math.round(amount * 100), currency });
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
