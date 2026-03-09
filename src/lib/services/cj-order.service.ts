import cjClient from '@/lib/cj-client';
import { prisma } from '@/lib/prisma';

interface CJOrderResult {
  success: boolean;
  cjOrderId?: string;
  cjOrderNum?: string;
  error?: string;
}

/**
 * Find CJ variant ID for an order item by:
 * 1. Direct cjVariantId on the item
 * 2. Lookup via productId -> ProductVariant
 * 3. Lookup via product name -> ProductTranslation -> Product -> ProductVariant
 */
async function findCJVariantId(item: any): Promise<string | null> {
  // 1. Direct
  if (item.cjVariantId) return item.cjVariantId;
  
  // 2. Via productId
  if (item.productId) {
    const variant = await prisma.productVariant.findFirst({
      where: { productId: item.productId, cjVariantId: { not: null } },
      select: { cjVariantId: true },
    });
    if (variant?.cjVariantId) return variant.cjVariantId;
  }
  
  // 3. Via product name matching
  const productName = item.productName || item.name || '';
  if (productName) {
    const translation = await prisma.productTranslation.findFirst({
      where: { name: { contains: productName.substring(0, 40), mode: 'insensitive' as any } },
      select: { productId: true },
    });
    if (translation) {
      const variant = await prisma.productVariant.findFirst({
        where: { productId: translation.productId, cjVariantId: { not: null } },
        select: { cjVariantId: true },
      });
      if (variant?.cjVariantId) return variant.cjVariantId;
      
      // Also check product-level cjProductId
      const product = await prisma.product.findUnique({
        where: { id: translation.productId },
        select: { cjProductId: true },
      });
      if (product?.cjProductId) {
        // Get first variant from CJ
        const v = await prisma.productVariant.findFirst({
          where: { productId: translation.productId },
          select: { cjVariantId: true },
        });
        if (v?.cjVariantId) return v.cjVariantId;
      }
    }
  }
  
  return null;
}

export async function processCJOrder(orderId: string): Promise<CJOrderResult> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return { success: false, error: 'Commande introuvable' };

    // Try to find CJ variant IDs for each item
    const products: { vid: string; quantity: number; name: string }[] = [];
    const unmatchedItems: string[] = [];

    for (const item of order.items) {
      const vid = await findCJVariantId(item);
      if (vid) {
        products.push({ vid, quantity: item.quantity, name: item.productName });
      } else {
        unmatchedItems.push(item.productName);
      }
    }

    if (products.length === 0) {
      return { 
        success: false, 
        error: unmatchedItems.length > 0
          ? `Pas de variant CJ pour: ${unmatchedItems.join(', ')}. Commandez manuellement sur app.cjdropshipping.com`
          : 'Aucun article CJ dans cette commande'
      };
    }

    // Create CJ order
    const result = await cjClient.createOrder({
      orderNumber: order.orderNumber,
      shippingCustomerName: order.shippingCustomerName,
      shippingPhone: order.shippingPhone || '',
      shippingAddress: order.shippingAddress,
      shippingAddress2: order.shippingAddress2 || undefined,
      houseNumber: order.shippingHouseNumber || undefined,
      shippingCity: order.shippingCity,
      shippingProvince: order.shippingProvince || order.shippingCity,
      shippingZip: order.shippingPostalCode || '',
      shippingCountry: order.shippingCountry,
      shippingCountryCode: order.shippingCountryCode || 'FR',
      email: order.customerEmail,
      remark: `Maloune ${order.orderNumber}`,
      products: products.map(p => ({ vid: p.vid, quantity: p.quantity })),
    });

    if (result.result && result.data) {
      const d = result.data as any;
      const cjOrderId = d.orderId || d.orderNum || '';
      const cjOrderNum = d.orderNum || d.orderId || '';
      
      await prisma.order.update({
        where: { id: orderId },
        data: {
          cjOrderId,
          cjOrderNum,
          status: 'PROCESSING' as any,
          internalNote: `CJ Order: ${cjOrderNum} | ${new Date().toISOString()}`,
        },
      });

      return { success: true, cjOrderId, cjOrderNum };
    } else {
      return { success: false, error: result.message || 'CJ API error' };
    }
  } catch (error: any) {
    console.error('CJ order error:', error);
    return { success: false, error: error.message || 'Erreur inconnue' };
  }
}

export async function getCJTracking(cjOrderNum: string) {
  try {
    const result = await cjClient.getTrackingInfo(cjOrderNum);
    return result.data;
  } catch { return null; }
}
