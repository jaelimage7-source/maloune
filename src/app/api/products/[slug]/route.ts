import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mapping English category names → French
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
  'pet leashes': 'Laisses', 'general': 'Général', 'led': 'LED', 'lamp': 'Lampes', 'light': 'Éclairage',
};

function translateCategory(name: string): string {
  const lower = name.toLowerCase().trim();
  return CATEGORY_FR[lower] || name;
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'fr';
    const slug = params.slug;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        translations: { where: { locale: locale as any } },
        category: {
          include: { translations: { where: { locale: locale as any } } }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get related products from same category
    const related = product.categoryId ? await prisma.product.findMany({
      where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
      include: {
        translations: { where: { locale: locale as any } },
        category: { include: { translations: { where: { locale: locale as any } } } }
      },
      take: 4,
    }) : [];

    const catName = product.category?.translations[0]?.name || product.category?.slug || '';

    const formatted = {
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
    };

    const formattedRelated = related.map(p => ({
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
    }));

    return NextResponse.json({ product: formatted, related: formattedRelated });
  } catch (e: any) {
    console.error('Product Detail API Error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
