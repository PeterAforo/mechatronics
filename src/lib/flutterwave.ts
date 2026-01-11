import crypto from "crypto";

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY || "";
const FLW_PUBLIC_KEY = process.env.FLW_PUBLIC_KEY || "";
const FLW_ENCRYPTION_KEY = process.env.FLW_ENCRYPTION_KEY || "";
const FLW_BASE_URL = "https://api.flutterwave.com/v3";

export interface FlutterwaveInitializeResponse {
  status: string;
  message: string;
  data: {
    link: string;
  };
}

export interface FlutterwaveVerifyResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
    meta: Record<string, unknown>;
  };
}

export interface FlutterwaveInitializeParams {
  tx_ref: string;
  amount: number;
  currency?: string;
  redirect_url: string;
  customer: {
    email: string;
    phone_number?: string;
    name?: string;
  };
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  meta?: Record<string, unknown>;
  payment_options?: string;
}

class FlutterwaveClient {
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.secretKey = FLW_SECRET_KEY;
    this.baseUrl = FLW_BASE_URL;
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

    if (!response.ok || data.status === "error") {
      throw new Error(data.message || "Flutterwave API error");
    }

    return data as T;
  }

  // Initialize a payment
  async initializePayment(params: FlutterwaveInitializeParams): Promise<FlutterwaveInitializeResponse> {
    return this.request<FlutterwaveInitializeResponse>("/payments", "POST", {
      tx_ref: params.tx_ref,
      amount: params.amount,
      currency: params.currency || "GHS",
      redirect_url: params.redirect_url,
      customer: params.customer,
      customizations: params.customizations || {
        title: "Mechatronics",
        description: "IoT Device Purchase",
        logo: "https://mechatronics.com.gh/logo.png",
      },
      meta: params.meta,
      payment_options: params.payment_options || "card,mobilemoney,ussd,banktransfer",
    });
  }

  // Verify a transaction
  async verifyTransaction(transactionId: string): Promise<FlutterwaveVerifyResponse> {
    return this.request<FlutterwaveVerifyResponse>(`/transactions/${transactionId}/verify`);
  }

  // Verify by tx_ref
  async verifyByTxRef(txRef: string): Promise<FlutterwaveVerifyResponse> {
    return this.request<FlutterwaveVerifyResponse>(`/transactions/verify_by_reference?tx_ref=${txRef}`);
  }

  // Get transaction by ID
  async getTransaction(transactionId: string) {
    return this.request(`/transactions/${transactionId}`);
  }

  // Verify webhook signature
  verifyWebhookSignature(signature: string): boolean {
    const secretHash = process.env.FLW_SECRET_HASH || "";
    return signature === secretHash;
  }

  // Generate a unique reference
  static generateReference(prefix = "MEC"): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }

  // Get public key for frontend
  static getPublicKey(): string {
    return FLW_PUBLIC_KEY;
  }

  // Get encryption key
  static getEncryptionKey(): string {
    return FLW_ENCRYPTION_KEY;
  }
}

export const flutterwave = new FlutterwaveClient();
export default flutterwave;
