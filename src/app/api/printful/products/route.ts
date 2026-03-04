import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiKey = process.env.PRINTFUL_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        message: 'Printful API konekte men PRINTFUL_API_KEY pa konfigire nan Vercel.',
        products: [],
        setup: 'Ale sou Vercel > Settings > Environment Variables > ajoute PRINTFUL_API_KEY',
      });
    }

    const { getAllProductsFormatted } = await import('@/lib/printful');
    const products = await getAllProductsFormatted();

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
