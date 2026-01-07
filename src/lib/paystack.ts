import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || "";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    paid_at: string;
    customer: {
      id: number;
      email: string;
      customer_code: string;
      phone: string | null;
    };
    authorization: {
      authorization_code: string;
      card_type: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      bin: string;
      bank: string;
      channel: string;
      reusable: boolean;
    };
    metadata: Record<string, unknown>;
  };
}

export interface PaystackCustomer {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface PaystackInitializeParams {
  email: string;
  amount: number; // in pesewas (kobo)
  currency?: string;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
  channels?: string[];
}

export interface PaystackSubscriptionParams {
  customer: string; // customer email or code
  plan: string; // plan code
  authorization?: string; // authorization code for recurring
  start_date?: string;
}

export interface PaystackPlanParams {
  name: string;
  amount: number; // in pesewas
  interval: "hourly" | "daily" | "weekly" | "monthly" | "quarterly" | "biannually" | "annually";
  currency?: string;
  description?: string;
}

class PaystackClient {
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.secretKey = PAYSTACK_SECRET_KEY;
    this.baseUrl = PAYSTACK_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Paystack API error");
    }

    return data as T;
  }

  // Initialize a transaction
  async initializeTransaction(params: PaystackInitializeParams): Promise<PaystackInitializeResponse> {
    return this.request<PaystackInitializeResponse>("/transaction/initialize", "POST", {
      email: params.email,
      amount: params.amount,
      currency: params.currency || "GHS",
      reference: params.reference,
      callback_url: params.callback_url,
      metadata: params.metadata,
      channels: params.channels || ["card", "mobile_money", "bank"],
    });
  }

  // Verify a transaction
  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    return this.request<PaystackVerifyResponse>(`/transaction/verify/${reference}`);
  }

  // Create a customer
  async createCustomer(customer: PaystackCustomer) {
    return this.request("/customer", "POST", customer as unknown as Record<string, unknown>);
  }

  // Create a subscription plan
  async createPlan(params: PaystackPlanParams) {
    return this.request("/plan", "POST", {
      name: params.name,
      amount: params.amount,
      interval: params.interval,
      currency: params.currency || "GHS",
      description: params.description,
    });
  }

  // Create a subscription
  async createSubscription(params: PaystackSubscriptionParams) {
    return this.request("/subscription", "POST", params as unknown as Record<string, unknown>);
  }

  // Get subscription
  async getSubscription(idOrCode: string) {
    return this.request(`/subscription/${idOrCode}`);
  }

  // Disable subscription
  async disableSubscription(code: string, token: string) {
    return this.request("/subscription/disable", "POST", { code, token });
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac("sha512", this.secretKey)
      .update(payload)
      .digest("hex");
    return hash === signature;
  }

  // Generate a unique reference
  static generateReference(prefix = "MEC"): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }

  // Get public key for frontend
  static getPublicKey(): string {
    return PAYSTACK_PUBLIC_KEY;
  }
}

export const paystack = new PaystackClient();
export default paystack;
