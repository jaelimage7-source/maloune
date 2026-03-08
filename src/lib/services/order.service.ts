import { prisma } from '@/lib/prisma';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  productId?: string;
  variantId?: string;
}

interface CreateOrderParams {
  orderId: string;
  items: OrderItem[];
  shipping: ShippingInfo;
  locale?: string;
  totalAmount: number;
  currency?: string;
}

export async function createOrder(params: CreateOrderParams) {
  const { orderId, items, shipping, locale = 'fr', totalAmount, currency = 'EUR' } = params;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal > 50 ? 0 : 4.99;

  const order = await prisma.order.create({
    data: {
      orderNumber: orderId,
      customerEmail: shipping.email,
      shippingCustomerName: `${shipping.firstName} ${shipping.lastName}`,
      shippingPhone: shipping.phone || null,
      shippingAddress: shipping.address,
      shippingCity: shipping.city,
      shippingPostalCode: shipping.zip,
      shippingCountry: shipping.country,
      shippingCountryCode: shipping.country,
      subtotal,
      shippingCost,
      totalAmount,
      currency: currency === 'EUR' ? 'EUR' : 'EUR',
      status: 'PENDING',
      locale: locale === 'fr' ? 'fr' : locale === 'ht' ? 'ht' : 'en',
      items: {
        create: items.map((item) => ({
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          productImageUrl: item.image || null,
          productId: item.productId || null,
          variantId: item.variantId || null,
        })),
      },
    },
    include: { items: true },
  });

  return order;
}

export async function updateOrderStatus(orderNumber: string, status: string) {
  return prisma.order.update({
    where: { orderNumber },
    data: {
      status: status as any,
      ...(status === 'PAID' ? { updatedAt: new Date() } : {}),
    },
    include: { items: true },
  });
}

export async function createPaymentRecord(orderId: string, paymentData: Record<string, string>) {
  return prisma.payment.create({
    data: {
      orderId,
      provider: 'MYPOS',
      amount: parseFloat(paymentData.Amount || '0'),
      currency: 'EUR',
      status: 'SUCCEEDED',
      paidAt: new Date(),
      providerResponse: paymentData,
    },
  });
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, payments: true },
  });
}
