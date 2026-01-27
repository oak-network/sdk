import { ApiResponse } from "./common";
import { Metadata, PaymentSource } from "./payment";

// ----------------------
// Query Params
// ----------------------
export interface GetAllTransactionsQuery {
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
// Transaction Status Enum
// ----------------------
export type TransactionStatus =
  | "INITIATED"
  | "PENDING"
  | "COMPLETED"
  | "SETTLED"
  | "FAILED"
  | "CANCELED_AFTER_COMPLETION";

// ----------------------
// Transaction Model
// ----------------------
export interface Transaction {
  id: string;
  status: TransactionStatus | string;
  type: string;
  source: PaymentSource;
  confirm: boolean;
  metadata?: Metadata;
  provider: string;
}

// ----------------------
// Paginated Response
// ----------------------
export interface TransactionList {
  count: number;
  transaction_list: Transaction[];
}

// ----------------------
// Settlement
// ----------------------
export interface SettlementRequest {
  charge_id: string;
  amount: number;
  status: TransactionStatus;
}
// ----------------------
// API Responses
// ----------------------
export type GetAllTransactionsResponse = ApiResponse<TransactionList>;
export type GetTransactionResponse = ApiResponse<Transaction>;
export type SettlementResponse = ApiResponse<null>;
