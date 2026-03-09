import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    console.log(`[NEWSLETTER] New subscriber: ${email}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

