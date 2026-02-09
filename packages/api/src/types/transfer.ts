import { ApiResponse } from "./common";

export namespace Transfer {
  export interface BrlaRequest {
    provider: "brla";
    source: {
      amount: number; // integer, positive
      currency: "brla"; // from ASSET_TYPE.BRLA
      customer?: {
        id: string;
      };
    };
    destination: {
      customer?: {
        id: string; // required if payment_method.id is provided
      };
      payment_method?: {
        id?: string; // if present, chain and evm_address are forbidden
        type: string; // from TRANSFER_PAYMENT_METHOD_TYPE keys
        chain?: string; // from WALLET_CHAIN values, required when id is absent
        evm_address?: string; // required when id is absent, validated as checksummed address
      };
    };
    metadata?: Record<string, any>;
    provider_data?: {
      wallet_memo?: string; // max 50 characters
    };
  }

  export interface PagarMeRequest {
    provider: "pagar_me";
    source: {
      amount: number; // integer, positive
      currency: "brl"; // from CURRENCY.BRL
    };
    metadata?: Record<string, any>;
  }

  export interface StripeRequest {
    provider: "stripe";
    source: {
      amount: number; // integer, positive
      currency: "usd"; // from CURRENCY.USD
      customer: {
        id: string; // must equal destination.customer.id
      };
    };
    destination: {
      customer: {
        id: string; // must equal source.customer.id
      };
      payment_method: {
        id: string;
        type: "BANK";
      };
    };
    metadata?: Record<string, any>;
    provider_data?: {
      statement_descriptor?: string;
    };
  }

  export type Request = BrlaRequest | PagarMeRequest | StripeRequest;

  // ----------------------
  // Response
  // ----------------------
  export type Data = Request & {
    id: string;
    status: string; // e.g. "created"
    type: "transfer";
    provider: string;
    created_at: string;
    updated_at: string;
  };

  export type Response = ApiResponse<Data>;
}
