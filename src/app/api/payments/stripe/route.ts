import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' as any });
    
    const { amount, currency = 'eur', email, metadata } = await request.json();

    if (!amount || amount < 50) {
      return NextResponse.json({ error: 'Montant minimum: 0.50€' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      receipt_email: email,
      metadata: metadata || {},
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
