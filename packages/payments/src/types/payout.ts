import { ApiResponse } from "./common";

export namespace Payout {
  export interface Request {
    payment_method_id: string;
    amount: number;
    currency: "BRL" | "USD" | "COP" | "BRLA" | "JPY";
    customer_id: string;
    metadata?: Record<string, string>;
  }

  export interface PayoutData {
    id: string;
    status: string;
    type: string;
    provider: string;
    source: {
      amount: number;
      currency: string;
      customer?: { id: string };
    };
    destination?: {
      customer?: { id: string };
      payment_method?: {
        id: string;
        type: string;
      };
    };
    metadata?: Record<string, string>;
    created_at: string;
    updated_at: string;
  }

  export type Response = ApiResponse<PayoutData>;
}
