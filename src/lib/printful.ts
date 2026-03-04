const PRINTFUL_API_URL = 'https://api.printful.com';
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY || '';

async function printfulRequest(endpoint: string, method = 'GET', body?: unknown) {
  const response = await fetch(`${PRINTFUL_API_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Printful ${response.status}: ${text}`);
  }

  return response.json();
}

export async function getStoreProducts() {
  const data = await printfulRequest('/store/products');
  return data.result || [];
}

export async function getStoreProduct(id: number) {
  const data = await printfulRequest(`/store/products/${id}`);
  return data.result;
}

export async function getAllProductsFormatted() {
  const products = await getStoreProducts();
  const details = await Promise.all(
    products
      .filter((p: { is_ignored: boolean }) => !p.is_ignored)
      .map((p: { id: number }) => getStoreProduct(p.id))
  );

  return details.map((detail: { sync_product: { id: number; name: string; thumbnail_url: string }; sync_variants: Array<{ id: number; variant_id: number; name: string; retail_price: string; currency: string; sku: string; files: Array<{ type: string; preview_url: string }> }> }) => {
    const { sync_product, sync_variants } = detail;
    const prices = sync_variants.map((v) => parseFloat(v.retail_price));
    const images = sync_variants
      .flatMap((v) => v.files.filter((f) => f.type === 'preview').map((f) => f.preview_url))
      .filter((url: string, i: number, arr: string[]) => arr.indexOf(url) === i);

    return {
      id: sync_product.id,
      name: sync_product.name,
      thumbnail: sync_product.thumbnail_url || images[0] || '',
      images,
      price: prices.length ? Math.min(...prices) : 0,
      currency: sync_variants[0]?.currency || 'EUR',
      variants: sync_variants.map((v) => ({
        id: v.id,
        variantId: v.variant_id,
        name: v.name,
        price: parseFloat(v.retail_price),
        sku: v.sku,
        image: v.files.find((f) => f.type === 'preview')?.preview_url || '',
      })),
      variantCount: sync_variants.length,
    };
  });
}

export async function calculateShipping(recipient: Record<string, unknown>, items: Array<Record<string, unknown>>) {
  const data = await printfulRequest('/shipping/rates', 'POST', { recipient, items });
  return data.result || [];
}

export async function createOrder(order: Record<string, unknown>, confirm = false) {
  const data = await printfulRequest(`/orders${confirm ? '?confirm=true' : ''}`, 'POST', order);
  return data.result;
}
