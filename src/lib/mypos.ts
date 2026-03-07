import crypto from 'crypto';

const MYPOS_SID = process.env.MYPOS_SID || '1306645';
const MYPOS_WALLET = process.env.MYPOS_WALLET || '40016394476';
const MYPOS_KEY_INDEX = process.env.MYPOS_KEY_INDEX || '1';
const MYPOS_CHECKOUT_URL = 'https://mypos.eu/vmp/checkout-test';
const MYPOS_CHECKOUT_URL_LIVE = 'https://mypos.eu/vmp/checkout';

const CHECKOUT_URL = process.env.MYPOS_LIVE === 'true' ? MYPOS_CHECKOUT_URL_LIVE : MYPOS_CHECKOUT_URL;

function getPrivateKey(): string {
  const b64Key = process.env.MYPOS_PRIVATE_KEY_B64;
  if (b64Key) {
    return Buffer.from(b64Key, 'base64').toString('utf-8');
  }
  let pk = process.env.MYPOS_PRIVATE_KEY || '';
  pk = pk.replace(/\\n/g, '\n');
  return pk;
}

export interface CartItem {
  name: string;
  quantity: number;
  price: number;
}

export interface CheckoutParams {
  orderId: string;
  currency?: string;
  cartItems: CartItem[];
  urlOk: string;
  urlCancel: string;
  urlNotify: string;
  customerEmail?: string;
}

function generateSignature(data: Record<string, string>): string {
  const privateKey = getPrivateKey();
  const concatenated = Object.values(data).join('-');

  const sign = crypto.createSign('SHA256');
  sign.update(concatenated);
  sign.end();

  return sign.sign(privateKey, 'base64');
}

export function createCheckoutForm(params: CheckoutParams): { url: string; fields: Record<string, string> } {
  const {
    orderId,
    currency = 'EUR',
    cartItems,
    urlOk,
    urlCancel,
    urlNotify,
    customerEmail = '',
  } = params;

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Build form data - exact order from myPOS docs
  const data: Record<string, string> = {};
  
  data['IPCmethod'] = 'IPCPurchase';
  data['IPCVersion'] = '1.4';
  data['IPCLanguage'] = 'fr';
  data['SID'] = MYPOS_SID;
  data['walletnumber'] = MYPOS_WALLET;
  data['Amount'] = totalAmount.toFixed(2);
  data['Currency'] = currency;
  data['OrderID'] = orderId;
  data['URL_OK'] = urlOk;
  data['URL_Cancel'] = urlCancel;
  data['URL_Notify'] = urlNotify;
  data['KeyIndex'] = MYPOS_KEY_INDEX;
  data['Source'] = 'NAP';
  data['CardTokenRequest'] = '0';
  data['PaymentParametersRequired'] = '3';
  data['PaymentMethod'] = '1';

  if (customerEmail) {
    data['customeremail'] = customerEmail;
  }

  data['Note'] = '';
  data['CartItems'] = cartItems.length.toString();

  // Add cart items
  cartItems.forEach((item, index) => {
    const idx = index + 1;
    data[`Article_${idx}`] = item.name.substring(0, 100);
    data[`Quantity_${idx}`] = item.quantity.toString();
    data[`Price_${idx}`] = item.price.toFixed(2);
    data[`Amount_${idx}`] = (item.price * item.quantity).toFixed(2);
    data[`Currency_${idx}`] = currency;
  });

  // Generate signature
  const privateKey = getPrivateKey();
  if (privateKey && privateKey.includes('PRIVATE KEY')) {
    data['Signature'] = generateSignature(data);
  }

  return { url: CHECKOUT_URL, fields: data };
}
// Build 1772852673
