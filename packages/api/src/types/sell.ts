import { ApiResponse } from "./common";

export namespace Sell {
  // ----------------------
  // Payment method
  // ----------------------
  export type PaymentMethod =
    | { type: "pix"; id: string } // saved payment method
    | { type: "pix"; pix_string: string }; // direct PIX string

  // ----------------------
  // Request
  // ----------------------
  export interface Source {
    customer?: { id: string };
    currency: string; // e.g. "brla"
    amount: number;
  }

  export interface Destination {
    customer: { id: string };
    currency: string; // e.g. "brl"
    payment_method: PaymentMethod;
  }

  export interface Request {
    provider: "avenia";
    source: Source;
    destination: Destination;
  }

  // ----------------------
  // Transaction (response payload)
  // ----------------------
  export interface TransactionSource {
    amount: string;
    currency: string;
    customer?: { id: string };
  }

  export interface TransactionDestination {
    currency: string;
    customer: { id: string };
    payment_method: {
      type: "pix";
      id?: string;
      pix_string?: string;
    };
  }

  export interface Transaction {
    id: string;
    status: "created" | string;
    type: "sell";
    source: TransactionSource;
    provider: "avenia";
    destination: TransactionDestination;
  }

  // ----------------------
  // Response
  // ----------------------
  export type Response = ApiResponse<Transaction>;
}
