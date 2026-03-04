import { NextRequest, NextResponse } from 'next/server';
import { calculateShipping } from '@/lib/printful';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, items } = body;

    if (!address || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Address and items required' }, { status: 400 });
    }

    const rates = await calculateShipping({
      recipient: {
        address1: address.address1,
        city: address.city,
        country_code: address.country_code,
        state_code: address.state_code || undefined,
        zip: address.zip || undefined,
      },
      items: items.map((item: any) => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
      })),
    });

    return NextResponse.json({
      success: true,
      rates: rates.map((rate: any) => ({
        id: rate.id,
        name: rate.name,
        rate: parseFloat(rate.rate),
        currency: rate.currency,
        minDays: rate.minDeliveryDays,
        maxDays: rate.maxDeliveryDays,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
