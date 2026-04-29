import { ApiResponse } from "./common";

export namespace Webhook {
  // ----------------------
  // Data
  // ----------------------
  export interface Data {
    id: string;
    url: string;
    description?: string;
    secret: string;
    is_active: boolean;
  }

  export type PublicData = Omit<Data, "secret">;

  // ----------------------
  // Requests
  // ----------------------
  export interface RegisterRequest {
    url: string;
    description?: string;
  }

  export interface UpdateRequest {
    url?: string;
    description?: string;
  }

  // ----------------------
  // Notifications
  // ----------------------
  export type EventType =
    | "payment.processing"
    | "payment.succeeded"
    | "payment.captured"
    | "payment.failed"
    | "payment.awaiting_confirmation"
    | "payment.cancelled"
    | "payment.refunded"
    | "payment.updated"
    | "refund.created"
    | "refund.updated"
    | "refund.failed"
    | "refund.succeeded"
    | "customer.verified"
    | "customer.processing"
    | "customer.action_required"
    | "customer.rejected"
    | "customer.created"
    | "customer.updated"
    | "customer.sync"
    | "provider_registration.submitted"
    | "provider_registration.approved"
    | "provider_registration.restricted"
    | "provider_registration.rejected"
    | "provider_registration.awaiting_confirmation"
    | "provider_registration.processing"
    | "provider_registration.action_required"
    | "provider_registration.documents_uploaded"
    | "provider_registration.verification_expired"
    | "payment_method.verified"
    | "payment_method.approved"
    | "payment_method.rejected"
    | "payment_method.created"
    | "payment_method.updated"
    | "transaction.updated"
    | "transaction.sc_updated"
    | "dispute.created"
    | "dispute.updated"
    | "dispute.closed"
    | "dispute.funds_reinstated"
    | "dispute.funds_withdrawn"
    | "payout.succeeded"
    | "kyc.approved"
    | "kyc.rejected"
    | "kyc.action_required"
    | "external_deposit.received"
    | "external_deposit.pending"
    | "external_deposit.completed"
    | "external_deposit.succeeded"
    | "external_deposit.virtual_account_funded"
    | "transfer.succeeded"
    | "transfer.failed"
    | "sell.succeeded"
    | "sell.failed"
    | "buy.succeeded"
    | "buy.completed"
    | "buy.awaiting_confirmation"
    | "installment_payment.succeeded"
    | "installment_payment.failed";

  export interface Notification {
    id: string;
    is_acknowledged: boolean;
    event: EventType | string | null;
    category: string | null;
    data: any;
  }

  export interface ListNotificationsQuery {
    limit?: number;
    offset?: number;
  }

  export interface ListNotificationsData {
    count: number;
    notification_list: Notification[];
  }

  // ----------------------
  // Responses
  // ----------------------
  export type Response = ApiResponse<Data>;

  export type GetResponse = ApiResponse<PublicData>;
  export type ListResponse = ApiResponse<PublicData[]>;
  export type DeleteResponse = ApiResponse<{ success: boolean }>;

  export type GetNotificationResponse = ApiResponse<Notification>;
  export type ListNotificationsResponse = ApiResponse<ListNotificationsData>;
}
