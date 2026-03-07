import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }

    // Constant-time comparison to prevent timing attacks
    const inputHash = crypto.createHash('sha256').update(password || '').digest('hex');
    const storedHash = crypto.createHash('sha256').update(adminPassword).digest('hex');
    
    if (crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(storedHash))) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 400 });
  }
}
