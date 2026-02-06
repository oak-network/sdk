import { ApiResponse } from "./common";

export namespace Transfer {
  // ----------------------
  // Common
  // ----------------------
  export interface CustomerRef {
    id: string;
  }

  export interface Source {
    amount: number;
    currency: string;
    customer?: CustomerRef;
  }

  export interface PaymentMethod {
    id?: string;
    type: string;
    chain?: string;
    evm_address?: string;
  }

  export interface Destination {
    customer?: CustomerRef;
    payment_method?: PaymentMethod;
  }

  export type Metadata = Record<string, any>;

  // ----------------------
  // Provider-specific requests
  // ----------------------
  export interface BrlaRequest {
    provider: "brla";
    source: Source & { currency: "brla" };
    destination: Destination;
    metadata?: Metadata;
  }

  export interface StripeRequest {
    provider: "stripe";
    source: Source & { currency: "usd" };
    destination: Destination & {
      customer: CustomerRef;
      payment_method: { id: string; type: "bank" };
    };
    metadata?: Metadata;
    provider_data?: { statement_descriptor?: string };
  }

  export type Request = BrlaRequest | StripeRequest;

  // ----------------------
  // Response
  // ----------------------
  export interface Data {
    id: string;
    status: string; // e.g. "created"
    type: "transfer";
    source: Source;
    destination: Destination;
    metadata?: Metadata;
    provider: string;
  }

  export type Response = ApiResponse<Data>;
}
