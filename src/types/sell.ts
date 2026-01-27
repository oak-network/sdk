// ----------------------
// Sell Payment Method

import { ApiResponse } from "./common";

// ----------------------
export type SellPaymentMethod =
  | { type: "pix"; id: string } // For saved payment method
  | { type: "pix"; pix_string: string }; // For direct PIX string

// ----------------------
// Create Sell Request
// ----------------------
export interface CreateSellRequest {
  provider: "avenia";
  source: {
    customer?: { id: string };
    currency: string; // e.g., "brla"
    amount: number;
  };
  destination: {
    customer: { id: string };
    currency: string; // e.g., "brl"
    payment_method: SellPaymentMethod;
  };
}

// ----------------------
// Sell Transaction
// ----------------------
export interface SellTransaction {
  id: string;
  status: "created" | string; // could extend later
  type: "sell";
  source: {
    amount: string;
    currency: string;
    customer?: { id: string };
  };
  provider: "avenia";
  destination: {
    currency: string;
    customer: { id: string };
    payment_method: {
      type: "pix";
      id?: string;
      pix_string?: string;
    };
  };
}

// ----------------------
// Create Sell Response
// ----------------------
export type CreateSellResponse = ApiResponse<SellTransaction>;
