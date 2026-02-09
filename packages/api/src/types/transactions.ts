import { ApiResponse } from "./common";
import { Payment } from "./payment";

export namespace Transaction {
  // ----------------------
  // Query
  // ----------------------
  export interface ListQuery {
    limit?: number;
    offset?: number;
    customer_id?: string; // UUID
    type_list?: string; // e.g. "installment_payment"
    status?: string; // comma-separated, e.g. "created,processing"
    payment_method?: string; // e.g. "pix"
    dateFrom?: string; // e.g. "2025-07-02"
    dateTo?: string; // e.g. "2025-07-02"
    source_currency?: string; // e.g. "brla"
    destination_currency?: string; // e.g. "brl"
  }

  // ----------------------
  // Status
  // ----------------------
  export type Status =
    | "INITIATED"
    | "PENDING"
    | "COMPLETED"
    | "SETTLED"
    | "FAILED"
    | "CANCELED_AFTER_COMPLETION";

  // ----------------------
  // Model
  // ----------------------
  export interface Item {
    id: string;
    status: Status | string;
    type: string;
    source: Payment.Source;
    confirm: boolean;
    metadata?: Payment.Metadata;
    provider: string;
    created_at: string;
    updated_at: string;
  }

  // ----------------------
  // List payload
  // ----------------------
  export interface ListData {
    count: number;
    transaction_list: Item[];
  }

  // ----------------------
  // Settlement
  // ----------------------
  export interface SettlementRequest {
    charge_id: string;
    amount: number;
    status: Status;
  }

  // ----------------------
  // Responses
  // ----------------------
  export type ListResponse = ApiResponse<ListData>;
  export type GetResponse = ApiResponse<Item>;
  export type SettlementResponse = ApiResponse<null>;
}
