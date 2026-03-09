import cjClient from '@/lib/cj-client';
import { prisma } from '@/lib/prisma';

interface CJOrderResult {
  success: boolean;
  cjOrderId?: string;
  cjOrderNum?: string;
  error?: string;
}

/**
 * Check if an order item is from CJ Dropshipping
 * Items with cjVariantId or productId starting with a CJ product pattern
 */
function isCJItem(item: any): boolean {
  return !!(item.cjVariantId || item.variantId || (item.productId && !item.productId.startsWith('printful-')));
}

/**
 * Create a CJ Dropshipping order from a MALOUNE order
 */
export async function processCJOrder(orderId: string): Promise<CJOrderResult> {
  try {
    // Get order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: 'Commande introuvable' };
    }

    // Filter CJ items
    const cjItems = order.items.filter(isCJItem);
    
    if (cjItems.length === 0) {
      return { success: false, error: 'Aucun article CJ dans cette commande' };
    }

    // Build CJ products array
    const products = cjItems.map(item => ({
      vid: item.cjVariantId || item.variantId || '',
      quantity: item.quantity,
    })).filter(p => p.vid);

    if (products.length === 0) {
      // Fallback: try to find variants by product name/SKU
      console.warn('No CJ variant IDs found for order', order.orderNumber);
      return { success: false, error: 'Pas de variant CJ (vid) - commandez manuellement sur app.cjdropshipping.com' };
    }

    // Parse name
    const nameParts = order.shippingCustomerName.split(' ');

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
      remark: `Maloune order ${order.orderNumber}`,
      products,
    });

    if (result.result && result.data) {
      // Save CJ order ID to our DB
      const cjOrderId = result.data.orderId || result.data.orderNum || '';
      const cjOrderNum = result.data.orderNum || result.data.orderId || '';
      
      await prisma.order.update({
        where: { id: orderId },
        data: {
          cjOrderId,
          cjOrderNum,
          status: 'PROCESSING' as any,
          internalNote: `CJ Order: ${cjOrderNum} | ${new Date().toISOString()}`,
        },
      });

      console.log(`CJ order created: ${cjOrderNum} for ${order.orderNumber}`);
      return { success: true, cjOrderId, cjOrderNum };
    } else {
      const errorMsg = result.message || 'CJ API error';
      console.error('CJ order failed:', errorMsg);
      return { success: false, error: errorMsg };
    }
  } catch (error: any) {
    console.error('CJ order error:', error);
    return { success: false, error: error.message || 'Erreur inconnue' };
  }
}

/**
 * Get CJ tracking info for an order
 */
export async function getCJTracking(cjOrderNum: string) {
  try {
    const result = await cjClient.getTrackingInfo(cjOrderNum);
    return result.data;
  } catch (error) {
    console.error('CJ tracking error:', error);
    return null;
  }
}
