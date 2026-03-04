import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, items } = body;

    if (!address || !items?.length) {
      return NextResponse.json({ success: false, error: 'Address and items required' }, { status: 400 });
    }

    const { calculateShipping } = await import('@/lib/printful');
    const rates = await calculateShipping(
      { address1: address.address1, city: address.city, country_code: address.country_code, zip: address.zip },
      items.map((i: { variant_id: number; quantity: number }) => ({ variant_id: i.variant_id, quantity: i.quantity }))
    );

    return NextResponse.json({ success: true, rates });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
