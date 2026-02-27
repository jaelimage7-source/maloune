// Run with: node scripts/bulk-import.mjs
// This script searches CJ API for products and imports them all

const SEARCHES = [
  'galaxy projector', 'bluetooth earbuds', 'LED face mask',
  'posture corrector', 'ring light', 'phone holder tripod',
  'makeup organizer', 'pet grooming glove', 'wireless charger',
  'portable blender', 'smart watch', 'LED strip lights',
  'yoga mat', 'kitchen organizer', 'car phone mount',
  'neck massager', 'mini projector', 'desk lamp LED',
  'water bottle', 'laptop stand', 'air purifier',
  'essential oil diffuser', 'gaming mouse', 'webcam HD',
];

const CJ_API_PASSWORD = process.env.CJ_API_PASSWORD;
const BASE_URL = 'http://localhost:3000';

async function getCJToken() {
  const res = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.CJ_API_EMAIL || 'jaelimage7@gmail.com', password: CJ_API_PASSWORD }),
  });
  const data = await res.json();
  return data.data?.accessToken;
}

async function searchCJ(token, query) {
  const res = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/list?pageNum=1&pageSize=10&productNameEn=${encodeURIComponent(query)}`, {
    headers: { 'CJ-Access-Token': token },
  });
  const data = await res.json();
  return data.data?.list || [];
}

async function importProduct(product) {
  const sellPrice = parseFloat(product.sellPrice) || 5;
  const margin = 2.5;
  const res = await fetch(`${BASE_URL}/api/cj/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cjProductId: product.pid,
      name: product.productNameEn,
      image: product.productImage,
      costPrice: sellPrice,
      sellPrice: Math.ceil(sellPrice * margin * 100) / 100,
      category: product.categoryName || 'General',
      weight: product.productWeight || 0,
      description: product.description || product.productNameEn,
    }),
  });
  return res.json();
}

async function main() {
  console.log('🚀 Starting bulk import...');
  const token = await getCJToken();
  if (!token) { console.error('❌ Failed to get CJ token'); return; }
  console.log('✅ CJ Token obtained');

  let total = 0;
  for (const query of SEARCHES) {
    console.log(`\n🔍 Searching: "${query}"...`);
    const products = await searchCJ(token, query);
    console.log(`   Found ${products.length} products`);

    for (const p of products.slice(0, 3)) { // Import top 3 per search
      try {
        const result = await importProduct(p);
        if (result.success) {
          total++;
          console.log(`   ✅ Imported: ${p.productNameEn?.substring(0, 50)}...`);
        } else {
          console.log(`   ⚠️ Skipped: ${result.error?.substring(0, 50)}`);
        }
      } catch (e) {
        console.log(`   ❌ Error: ${e.message}`);
      }
    }
    await new Promise(r => setTimeout(r, 500)); // Rate limit
  }
  console.log(`\n🎉 Done! Imported ${total} products total.`);
}

main().catch(console.error);
