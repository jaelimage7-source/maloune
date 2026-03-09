import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession, clearSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('maloune_session')?.value;
    if (token) {
      await deleteSession(token);
    }
    clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    clearSessionCookie();
    return NextResponse.json({ success: true });
  }
}
