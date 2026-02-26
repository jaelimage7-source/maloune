import { NextResponse } from 'next/server';

const CJ_API_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';

async function getCJToken(): Promise<string> {
  const res = await fetch(`${CJ_API_BASE}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.CJ_API_EMAIL, password: process.env.CJ_API_PASSWORD }),
  });
  const data = await res.json();
  if (!data.result) throw new Error('CJ Auth failed: ' + data.message);
  return data.data.accessToken;
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    const token = await getCJToken();
    const headers = { 'Content-Type': 'application/json', 'CJ-Access-Token': token };

    if (action === 'sync-products') {
      const res = await fetch(`${CJ_API_BASE}/product/list`, {
        method: 'GET',
        headers,
      });
      const data = await res.json();
      return NextResponse.json({ success: true, products: data.data, total: data.data?.length || 0 });
    }

    if (action === 'sync-categories') {
      const res = await fetch(`${CJ_API_BASE}/product/getCategory`, { headers });
      const data = await res.json();
      return NextResponse.json({ success: true, categories: data.data });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('CJ Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
