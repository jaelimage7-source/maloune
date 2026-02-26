/**
 * CJ Dropshipping API V2.0 Client
 * Documentation: https://developers.cjdropshipping.cn/en/api/api2/
 */

const CJ_API_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';

interface CJResponse<T = any> {
  code: number;
  result: boolean;
  message: string;
  data: T;
  requestId: string;
}

class CJDropshippingClient {
  private accessToken: string | null = null;

  // ---- Authentication ----
  async getAccessToken(): Promise<string> {
    const res = await fetch(`${CJ_API_BASE}/authentication/getAccessToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.CJ_API_EMAIL,
        password: process.env.CJ_API_PASSWORD,
      }),
    });
    const data: CJResponse = await res.json();
    if (data.code === 200) {
      this.accessToken = data.data.accessToken;
      return data.data.accessToken;
    }
    throw new Error(`CJ Auth failed: ${data.message}`);
  }

  private async request<T>(endpoint: string, method: string = 'GET', body?: any): Promise<CJResponse<T>> {
    if (!this.accessToken) {
      this.accessToken = process.env.CJ_ACCESS_TOKEN || await this.getAccessToken();
    }

    const options: RequestInit = {
      method,
      headers: {
        'CJ-Access-Token': this.accessToken!,
        'Content-Type': 'application/json',
      },
    };

    if (body && method === 'POST') {
      options.body = JSON.stringify(body);
    }

    const url = method === 'GET' && body
      ? `${CJ_API_BASE}${endpoint}?${new URLSearchParams(body).toString()}`
      : `${CJ_API_BASE}${endpoint}`;

    const res = await fetch(url, options);
    const data: CJResponse<T> = await res.json();

    // Token expiré → re-auth
    if (data.code === 1600200) {
      this.accessToken = await this.getAccessToken();
      return this.request<T>(endpoint, method, body);
    }

    return data;
  }

  // ---- Products ----
  async getCategories() {
    return this.request('/product/getCategory');
  }

  async searchProducts(params: {
    keyWord?: string;
    page?: number;
    size?: number;
    categoryId?: string;
    countryCode?: string;
    productFlag?: number; // 0=Trending, 1=New, 2=Video
    orderBy?: number;     // 0=best match, 2=sell price, 3=create time
    sort?: string;        // desc, asc
  }) {
    return this.request('/product/listV2', 'GET', params);
  }

  async getProductDetails(pid: string) {
    return this.request(`/product/query`, 'GET', { pid });
  }

  async getProductVariants(pid: string) {
    return this.request(`/product/variant/query`, 'GET', { pid });
  }

  async addToMyProducts(productId: string) {
    return this.request('/product/addToMyProduct', 'POST', { productId });
  }

  async getMyProducts(params?: { keyword?: string; pageNum?: number; pageSize?: number }) {
    return this.request('/product/myProduct/query', 'GET', params);
  }

  // ---- Inventory ----
  async checkInventory(vid: string) {
    return this.request('/product/stock', 'GET', { vid });
  }

  async checkInventoryBySku(sku: string) {
    return this.request('/product/stock/queryBySku', 'GET', { sku });
  }

  // ---- Orders ----
  async createOrder(orderData: {
    orderNumber: string;
    shippingZip: string;
    shippingCountry: string;
    shippingCountryCode: string;
    shippingProvince: string;
    shippingCity: string;
    shippingPhone: string;
    shippingCustomerName: string;
    shippingAddress: string;
    shippingAddress2?: string;
    houseNumber?: string;
    email?: string;
    remark?: string;
    logisticName?: string;
    fromCountryCode?: string;
    products: Array<{
      vid: string;
      quantity: number;
    }>;
  }) {
    return this.request('/shopping/order/createOrderV2', 'POST', orderData);
  }

  async getOrderList(params?: { pageNum?: number; pageSize?: number; orderStatus?: string }) {
    return this.request('/shopping/order/list', 'GET', params);
  }

  async getOrderDetail(orderId: string) {
    return this.request('/shopping/order/getOrderDetail', 'GET', { orderId });
  }

  // ---- Logistics ----
  async getTrackingInfo(orderNum: string) {
    return this.request('/logistic/trackInfo', 'GET', { orderNum });
  }

  async getShippingMethods(params: {
    startCountryCode: string;
    endCountryCode: string;
    products: Array<{ quantity: number; vid: string }>;
  }) {
    return this.request('/logistic/freightCalculate', 'POST', params);
  }

  // ---- Warehouses ----
  async getWarehouses() {
    return this.request('/product/globalWarehouseList');
  }
}

export const cjClient = new CJDropshippingClient();
export default cjClient;
