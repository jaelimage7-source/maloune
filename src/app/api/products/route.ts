import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CATEGORY_FR: Record<string, string> = {
  'chandeliers': 'Lustres', 'solar lamps': 'Lampes solaires', 'downlights': 'Spots encastrés',
  'necklace & pendants': 'Colliers & Pendentifs', 'night lights': 'Veilleuses', 'furniture': 'Mobilier',
  'home office storage': 'Rangement bureau', 'wall lamps': 'Appliques murales', 'ceiling lights': 'Plafonniers',
  'underwater lights': 'Éclairage aquatique', 'silicone cases': 'Coques silicone', 'gamepads': 'Manettes',
  'projectors': 'Projecteurs', 'projectors & accessories': 'Projecteurs & Accessoires',
  'home appliance parts': 'Pièces électroménager', 'waterproof cases': 'Coques étanches',
  'earphones & headphones': 'Écouteurs & Casques', 'digital gear bags': 'Sacoches numériques',
  'speakers': 'Enceintes', 'holders & stands': 'Supports', 'tablet cases': 'Étuis tablettes',
  'phone call tablets': 'Tablettes', 'face skin care tools': 'Soins visage',
  'event & party supplies': 'Fête & Événements', 'sports accessories': 'Accessoires sport',
  'fitness & bodybuilding': 'Fitness & Musculation', 'health care products': 'Produits santé',
  "women's short-sleeved shirts": 'T-shirts femme', 'nail art kits': 'Kits nail art',
  'exotic apparel': 'Vêtements', 'body care': 'Soin du corps', 'rings': 'Bagues', 'earrings': 'Boucles d\'oreilles',
  'lady dresses': 'Robes', 'waist bags': 'Sacs banane', 'smart watches': 'Montres connectées',
  'woman wallets': 'Portefeuilles femme', 'leather cases': 'Étuis cuir', 'lenses': 'Objectifs',
  '5-inch display': 'Écrans 5 pouces', 'decorative flowers & wreaths': 'Fleurs décoratives',
  'makeup set': 'Sets maquillage', 'storage bags & cases & boxes': 'Rangement & Boîtes',
  'interior parts': 'Accessoires intérieur', 'briefcases': 'Mallettes', 'kitchen storage': 'Rangement cuisine',
  'totes': 'Sacs cabas', 'headband & hair band & hairpin': 'Bandeaux & Barrettes',
  'pet collars': 'Colliers animaux', '925 silver jewelry': 'Bijoux argent 925', 'pet mats': 'Tapis animaux',
  'pet drinking tools': 'Abreuvoirs', 'pet chew toys': 'Jouets à mâcher', 'pet bowls': 'Gamelles',
  'pet houses & cages': 'Niches & Cages', 'pet snacks': 'Friandises animaux',
  'pet shower products': 'Toilettage animaux', 'pet hair removers & combs': 'Brosses animaux',
  'pet leashes': 'Laisses', 'general': 'Général',
  'print-on-demand': 'Print on Demand',
};

function translateCategory(name: string): string {
  const lower = name.toLowerCase().trim();
  return CATEGORY_FR[lower] || name;
}

