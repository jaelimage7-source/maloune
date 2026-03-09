import { NextRequest, NextResponse } from 'next/server';

const COUPONS: Record<string, { type: 'percent' | 'fixed'; value: number; minOrder: number; maxUses: number; expires: string; description: string }> = {
  'BIENVENUE10': { type: 'percent', value: 10, minOrder: 20, maxUses: 1000, expires: '2027-12-31', description: '-10% sur votre commande' },
  'MALOUNE20': { type: 'percent', value: 20, minOrder: 50, maxUses: 500, expires: '2027-06-30', description: '-20% dès 50 EUR' },
  'LIVRAISON': { type: 'fixed', value: 4.99, minOrder: 30, maxUses: 200, expires: '2027-12-31', description: 'Livraison offerte dès 30 EUR' },
  'PROMO5': { type: 'fixed', value: 5, minOrder: 25, maxUses: 300, expires: '2027-12-31', description: '-5 EUR dès 25 EUR' },
};

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();
    if (!code) return NextResponse.json({ error: 'Code requis' }, { status: 400 });

    const coupon = COUPONS[code.toUpperCase().trim()];
    if (!coupon) return NextResponse.json({ valid: false, error: 'Code promo invalide' });
    if (new Date(coupon.expires) < new Date()) return NextResponse.json({ valid: false, error: 'Code expiré' });
    if (subtotal < coupon.minOrder) return NextResponse.json({ valid: false, error: `Minimum ${coupon.minOrder} EUR requis` });

    const discount = coupon.type === 'percent' ? Math.round(subtotal * coupon.value / 100 * 100) / 100 : coupon.value;
    return NextResponse.json({ valid: true, code: code.toUpperCase().trim(), discount, description: coupon.description, type: coupon.type, value: coupon.value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

