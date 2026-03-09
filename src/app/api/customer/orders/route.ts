import { NextResponse } from 'next/server';
import { getSessionCustomer } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { customerEmail: customer.email },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payments: { select: { status: true, provider: true, paidAt: true } },
        tracking: { select: { trackingNumber: true, carrierName: true, trackingUrl: true, currentStatus: true } },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
