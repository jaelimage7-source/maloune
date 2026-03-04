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
  'exotic apparel': 'Vêtements', 'body care': 'Soin du corps', 'rings': 'Bagues',
  'lady dresses': 'Robes', 'waist bags': 'Sacs banane', 'smart watches': 'Montres connectées',
  'woman wallets': 'Portefeuilles femme', 'leather cases': 'Étuis cuir', 'lenses': 'Objectifs',
  'general': 'Général', 'led': 'LED', 'lamp': 'Lampes', 'light': 'Éclairage',
};

function translateCategory(name: string): string {
  return CATEGORY_FR[name.toLowerCase().trim()] || name;
}

async function fetchPrintfulProduct(printfulId: string) {
  try {
    const apiKey = process.env.PRINTFUL_API_KEY;
    if (!apiKey) return null;

    const res = await fetch(`https://api.printful.com/store/products/${printfulId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const { sync_product, sync_variants } = data.result;
    const prices = sync_variants.map((v: any) => parseFloat(v.retail_price));
    const images = sync_variants
      .flatMap((v: any) => (v.files || []).filter((f: any) => f.type === 'preview').map((f: any) => f.preview_url))
      .filter((url: string, i: number, arr: string[]) => arr.indexOf(url) === i);
    const thumbnail = sync_product.thumbnail_url || images[0] || '';

    return {
      id: `printful-${sync_product.id}`,
      slug: `printful-${sync_product.id}`,
      name: sync_product.name,
      description: `${sync_product.name} — Créé et imprimé à la demande par MALOUNE. Qualité premium. Expédition sous 3-7 jours ouvrables.`,
      price: Math.min(...prices),
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
        image: (v.files || []).find((f: any) => f.type === 'preview')?.preview_url || thumbnail,
      })),
    };
  } catch (error) {
    console.error('Printful product fetch error:', error);
    return null;
  }
}

export async function GET(
  request: Request,
  context: any
) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'fr';
    const slug = (await context.params).slug;

    // Printful product
    if (slug.startsWith('printful-')) {
      const printfulId = slug.replace('printful-', '');
      const product = await fetchPrintfulProduct(printfulId);
      if (product) {
        return NextResponse.json({ product, related: [] });
      }
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Regular Prisma product
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        translations: { where: { locale: locale as any } },
        category: { include: { translations: { where: { locale: locale as any } } } }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const related = product.categoryId ? await prisma.product.findMany({
      where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
      include: {
        translations: { where: { locale: locale as any } },
        category: { include: { translations: { where: { locale: locale as any } } } }
      },
      take: 4,
    }) : [];

    const catName = product.category?.translations[0]?.name || product.category?.slug || '';

    return NextResponse.json({
      product: {
        id: product.id,
        slug: product.slug,
        name: product.translations[0]?.name || 'Produit',
        description: product.translations[0]?.description || '',
        price: Number(product.sellPrice),
        comparePrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
        image: product.mainImageUrl || '',
        images: (product.images as string[]) || [],
        category: translateCategory(catName),
        categorySlug: product.category?.slug || '',
        rating: 4.5,
        reviewCount: Math.floor(Math.random() * 200) + 50,
        inStock: true,
      },
      related: related.map((p: any) => ({
        id: p.id, slug: p.slug,
        name: p.translations[0]?.name || 'Produit',
        description: p.translations[0]?.description || '',
        price: Number(p.sellPrice),
        comparePrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
        image: p.mainImageUrl || '',
        images: (p.images as string[]) || [],
        category: translateCategory(p.category?.translations[0]?.name || p.category?.slug || ''),
        categorySlug: p.category?.slug || '',
        rating: 4.5, reviewCount: Math.floor(Math.random() * 200) + 50, inStock: true,
      })),
    });
  } catch (e: any) {
    console.error('Product Detail API Error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
