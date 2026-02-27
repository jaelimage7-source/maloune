import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' });

export async function POST(request: Request) {
  const body = await request.text();
  const sig = headers().get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e: any) {
    console.error('Webhook signature failed:', e.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const shipping = session.shipping_details;
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    try {
      await prisma.order.create({
        data: {
          orderNumber,
          customerEmail: session.customer_details?.email || 'unknown@email.com',
          shippingCustomerName: shipping?.name || 'Client',
          shippingAddress: shipping?.address?.line1 || '',
          shippingAddress2: shipping?.address?.line2,
          shippingCity: shipping?.address?.city || '',
          shippingProvince: shipping?.address?.state,
          shippingPostalCode: shipping?.address?.postal_code,
          shippingCountry: shipping?.address?.country || 'FR',
          shippingCountryCode: shipping?.address?.country || 'FR',
          totalAmount: (session.amount_total || 0) / 100,
          subtotal: (session.amount_subtotal || 0) / 100,
          status: 'PAID',
          locale: (session.metadata?.locale as any) || 'fr',
          payments: {
            create: {
              provider: 'STRIPE',
              stripePaymentIntentId: session.payment_intent as string,
              amount: (session.amount_total || 0) / 100,
              currency: 'EUR',
              status: 'SUCCEEDED',
              paidAt: new Date(),
            }
          }
        }
      });
      console.log(`✅ Order ${orderNumber} created for ${session.customer_details?.email}`);
    } catch (e: any) {
      console.error('Order creation error:', e.message);
    }
  }

  return NextResponse.json({ received: true });
}
