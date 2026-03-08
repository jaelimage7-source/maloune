import { createOrder as createPrintfulOrder } from '@/lib/printful';

interface PrintfulOrderParams {
  orderNumber: string;
  items: {
    name: string;
    quantity: number;
    productId?: string;
  }[];
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    zip: string;
    country: string;
  };
}

// Check if a product is from Printful (ID starts with "printful-")
function isPrintfulItem(item: { name: string; productId?: string }): boolean {
  return !!(item.productId && item.productId.startsWith('printful-'));
}

export async function processPrintfulItems(params: PrintfulOrderParams) {
  const printfulItems = params.items.filter(isPrintfulItem);
  
  if (printfulItems.length === 0) {
    console.log('No Printful items in order', params.orderNumber);
    return null;
  }

  console.log(`Processing ${printfulItems.length} Printful items for order ${params.orderNumber}`);

  try {
    // Build Printful order
    const printfulOrder = {
      external_id: params.orderNumber,
      shipping: 'STANDARD',
      recipient: {
        name: `${params.shipping.firstName} ${params.shipping.lastName}`,
        email: params.shipping.email,
        phone: params.shipping.phone || '',
        address1: params.shipping.address,
        city: params.shipping.city,
        zip: params.shipping.zip,
        country_code: params.shipping.country,
      },
      items: printfulItems.map(item => {
        // Extract Printful sync variant ID from productId (format: "printful-{id}")
        const syncProductId = item.productId?.replace('printful-', '');
        return {
          sync_variant_id: parseInt(syncProductId || '0'),
          quantity: item.quantity,
        };
      }),
    };

    // Create order on Printful (confirm=true to auto-send to production)
    const result = await createPrintfulOrder(printfulOrder, true);
    console.log('Printful order created:', result?.id);
    return result;
  } catch (error) {
    console.error('Printful order error:', error);
    // Don't throw — we don't want to fail the webhook
    return null;
  }
}
