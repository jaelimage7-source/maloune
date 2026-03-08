import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateOrderStatus, createPaymentRecord, getOrderByNumber } from '@/lib/services/order.service';
import { sendOrderConfirmation, sendAdminNotification } from '@/lib/services/email.service';
import { processPrintfulItems } from '@/lib/services/printful-order.service';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function getPublicCert(): string {
  const b64Key = process.env.MYPOS_PUBLIC_CERT_B64;
  if (b64Key) return Buffer.from(b64Key, 'base64').toString('utf-8');
  return '';
}

function verifySignature(data: Record<string, string>): boolean {
  try {
    const publicCert = getPublicCert();
    if (!publicCert) return false;
    const signature = data['Signature'];
    if (!signature) return false;
    const dataWithoutSig = { ...data };
    delete dataWithoutSig['Signature'];
    const payload = Object.values(dataWithoutSig).join('-');
    const concData = Buffer.from(payload).toString('base64');
    const key = publicCert.trim().split('\n').map(x => x.trim()).join('\n');
    const verifier = crypto.createVerify('SHA256');
    verifier.update(concData);
    return verifier.verify(key, signature, 'base64');
  } catch (e) {
    console.error('Signature verification error:', e);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const isValid = verifySignature(data);
    const orderNumber = data.OrderID || '';
    const amount = data.Amount || '0';
    const status = data.IPCmethod || data.Status || '';

    console.log('=== myPOS Webhook ===');
    console.log('Order:', orderNumber, '| Amount:', amount, '| Status:', status, '| Valid:', isValid);

    // Only process valid confirmed payments
    if (!isValid) {
      console.warn('Invalid signature — ignoring');
      return new NextResponse('OK', { status: 200 });
    }

    // Check if this is a successful payment (IPCmethod = IPCPurchaseOK)
    if (status !== 'IPCPurchaseOK' && status !== 'IPCPurchaseComplete') {
      console.log('Not a successful payment, status:', status);
      return new NextResponse('OK', { status: 200 });
    }

    // 1. Update order status to PAID
    let order;
    try {
      order = await updateOrderStatus(orderNumber, 'PAID');
      console.log('Order updated to PAID:', orderNumber);
    } catch (e) {
      console.error('Order update error:', e);
      // Try to get order anyway
      try {
        order = await getOrderByNumber(orderNumber);
      } catch { /* ignore */ }
    }

    // 2. Save payment record
    if (order) {
      try {
        await createPaymentRecord(order.id, data);
        console.log('Payment record saved');
      } catch (e) {
        console.error('Payment record error:', e);
      }
    }

    // 3. Send emails
    if (order) {
      const emailData = {
        orderNumber,
        customerName: order.shippingCustomerName,
        customerEmail: order.customerEmail,
        items: order.items.map((i: any) => ({
          name: i.productName,
          quantity: i.quantity,
          price: Number(i.unitPrice),
        })),
        subtotal: Number(order.subtotal),
        shipping: Number(order.shippingCost),
        total: Number(order.totalAmount),
        shippingAddress: order.shippingAddress,
        shippingCity: order.shippingCity,
        shippingZip: order.shippingPostalCode || '',
        shippingCountry: order.shippingCountry,
      };

      // Send customer confirmation email
      await sendOrderConfirmation(emailData);

      // Send admin notification
      await sendAdminNotification(emailData);

      console.log('Emails sent for order:', orderNumber);
    }

    // 4. Process Printful items (if any)
    if (order) {
      try {
        // Parse shipping info from order
        const nameParts = order.shippingCustomerName.split(' ');
        await processPrintfulItems({
          orderNumber,
          items: order.items.map((i: any) => ({
            name: i.productName,
            quantity: i.quantity,
            productId: i.productId || undefined,
          })),
          shipping: {
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: order.customerEmail,
            phone: order.shippingPhone || '',
            address: order.shippingAddress,
            city: order.shippingCity,
            zip: order.shippingPostalCode || '',
            country: order.shippingCountryCode || order.shippingCountry,
          },
        });
      } catch (e) {
        console.error('Printful processing error:', e);
      }
    }

    return new NextResponse('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('OK', { status: 200 });
  }
}
