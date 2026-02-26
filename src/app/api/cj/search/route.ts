import { NextResponse } from 'next/server';

const CJ_API = 'https://developers.cjdropshipping.com/api2.0/v1';

async function getToken() {
  const res = await fetch(`${CJ_API}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.CJ_API_EMAIL, password: process.env.CJ_API_PASSWORD }),
  });
  const data = await res.json();
  if (!data.result) throw new Error('CJ Auth failed: ' + (data.message || 'Check credentials'));
  return data.data.accessToken;
}

export async function POST(request: Request) {
  try {
    const { query, page = 1, limit = 20 } = await request.json();
    if (!process.env.CJ_API_EMAIL || !process.env.CJ_API_PASSWORD) {
      return NextResponse.json({ error: 'Add CJ_API_EMAIL and CJ_API_PASSWORD to your .env' }, { status: 500 });
    }
    const token = await getToken();
    const res = await fetch(`${CJ_API}/product/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'CJ-Access-Token': token },
      body: JSON.stringify({ productNameEn: query, pageNum: page, pageSize: limit }),
    });
    const data = await res.json();
    if (!data.result) return NextResponse.json({ error: data.message }, { status: 400 });
    const products = (data.data?.list || []).map((p: any) => ({
      pid: p.pid, productName: p.productNameEn || p.productName, productImage: p.productImage,
      sellPrice: p.sellPrice || 0, categoryName: p.categoryName || '', productWeight: p.productWeight || 0,
    }));
    return NextResponse.json({ success: true, products, total: data.data?.total || 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
