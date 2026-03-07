import { NextRequest } from 'next/server';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';

export function isAdminRequest(request: NextRequest): boolean {
  // Check X-Admin-Key header
  const key = request.headers.get('x-admin-key') || '';
  if (ADMIN_API_KEY && key === ADMIN_API_KEY) return true;
  
  // Check Authorization Bearer
  const auth = request.headers.get('authorization') || '';
  if (ADMIN_API_KEY && auth === `Bearer ${ADMIN_API_KEY}`) return true;
  
  return false;
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
