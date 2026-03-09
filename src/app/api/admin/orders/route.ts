import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function checkAdmin(request: NextRequest): boolean {
  const key = request.headers.get('x-admin-key') || '';
  const session = request.headers.get('x-admin-session') || '';
  const adminKey = process.env.ADMIN_API_KEY || '';
  return (adminKey && key === adminKey) || session === 'true';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';

  try {
    const where: Record<string, unknown> = {};
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { shippingCustomerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: true,
          payments: { select: { status: true, provider: true, amount: true, paidAt: true } },
        },
      }),
      prisma.order.count({ where: where as any }),
    ]);

    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { orderId, status, trackingNumber, trackingUrl, carrierName, internalNote } = await request.json();
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (internalNote !== undefined) updateData.internalNote = internalNote;
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
      updateData.trackingUrl = trackingUrl || null;
      if (status !== 'SHIPPED') updateData.status = 'SHIPPED';
      updateData.shippedAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData as any,
      include: { items: true },
    });

    if (trackingNumber) {
      await prisma.shipmentTracking.create({
        data: {
          orderId,
          trackingNumber,
          carrierName: carrierName || null,
          trackingUrl: trackingUrl || null,
          currentStatus: 'SHIPPED',
        },
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Admin order update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
