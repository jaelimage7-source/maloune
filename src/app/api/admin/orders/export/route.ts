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
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    const header = 'Numéro,Date,Client,Email,Statut,Total,Devise,Adresse,Ville,Pays,Produits\n';
    const rows = orders.map((o: any) => {
      const items = o.items.map((i: any) => `${i.productName} x${i.quantity}`).join(' | ');
      const date = new Date(o.createdAt).toLocaleDateString('fr-FR');
      return `"${o.orderNumber}","${date}","${o.shippingCustomerName}","${o.customerEmail}","${o.status}","${o.totalAmount}","${o.currency}","${o.shippingAddress}","${o.shippingCity}","${o.shippingCountry}","${items}"`;
    }).join('\n');

    const csv = header + rows;
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="maloune-commandes-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

