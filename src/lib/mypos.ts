import crypto from 'crypto';

const MYPOS_SID = process.env.MYPOS_SID || '1306645';
const MYPOS_WALLET = process.env.MYPOS_WALLET || '40016394476';
const MYPOS_KEY_INDEX = process.env.MYPOS_KEY_INDEX || '1';
const MYPOS_CHECKOUT_URL = 'https://www.mypos.com/vmp/checkout-test';
const MYPOS_CHECKOUT_URL_LIVE = 'https://www.mypos.com/vmp/checkout';

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

function generateSignature(postData: Record<string, string>): string {
  const privateKey = getPrivateKey();
  
  // Step 1: Concatenate all values with dash
  const concatenated = Object.values(postData).join('-');
  
  // Step 2: Base64 encode the concatenated string (this is the key fix!)
  const base64Concatenated = Buffer.from(concatenated).toString('base64');
  
  // Step 3: Sign with RSA-SHA256
  const sign = crypto.createSign('SHA256');
  sign.update(base64Concatenated);
  sign.end();
  
  // Step 4: Base64 encode the signature
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
  } = params;

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Build form data - EXACT order from myPOS PHP example
  const data: Record<string, string> = {};
  
  data['IPCmethod'] = 'IPCPurchase';
  data['IPCVersion'] = '1.4';
  data['IPCLanguage'] = 'fr';
  data['SID'] = MYPOS_SID;
  data['WalletNumber'] = MYPOS_WALLET;
  data['Amount'] = totalAmount.toFixed(2);
  data['Currency'] = currency;
  data['OrderID'] = orderId;
  data['URL_OK'] = urlOk;
  data['URL_Cancel'] = urlCancel;
  data['URL_Notify'] = urlNotify;
  data['CardTokenRequest'] = '0';
  data['KeyIndex'] = MYPOS_KEY_INDEX;
  data['PaymentParametersRequired'] = '3';
  data['PaymentMethod'] = '1';
  data['Note'] = '';
  data['Source'] = 'MALOUNE';
  data['CartItems'] = cartItems.length.toString();

  // Add cart items
  cartItems.forEach((item, index) => {
    const idx = index + 1;
    data[`Article_${idx}`] = item.name.substring(0, 100);
    data[`Quantity_${idx}`] = item.quantity.toString();
    data[`Price_${idx}`] = item.price.toFixed(2);
    data[`Currency_${idx}`] = currency;
    data[`Amount_${idx}`] = (item.price * item.quantity).toFixed(2);
  });

  // Generate signature LAST
  const privateKey = getPrivateKey();
  if (privateKey && privateKey.includes('PRIVATE KEY')) {
    data['Signature'] = generateSignature(data);
  }

  return { url: CHECKOUT_URL, fields: data };
}
