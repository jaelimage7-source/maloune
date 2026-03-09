import { NextResponse } from 'next/server';
import { getSessionCustomer } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json({ customer: null }, { status: 401 });
    }

    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        createdAt: customer.createdAt,
      },
    });
  } catch {
    return NextResponse.json({ customer: null }, { status: 500 });
  }
}
