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
    | "created"
    | "awaiting_confirmation"
    | "processing"
    | "captured"
    | "succeeded"
    | "failed"
    | "canceled_after_completion"
    | "canceled";

  // ----------------------
  // Type
  // ----------------------
  export type TransactionType =
    | "pledge"
    | "payment"
    | "pay_out"
    | "batch_transfer"
    | "transfer"
    | "buy"
    | "sell"
    | "cancel"
    | "refund"
    | "payment_method_verification"
    | "pledge_with_installment"
    | "recurring_payment"
    | "installment_payment"
    | "external";

  // ----------------------
  // Sub-status
  // ----------------------
  export type SubStatus =
    | "payment_intent_created"
    | "awaiting_user_initiation"
    | "instant_payment_completed"
    | "on_ramp_successful"
    | "awaiting_capture"
    | "captured"
    | "authorized"
    | "collateral_account"
    | "transfer_initiated"
    | "transfer_completed"
    | "collateral_added"
    | "payment_completed"
    | "fraud_check_approved"
    | "fraud_check_pending"
    | "fraud_check_cancelled"
    | "capture_failed"
    | "on_ramp_failed"
    | "transfer_failed"
    | "instant_payment_failed"
    | "payment_failed"
    | "collateral_add_failed"
    | "authorization_failed"
    | "fraud_check_failed"
    | "capture_cancelled"
    | "capture_cancellation_failed"
    | "funds_scheduled"
    | "funds_received"
    | "payment_submitted"
    | "payment_processed"
    | "requires_action"
    | "off_ramp_failed";

  // ----------------------
  // Model
  // ----------------------
  export interface Item {
    id: string;
    status: Status | string;
    sub_status?: SubStatus | string | null;
    type: TransactionType | string;
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
