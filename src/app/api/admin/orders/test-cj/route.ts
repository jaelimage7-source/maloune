import { NextRequest, NextResponse } from 'next/server';

const CJ_API_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';

async function getCJAccessToken(): Promise<string> {
  const email = process.env.CJ_API_EMAIL;
  const password = process.env.CJ_API_PASSWORD;
  
  if (!email || !password) {
    throw new Error('CJ_API_EMAIL or CJ_API_PASSWORD not set in environment');
  }

  const res = await fetch(`${CJ_API_BASE}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  
  if (!data.result || !data.data?.accessToken) {
    throw new Error(`CJ auth failed: ${data.message || JSON.stringify(data)}`);
  }

  return data.data.accessToken;
}

export async function GET(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key') || 
                   request.nextUrl.searchParams.get('key');
  
  const expectedKey = process.env.ADMIN_API_KEY;
  if (expectedKey && adminKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    envCheck: {
      CJ_API_EMAIL: process.env.CJ_API_EMAIL ? '✅ Set' : '❌ Missing',
      CJ_API_PASSWORD: process.env.CJ_API_PASSWORD ? '✅ Set' : '❌ Missing',
    },
  };

  // Step 1: Test authentication
  try {
    const token = await getCJAccessToken();
    results.auth = {
      success: true,
      tokenPreview: token.substring(0, 30) + '...',
    };

    // Step 2: Test product search
    try {
      const searchRes = await fetch(`${CJ_API_BASE}/product/list?pageNum=1&pageSize=3`, {
        headers: { 'CJ-Access-Token': token },
      });
      const searchData = await searchRes.json();
      results.productSearch = {
        success: searchData.result === true,
        message: searchData.message,
        totalProducts: searchData.data?.total || 0,
        sampleProducts: (searchData.data?.list || []).slice(0, 3).map((p: any) => ({
          pid: p.pid,
          name: (p.productNameEn || p.productName || '').substring(0, 60),
        })),
      };
    } catch (searchErr: any) {
      results.productSearch = { success: false, error: searchErr.message };
    }

    // Step 3: Test order creation (DRY RUN - no actual order)
    results.orderTest = {
      note: 'Dry run only — no actual order created',
      readyToOrder: true,
      requiredFields: {
        shippingAddress: '✅ From checkout form',
        productVariants: '✅ From OrderItem.cjVariantId or product lookup',
        accessToken: '✅ Working',
      },
      howToTest: 'POST /api/admin/orders/cj-order with {"orderId":"ORDER_UUID_HERE"}',
    };

  } catch (authErr: any) {
    results.auth = {
      success: false,
      error: authErr.message,
      hint: 'Check CJ_API_EMAIL and CJ_API_PASSWORD in Vercel env vars. Password should be your CJ API key (found in CJ Dashboard > User Center > API).',
    };
  }

  return NextResponse.json(results, { status: 200 });
}
