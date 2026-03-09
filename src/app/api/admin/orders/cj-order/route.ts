import { NextRequest, NextResponse } from 'next/server';
import { processCJOrder } from '@/lib/services/cj-order.service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Auth: accept x-admin-key or same origin
    const adminKey = request.headers.get('x-admin-key');
    const origin = request.headers.get('origin') || '';
    const isAdmin = (adminKey && adminKey === process.env.ADMIN_API_KEY) || origin.includes('maloune.fr') || origin.includes('localhost');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'orderId requis' }, { status: 400 });
    }

    const result = await processCJOrder(orderId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
