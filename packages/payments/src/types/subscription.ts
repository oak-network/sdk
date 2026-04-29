import { ApiResponse } from "./common";

export namespace Subscription {
  // ----------------------
  // Subscribe request
  // ----------------------
  export interface SubscribeRequest {
    plan_id: string;
    source_customer_id: string;
    destination_customer_id: string;
    payment_method_id: string;
    payment_method_type: "CARD" | "PIX" | "BOLETO";
    payment_method_provider: "PAGAR_ME" | "FACILITA_PAY" | "BRLA";
    fee_bearer: "connected_account" | "platform";
  }

  // ----------------------
  // Payment request
  // ----------------------
  export interface PaymentRequest {
    customer_id: string;
    payment_method_id: string;
    payment_method_type: "CARD" | "PIX" | "BOLETO";
    payment_method_provider: "PAGAR_ME" | "FACILITA_PAY" | "BRLA";
  }

  // ----------------------
  // List query
  // ----------------------
  export interface ListQuery {
    customer_id: string;
    status?: string;
    per_page?: number;
    page_no?: number;
  }

  // ----------------------
  // Data
  // ----------------------
  export type Status =
    | "active"
    | "pending_activation"
    | "canceled"
    | "expired"
    | "queued";

  export interface Details {
    hash_id: string;
    start_time: string;
    end_time: string;
    plan_hash_id: string;
    auto_renew: boolean;
    status: Status;
    created_at: string;
    updated_at: string;
  }

  export interface SubscribeData {
    id: string;
    status: string;
    sub_status: string;
  }

  export interface Pagination {
    per_page: number;
    page_no: number;
    total: number;
  }

  export interface ListData {
    data: Details[];
    pagination: Pagination;
  }

  // ----------------------
  // Responses
  // ----------------------
  export type SubscribeResponse = ApiResponse<SubscribeData>;
  export type DetailsResponse = ApiResponse<Details>;
  export type ListResponse = ApiResponse<ListData>;
  export type CancelResponse = ApiResponse<Record<string, never>>;
  export type PaymentResponse = ApiResponse<SubscribeData>;
}