// Fetch Printful products and format them like CJ products
async function fetchPrintfulProducts(): Promise<any[]> {
  try {
    const apiKey = process.env.PRINTFUL_API_KEY;
    if (!apiKey) return [];

    const res = await fetch('https://api.printful.com/store/products', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];
    const data = await res.json();
    const products = data.result || [];

    // Fetch details for each product
    const detailed = await Promise.all(
      products
        .filter((p: any) => !p.is_ignored)
        .map(async (p: any) => {
          try {
            const detailRes = await fetch(`https://api.printful.com/store/products/${p.id}`, {
              headers: { 'Authorization': `Bearer ${apiKey}` },
              next: { revalidate: 300 },
            });
            if (!detailRes.ok) return null;
            const detailData = await detailRes.json();
            return detailData.result;
          } catch { return null; }
        })
    );

    return detailed
      .filter(Boolean)
      .map((detail: any) => {
        const { sync_product, sync_variants } = detail;
        const prices = sync_variants.map((v: any) => parseFloat(v.retail_price));
        const minPrice = Math.min(...prices);
        const images = sync_variants
          .flatMap((v: any) => v.files?.filter((f: any) => f.type === 'preview').map((f: any) => f.preview_url) || [])
          .filter((url: string, i: number, arr: string[]) => arr.indexOf(url) === i);
        const thumbnail = sync_product.thumbnail_url || images[0] || '';

        return {
          id: `printful-${sync_product.id}`,
          slug: `printful-${sync_product.id}`,
          name: sync_product.name,
          description: `${sync_product.name} - Print on Demand par MALOUNE`,
          price: minPrice,
          comparePrice: undefined,
          image: thumbnail,
          images: images.length > 0 ? images : [thumbnail],
          category: 'Print on Demand',
          categorySlug: 'print-on-demand',
          rating: 4.8,
          reviewCount: Math.floor(Math.random() * 100) + 20,
          inStock: true,
          tag: 'NOUVEAU',
          isPrintful: true,
          variants: sync_variants.map((v: any) => ({
            id: v.id,
            variantId: v.variant_id,
            name: v.name,
            price: parseFloat(v.retail_price),
            sku: v.sku,
            image: v.files?.find((f: any) => f.type === 'preview')?.preview_url || thumbnail,
          })),
        };
      });
  } catch (error) {
    console.error('Printful fetch error:', error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'fr';
    const cat = searchParams.get('cat') || '';

    const where: any = { isActive: true };
    if (cat && cat !== 'print-on-demand') {
      where.category = { slug: cat };
    }

    // Fetch CJ/Prisma products + Printful products in parallel
    const [prismaProducts, prismaCategories, printfulProducts] = await Promise.all([
      cat === 'print-on-demand'
        ? Promise.resolve([])
        : prisma.product.findMany({
            where,
            include: {
              translations: { where: { locale: locale as any } },
              category: {
                include: { translations: { where: { locale: locale as any } } }
              }
            },
            orderBy: { createdAt: 'desc' }
          }),
      prisma.category.findMany({
        where: { isActive: true },
        include: {
          translations: { where: { locale: locale as any } },
          _count: { select: { products: true } }
        },
        orderBy: { products: { _count: 'desc' } }
      }),
      fetchPrintfulProducts(),
    ]);

    const formattedPrisma = prismaProducts.map((p: any) => ({
      id: p.id,
      slug: p.slug,
      name: p.translations[0]?.name || 'Produit',
      description: p.translations[0]?.description || '',
      price: Number(p.sellPrice),
      comparePrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
      image: p.mainImageUrl || '',
      images: (p.images as string[]) || [],
      category: translateCategory(p.category?.translations[0]?.name || p.category?.slug || ''),
      categorySlug: p.category?.slug || '',
      rating: 4.5,
      reviewCount: Math.floor(Math.random() * 200) + 50,
      inStock: true,
      tag: undefined,
    }));

    // Merge: Printful products first (NOUVEAU), then CJ products
    let allProducts;
    if (cat === 'print-on-demand') {
      allProducts = printfulProducts;
    } else if (cat) {
      allProducts = formattedPrisma;
    } else {
      allProducts = [...printfulProducts, ...formattedPrisma];
    }

    // Categories: add Print on Demand category if Printful has products
    const formattedCats = prismaCategories
      .filter((c: any) => c._count.products > 0)
      .map((c: any) => ({
        name: translateCategory(c.translations[0]?.name || c.slug),
        slug: c.slug,
        count: c._count.products,
      }));

    if (printfulProducts.length > 0) {
      formattedCats.unshift({
        name: 'Print on Demand',
        slug: 'print-on-demand',
        count: printfulProducts.length,
      });
    }

    return NextResponse.json({ products: allProducts, categories: formattedCats });
  } catch (e: any) {
    console.error('Products API Error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
