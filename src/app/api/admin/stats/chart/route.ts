import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const key = request.headers.get('x-admin-key');
  const origin = request.headers.get('origin') || request.headers.get('referer') || '';
  const isLocal = origin.includes('maloune.fr');
  if (key !== process.env.ADMIN_API_KEY && !isLocal) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const days = parseInt(request.nextUrl.searchParams.get('days') || '30');
    const since = new Date();
    since.setDate(since.getDate() - days);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, totalAmount: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyMap: Record<string, { revenue: number; orders: number; date: string }> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = { date: key, revenue: 0, orders: 0 };
    }

    for (const o of orders) {
      const key = new Date(o.createdAt).toISOString().split('T')[0];
      if (dailyMap[key]) {
        dailyMap[key].orders++;
        dailyMap[key].revenue += Number(o.totalAmount);
      }
    }

    return NextResponse.json({ success: true, data: Object.values(dailyMap) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

