import crypto from 'crypto';

const MYPOS_SID = process.env.MYPOS_SID || '1306645';
const MYPOS_WALLET = process.env.MYPOS_WALLET || '40016394476';
const MYPOS_KEY_INDEX = process.env.MYPOS_KEY_INDEX || '1';
const MYPOS_CHECKOUT_URL = 'https://mypos.eu/vmp/checkout-test';
const MYPOS_CHECKOUT_URL_LIVE = 'https://mypos.eu/vmp/checkout';

const CHECKOUT_URL = process.env.MYPOS_LIVE === 'true' ? MYPOS_CHECKOUT_URL_LIVE : MYPOS_CHECKOUT_URL;

function getPrivateKey(): string {
  // Try base64 encoded key first (most reliable for env vars)
  const b64Key = process.env.MYPOS_PRIVATE_KEY_B64;
  if (b64Key) {
    return Buffer.from(b64Key, 'base64').toString('utf-8');
  }
  // Fallback to direct key with newline replacement
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
  amount: number;
  currency?: string;
  cartItems: CartItem[];
  urlOk: string;
  urlCancel: string;
  urlNotify: string;
  customerEmail?: string;
  expirationDays?: number;
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
    expirationDays = 1,
  } = params;

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const data: Record<string, string> = {
    IPCmethod: 'IPCPurchase',
    IPCVersion: '1.4',
    IPCLanguage: 'fr',
    SID: MYPOS_SID,
    WalletNumber: MYPOS_WALLET,
    KeyIndex: MYPOS_KEY_INDEX,
    Source: 'NAP',
    Currency: currency,
    Amount: totalAmount.toFixed(2),
    OrderID: orderId,
    URL_OK: urlOk,
    URL_Cancel: urlCancel,
    URL_Notify: urlNotify,
    CustomerEmail: customerEmail,
    Note: '',
    CartItems: cartItems.length.toString(),
  };

  cartItems.forEach((item, index) => {
    const idx = index + 1;
    data[`Article_${idx}`] = item.name;
    data[`Quantity_${idx}`] = item.quantity.toString();
    data[`Price_${idx}`] = item.price.toFixed(2);
    data[`Amount_${idx}`] = (item.price * item.quantity).toFixed(2);
    data[`Currency_${idx}`] = currency;
  });

  const expDate = new Date();
  expDate.setDate(expDate.getDate() + expirationDays);
  data['Expiration'] = expDate.toISOString().replace('T', ' ').substring(0, 19);

  const privateKey = getPrivateKey();
  if (privateKey && privateKey.includes('PRIVATE KEY')) {
    data['Signature'] = generateSignature(data);
  }

  return { url: CHECKOUT_URL, fields: data };
}

export function verifyNotification(postData: Record<string, string>, publicCert: string): boolean {
  try {
    const signature = postData['Signature'];
    if (!signature) return false;

    const dataWithoutSignature = { ...postData };
    delete dataWithoutSignature['Signature'];

    const concatenated = Object.values(dataWithoutSignature).join('-');
    const verify = crypto.createVerify('SHA256');
    verify.update(concatenated);
    verify.end();

    return verify.verify(publicCert, signature, 'base64');
  } catch {
    return false;
  }
}
