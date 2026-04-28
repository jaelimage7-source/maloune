export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createOrder } from '@/lib/services/order.service';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-04-22.dahlia',
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }

    let items: { name: string; price: number; quantity: number; productId?: string; variantId?: string; image?: string }[];
    let locale = 'fr';
    let shipping: { firstName?: string; lastName?: string; email?: string; phone?: string; address?: string; city?: string; zip?: string; country?: string } = {};

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await request.json();
      items = json.items;
      locale = json.locale || 'fr';
      shipping = json.shipping || {};
    } else {
      const formData = await request.formData();
      const data = JSON.parse(formData.get('data') as string);
      items = data.items;
      locale = data.locale || 'fr';
      shipping = data.shipping || {};
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items' }, { status: 400 });
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderNumber = `MAL-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://maloune.fr';

    // Save order to DB
    try {
      await createOrder({
        orderId: orderNumber,
        items: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          productId: item.productId || undefined,
          variantId: item.variantId || undefined,
          image: item.image || undefined,
        })),
        totalAmount: total,
        currency: 'EUR',
        shipping: {
          firstName: shipping.firstName || 'Client',
          lastName: shipping.lastName || '',
          email: shipping.email || '',
          phone: shipping.phone || '',
          address: shipping.address || '',
          city: shipping.city || '',
          zip: shipping.zip || '',
          country: shipping.country || 'FR',
        },
      });
    } catch (dbErr) {
      console.error('Order save error (continuing):', dbErr);
    }

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            ...(item.image && item.image.startsWith('http') ? { images: [item.image] } : {}),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      success_url: `${baseUrl}/${locale}/checkout/success?order=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${locale}/checkout?cancelled=1`,
      customer_email: shipping.email || undefined,
      locale: locale === 'fr' ? 'fr' : 'en',
      metadata: {
        orderNumber,
        locale,
        customerEmail: shipping.email || '',
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });

  } catch (error: unknown) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
