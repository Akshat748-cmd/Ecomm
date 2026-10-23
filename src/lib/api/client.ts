// Typed API Client for Precious Commerce Backend

const BASE_URL = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('precious_admin_token') || sessionStorage.getItem('precious_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errBody: any;
    try {
      errBody = await res.json();
    } catch {
      errBody = { message: res.statusText };
    }
    const err = new Error(errBody.message || `Request failed with status ${res.status}`) as any;
    err.status = res.status;
    err.details = errBody;
    throw err;
  }

  return res.json();
}

export const api = {
  // Public Bullion Rates & Feeds
  rates: {
    get: () => fetchJson<{ rates: any; providerState: string; pricingConfig: any }>('/rates'),
  },

  // Public Catalog & Certificates
  products: {
    list: (category?: string, query?: string) => {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (query) params.append('q', query);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      return fetchJson<{ products: any[]; total: number }>(`/products${queryStr}`);
    },
    getBySlug: (slug: string) => fetchJson<{ product: any }>(`/products/slug/${slug}`),
    getById: (id: string) => fetchJson<{ product: any }>(`/products/id/${id}`),
  },

  certificates: {
    verify: (certNo: string) => fetchJson<{ verified: boolean; certificate?: any; message?: string }>(`/certificates/${certNo}`),
  },

  // 10-Minute Rate Quote Locks
  quotes: {
    lock: (productId: string, quantity: number, customerId?: string) =>
      fetchJson<{ message: string; quote: any }>('/quotes/lock', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity, customerId }),
      }),
    get: (id: string) => fetchJson<{ quote: any; isExpired: boolean; remainingSeconds: number }>(`/quotes/${id}`),
    requote: (id: string) => fetchJson<{ message: string; quote: any }>(`/quotes/${id}/requote`, { method: 'POST' }),
  },

  // Logistics & Pincode Checker
  logistics: {
    checkPincode: (pincode: string) =>
      fetchJson<{
        serviceable: boolean;
        pincode: string;
        message: string;
        supportedCouriers: string[];
        insuranceCoverage?: string;
        estimatedTransitDays?: number | null;
        estimatedDeliveryDate?: string;
      }>('/logistics/pincode-check', {
        method: 'POST',
        body: JSON.stringify({ pincode }),
      }),
  },

  // Checkout & Orders
  orders: {
    create: (orderPayload: {
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      shippingAddress: any;
      items: any[];
      paymentMethod: string;
      panNumber?: string;
    }) =>
      fetchJson<{ message: string; order: any }>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      }),
    get: (id: string) => fetchJson<{ order: any }>(`/orders/${id}`),
  },

  // Payments & Webhooks
  payments: {
    createSession: (orderId: string, amount: number) =>
      fetchJson<any>('/payments/session', {
        method: 'POST',
        body: JSON.stringify({ orderId, amount }),
      }),
    triggerWebhook: (event: string, transactionId: string, payload: any, idempotencyKey?: string) =>
      fetchJson<any>('/payments/webhook', {
        method: 'POST',
        headers: idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : undefined,
        body: JSON.stringify({ event, transactionId, payload, idempotencyKey }),
      }),
  },

  // Corporate Gifting
  corporate: {
    submitEnquiry: (data: {
      companyName: string;
      contactName: string;
      email: string;
      phone: string;
      gstin?: string;
      occasion: string;
      budgetPerRecipient: number;
      recipientCount: number;
      productPreferences?: string;
      deliverySchedule?: string;
      customizationNotes?: string;
    }) =>
      fetchJson<{ message: string; enquiry: any }>('/corporate/enquiries', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Admin APIs
  admin: {
    auth: {
      login: (email: string, password: string) =>
        fetchJson<{ requiresMfa: boolean; email: string; tempToken: string }>('/admin/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }),
      verifyMfa: (email: string, code: string, tempToken: string) =>
        fetchJson<{ token: string; user: any }>('/admin/auth/mfa', {
          method: 'POST',
          body: JSON.stringify({ email, code, tempToken }),
        }),
      getProfile: () => fetchJson<{ user: any }>('/admin/auth/profile'),
    },
    orders: {
      list: () => fetchJson<{ orders: any[]; total: number }>('/admin/orders'),
      updateStatus: (id: string, status: string, note?: string) =>
        fetchJson<{ message: string; order: any }>(`/admin/orders/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status, note }),
        }),
      attachInvoice: (id: string, invoiceNumber: string, invoiceUrl?: string) =>
        fetchJson<{ message: string; order: any }>(`/admin/orders/${id}/invoice`, {
          method: 'POST',
          body: JSON.stringify({ invoiceNumber, invoiceUrl }),
        }),
    },
    rates: {
      propose: (gold24k: number, silver999: number, justification: string) =>
        fetchJson<{ message: string; request: any }>('/admin/rates/propose', {
          method: 'POST',
          body: JSON.stringify({ gold24k, silver999, justification }),
        }),
      resolve: (id: string, decision: 'Approved' | 'Rejected', password: string) =>
        fetchJson<{ message: string; item: any; updatedRates?: any }>(`/admin/rates/resolve/${id}`, {
          method: 'POST',
          body: JSON.stringify({ decision, password }),
        }),
      failover: (state: 'ok' | 'primaryFailed' | 'bothDown') =>
        fetchJson<{ message: string; state: string }>('/admin/rates/failover', {
          method: 'POST',
          body: JSON.stringify({ state }),
        }),
      updateFormula: (formulaData: any) =>
        fetchJson<{ message: string; config: any }>('/admin/rates/formula', {
          method: 'POST',
          body: JSON.stringify(formulaData),
        }),
    },
    products: {
      create: (productData: any) =>
        fetchJson<{ product: any }>('/admin/products', {
          method: 'POST',
          body: JSON.stringify(productData),
        }),
      update: (id: string, updates: any) =>
        fetchJson<{ product: any }>(`/admin/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        }),
    },
    inventory: {
      list: () => fetchJson<{ products: any[]; summary: any }>('/admin/inventory'),
      action: (productId: string, action: string, delta: number, notes?: string) =>
        fetchJson<{ message: string; product: any }>('/admin/inventory/action', {
          method: 'POST',
          body: JSON.stringify({ productId, action, delta, notes }),
        }),
    },
    corporate: {
      list: () => fetchJson<{ enquiries: any[]; total: number }>('/admin/corporate/enquiries'),
      generateQuote: (id: string, quoteData: any) =>
        fetchJson<{ message: string; enquiry: any }>(`/admin/corporate/enquiries/${id}/quote`, {
          method: 'POST',
          body: JSON.stringify(quoteData),
        }),
      approveQuote: (id: string, approvedByClient?: string, remarks?: string) =>
        fetchJson<{ message: string; enquiry: any }>(`/admin/corporate/enquiries/${id}/approve`, {
          method: 'POST',
          body: JSON.stringify({ approvedByClient, remarks }),
        }),
      importRecipients: (id: string, recipients: any[]) =>
        fetchJson<{ message: string; count: number; enquiry: any }>(`/admin/corporate/enquiries/${id}/recipients`, {
          method: 'POST',
          body: JSON.stringify({ recipients }),
        }),
    },
    compliance: {
      list: () => fetchJson<{ checklist: any[]; total: number }>('/admin/compliance'),
      toggle: (id: string, isCompliant: boolean) =>
        fetchJson<{ message: string; item: any }>(`/admin/compliance/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ isCompliant }),
        }),
    },
    audit: {
      list: () => fetchJson<{ logs: any[]; total: number }>('/admin/audit'),
    },
    makerChecker: {
      list: () => fetchJson<{ queue: any[]; total: number }>('/admin/maker-checker'),
    },
  },
};
