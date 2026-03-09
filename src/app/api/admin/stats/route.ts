import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
      weekOrders,
      weekRevenue,
      monthOrders,
      monthRevenue,
      totalCustomers,
      pendingOrders,
      paidOrders,
      shippedOrders,
      recentOrders,
      dailyStats,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED', 'PROCESSING'] } } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: today }, status: { in: ['PAID', 'SHIPPED', 'DELIVERED', 'PROCESSING'] } } }),
      prisma.order.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: weekAgo }, status: { in: ['PAID', 'SHIPPED', 'DELIVERED', 'PROCESSING'] } } }),
      prisma.order.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: monthAgo }, status: { in: ['PAID', 'SHIPPED', 'DELIVERED', 'PROCESSING'] } } }),
      prisma.customer.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PAID' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { orderNumber: true, totalAmount: true, status: true, createdAt: true, customerEmail: true } }),
      // Daily stats for last 7 days
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*)::int as orders,
          COALESCE(SUM(total_amount), 0)::float as revenue
        FROM orders 
        WHERE created_at >= ${weekAgo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    return NextResponse.json({
      overview: {
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
        totalCustomers,
        pendingOrders,
        paidOrders,
        shippedOrders,
      },
      today: {
        orders: todayOrders,
        revenue: Number(todayRevenue._sum.totalAmount || 0),
      },
      week: {
        orders: weekOrders,
        revenue: Number(weekRevenue._sum.totalAmount || 0),
      },
      month: {
        orders: monthOrders,
        revenue: Number(monthRevenue._sum.totalAmount || 0),
      },
      recentOrders,
      dailyStats,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
