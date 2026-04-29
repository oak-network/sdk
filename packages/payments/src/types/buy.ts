import { ApiResponse } from "./common";

export namespace Buy {
  export interface PaymentMethod {
    type: "customer_wallet";
    chain?: "ethereum" | "polygon" | "arbitrum" | "solana" | "celo";
    evm_address: string;
  }

  export interface Source {
    currency: "usd";
    amount?: number;
  }

  export interface Destination {
    currency: "usdc" | "usdt" | "usdb";
    customer: {
      id: string;
    };
    payment_method: PaymentMethod;
  }

  export interface ProviderData {
    destination_payment_rail: string; // e.g., "polygon"
  }

  export interface ProviderResponse {
    [key: string]: any;
  }

  export interface Transaction {
    id: string;
    status: string; // e.g., "captured"
    type: "buy";
    source: Source;
    provider: "bridge" | "brla";
    destination: Destination;
    provider_response: ProviderResponse;
    created_at: string;
    updated_at: string;
  }

  export interface Metadata {
    [key: string]: any;
  }

  export interface Bridge {
    provider: "bridge";
    source: Source;
    destination: Destination;
    provider_data?: {
      developer_fee_percent?: number;
    };
    metadata?: Metadata;
  }

  export interface BrlaPaymentMethod {
    id?: string;
    type?: "WALLET";
    wallet_details?: {
      address: string;
    };
  }

  export interface Brla {
    provider: "brla";
    source: {
      amount: number;
      currency: "brl";
      customer_id?: string;
    };
    destination: {
      currency: "brla";
      customer_id?: string;
      payment_method: BrlaPaymentMethod;
    };
    metadata?: Metadata;
  }

  export type Request = Bridge | Brla;

  export type Response = ApiResponse<Transaction>;
}
