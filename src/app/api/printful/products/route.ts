import { NextRequest, NextResponse } from 'next/server';
import { getAllProductsWithDetails, getProduct, formatProductForStore } from '@/lib/printful';

let cachedProducts: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (productId) {
      const detail = await getProduct(parseInt(productId));
      const formatted = formatProductForStore(detail);
      return NextResponse.json({ success: true, product: formatted });
    }

    const now = Date.now();
    if (!cachedProducts || now - cacheTimestamp > CACHE_DURATION) {
      const allProducts = await getAllProductsWithDetails();
      cachedProducts = allProducts.map(formatProductForStore);
      cacheTimestamp = now;
    }

    return NextResponse.json({
      success: true,
      products: cachedProducts,
      count: cachedProducts.length,
    });
  } catch (error: any) {
    console.error('Printful products error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    cachedProducts = null;
    cacheTimestamp = 0;
    const allProducts = await getAllProductsWithDetails();
    cachedProducts = allProducts.map(formatProductForStore);
    cacheTimestamp = Date.now();
    return NextResponse.json({ success: true, message: 'Cache refreshed', count: cachedProducts.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
