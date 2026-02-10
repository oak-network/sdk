import { ApiResponse } from "./common";
import { PaymentMethod } from "./paymentMethod";

export namespace Payment {
  // ----------------------------------------
  // Common
  // ----------------------------------------
  export interface CustomerRef {
    id: string;
  }

  export interface Metadata {
    [key: string]: any;
  }

  export interface FraudCheckData {
    last_four_digits?: string;
    card_expiration_date?: string;
    card_holder_name?: string;
  }

  export interface FraudCheckConfig {
    threshold?: "low" | "medium" | "high";
    sequence?: "fraud_before_auth" | "fraud_after_auth";
    action_on_fail?: "reject" | "review";
  }

  export interface FraudCheck {
    enabled: boolean;
    provider?: string;
    config?: FraudCheckConfig;
    data?: FraudCheckData;
  }

  export interface ProviderResponse {
    [key: string]: any;
  }

  export interface PaymentMethod {
    type: "card";
    id?: string;
  }

  export interface Source {
    amount: number;
    currency: string;
    customer?: CustomerRef;
    payment_method: PaymentMethod;
    installments?: number;
    float_rate?: number;
    capture_method: "automatic";
    fraud_check?: FraudCheck;
  }

  // ----------------------------------------
  // Create payment (provider-specific requests)
  // ----------------------------------------
  export interface MercadoPagoRequest {
    provider: "mercado_pago";
    source: {
      amount: number;
      currency: "COP";
      customer: {
        id: string; // UUID
      };
      payment_method: {
        type: "card";
        card_token: string;
      };
      capture_method: "automatic";
    };
    confirm?: boolean;
    metadata?: Record<string, string>;
  }

  export interface PagarMeRequest {
    provider: "pagar_me";
    source: {
      amount: number;
      currency: "BRL";
      customer: {
        id: string; // UUID
      };
      payment_method: {
        type: "card";
        id?: string; // if present, card_token and billing_address are forbidden
        card_token?: string; // required when id is absent
        billing_address?: {
          house_number: string;
          street_number: string;
          street_name: string;
          postal_code: string;
          city: string;
          state: string;
          country_code: string;
        }; // required when id is absent
      };
      capture_method: "automatic" | "manual"; // from CARD_CAPTURE_METHOD
      fraud_check: {
        enabled: boolean;
        provider?: "konduto"; // required when enabled=true
        config?: {
          sequence: string; // from FRAUD_SEQUENCE keys
          threshold: string;
        }; // required when enabled=true
        data?: {
          last_four_digits: string; // length 4
          card_expiration_date: string; // pattern MM/YYYY
          card_holder_name: string;
        }; // required when enabled=true
      };
    };
    total_installments?: number; // integer, min 1
    confirm?: boolean;
    metadata?: Record<string, string>;
  }

  export interface StripeRequest {
    provider: "stripe";
    source: {
      amount: number;
      currency: string;
      customer?: { id?: string };
      payment_method: {
        type: "card";
        id?: string;
      };
      installments?: number;
      float_rate?: number;
      capture_method: "automatic";
      fraud_check?: { enabled: false };
    };
    destination?: {
      amount?: number;
      currency?: "usd";
      customer?: { id?: string };
    };
    fee?: {
      bearer: "platform" | "connected_account";
    };
    flow?: "platform" | "destination";
    allocations?: Array<{
      type?: string;
      receiver: {
        type?: "platform" | "connected_account";
        id?: string;
      };
      amount: number;
    }>;
    confirm?: boolean;
    metadata?: Record<string, string>;
  }

  export type Request = MercadoPagoRequest | PagarMeRequest | StripeRequest;

  // ----------------------------------------
  // Payment responses (create / confirm / cancel)
  // ----------------------------------------
  export type Transaction = Request & {
    id: string;
    status: string;
    type: "payment";
    created_at: string;
    updated_at: string;
    provider_response?: ProviderResponse;
  };

  export type Response = ApiResponse<Transaction>;

  export interface ListMethodsQuery {
    type?: string;
    status?: string;
    platform?: string;
  }

  export interface DeleteMethodResponse {
    msg: string;
  }
}
