export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';
import { prisma } from '@/lib/prisma';

const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const paymentId = params.get('id');

    if (!paymentId) {
      return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
    }

    const payment = await mollieClient.payments.get(paymentId);
    const orderNumber = (payment.metadata as any)?.orderNumber;

    if (!orderNumber) {
      console.error('No orderNumber in payment metadata');
      return NextResponse.json({ received: true });
    }

    // Update order status based on payment status
    let orderStatus: any = 'PENDING';
    if (payment.status === 'paid') {
      orderStatus = 'PAID';
    } else if (payment.status === 'failed') {
      orderStatus = 'UNPAID';
    } else if (payment.status === 'canceled') {
      orderStatus = 'CANCELLED';
    } else if (payment.status === 'expired') {
      orderStatus = 'UNPAID';
    }

    // Update order in database
    try {
      await prisma.order.updateMany({
        where: { orderNumber: orderNumber },
        data: {
          status: orderStatus,

        },
      });
      console.log(`Order ${orderNumber} updated to ${orderStatus}`);
    } catch (dbErr) {
      console.error('DB update error:', dbErr);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
