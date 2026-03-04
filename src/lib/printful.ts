/**
 * MALOUNE - Printful API Client
 * Konekte otomatikman ak Printful pou fetch pwodwi, kalkile shipping, kreye kòmand
 */

const PRINTFUL_API_URL = 'https://api.printful.com';
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

// ============================================================
// Fonksyon API Printful
// ============================================================

async function printfulRequest(endpoint: string, method = 'GET', body?: any) {
  const url = `${PRINTFUL_API_URL}${endpoint}`;
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Printful API Error ${response.status}: ${errorData?.result || response.statusText}`);
  }

  return response.json();
}

// ============================================================
// PWODWI
// ============================================================

export async function getProducts() {
  const response = await printfulRequest('/store/products');
  return response.result;
}

export async function getProduct(id: number) {
  const response = await printfulRequest(`/store/products/${id}`);
  return response.result;
}

export async function getAllProductsWithDetails() {
  const products = await getProducts();
  const detailed = await Promise.all(
    products
      .filter((p: any) => !p.is_ignored)
      .map((p: any) => getProduct(p.id))
  );
  return detailed;
}

export function formatProductForStore(detail: any) {
  const { sync_product, sync_variants } = detail;
  
  const prices = sync_variants.map((v: any) => parseFloat(v.retail_price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const images = sync_variants
    .flatMap((v: any) => v.files.filter((f: any) => f.type === 'preview'))
    .map((f: any) => f.preview_url)
    .filter((url: string, i: number, arr: string[]) => arr.indexOf(url) === i);

  const thumbnail = sync_product.thumbnail_url || images[0] || '';

  const sizes = [...new Set(sync_variants.map((v: any) => {
    const sizePart = v.name.split(' - ').pop()?.trim();
    return sizePart || '';
  }))].filter(Boolean);

  const colors = [...new Set(sync_variants.map((v: any) => {
    const parts = v.name.split(' - ');
    return parts.length > 1 ? parts[parts.length - 2]?.trim() : '';
  }))].filter(Boolean);

  return {
    id: sync_product.id,
    externalId: sync_product.external_id,
    name: sync_product.name,
    thumbnail,
    images,
    price: minPrice,
    maxPrice: maxPrice !== minPrice ? maxPrice : undefined,
    currency: sync_variants[0]?.currency || 'EUR',
    variants: sync_variants.map((v: any) => ({
      id: v.id,
      variantId: v.variant_id,
      name: v.name,
      sku: v.sku,
      price: parseFloat(v.retail_price),
      currency: v.currency,
      image: v.files.find((f: any) => f.type === 'preview')?.preview_url || thumbnail,
    })),
    sizes,
    colors,
    variantCount: sync_variants.length,
  };
}

// ============================================================
// SHIPPING
// ============================================================

export async function calculateShipping(request: any) {
  const response = await printfulRequest('/shipping/rates', 'POST', request);
  return response.result;
}

// ============================================================
// KÒMAND
// ============================================================

export async function createOrder(order: any, confirm = false) {
  const response = await printfulRequest(
    `/orders${confirm ? '?confirm=true' : ''}`,
    'POST',
    order
  );
  return response.result;
}

export async function confirmOrder(orderId: number) {
  const response = await printfulRequest(`/orders/${orderId}/confirm`, 'POST');
  return response.result;
}

export async function getOrder(orderId: number) {
  const response = await printfulRequest(`/orders/${orderId}`);
  return response.result;
}

export async function getStoreInfo() {
  const response = await printfulRequest('/store');
  return response.result;
}
