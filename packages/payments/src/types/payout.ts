import { ApiResponse } from "./common";

export namespace Payout {
  export interface Request {
    payment_method_id: string;
    amount: number;
    currency: "BRL" | "USD" | "COP" | "BRLA" | "JPY";
    customer_id: string;
    metadata?: Record<string, string>;
  }

  export type Response = ApiResponse<unknown>;
}
