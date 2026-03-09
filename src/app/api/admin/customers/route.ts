import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true,
          lastLoginAt: true,
          isActive: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.customer.count({ where: where as any }),
    ]);

    // Also get orders by email for non-registered customers
    const orderEmails = await prisma.order.groupBy({
      by: ['customerEmail'],
      _count: { id: true },
      _sum: { totalAmount: true },
      orderBy: { _count: { id: 'desc' } },
      take: 50,
    });

    return NextResponse.json({ customers, orderEmails, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin customers error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
