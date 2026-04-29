import { ApiResponse } from "./common";

export namespace Webhook {
  // ----------------------
  // Categories
  // ----------------------
  export type Category =
    | "payment_lifecycle"
    | "provider_registration_lifecycle"
    | "payment_method_lifecycle"
    | "transfer_lifecycle"
    | "buy_lifecycle"
    | "sell_lifecycle"
    | "payout_lifecycle"
    | "dispute_lifecycle"
    | "refund_lifecycle"
    | "OTHER"
    | "externally_lifecycle"
    | "customer_sync_lifecycle";

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
    // Customer lifecycle
    | "customer.verified"
    | "customer.processing"
    | "customer.action_required"
    | "customer.rejected"
    | "customer.created"
    | "customer.updated"
    // Customer sync lifecycle
    | "customer.sync.started"
    | "customer.sync.succeeded"
    | "customer.sync.failed"
    // Provider registration lifecycle
    | "provider_registration.submitted"
    | "provider_registration.approved"
    | "provider_registration.restricted"
    | "provider_registration.rejected"
    | "provider_registration.awaiting_confirmation"
    | "provider_registration.processing"
    | "provider_registration.action_required"
    | "provider_registration.documents_uploaded"
    | "provider_registration.verification_expired"
    // Payment lifecycle
    | "payment.processing"
    | "payment.succeeded"
    | "payment.captured"
    | "payment.failed"
    | "payment.awaiting_confirmation"
    | "payment.cancelled"
    | "payment.refunded"
    | "payment.updated"
    // Payment refund sub-events
    | "payment.refund.created"
    | "payment.refund.updated"
    | "payment.refund.failed"
    // Refund lifecycle
    | "refund.failed"
    | "refund.succeeded"
    // Payment method lifecycle
    | "payment_method.verified"
    | "payment_method.approved"
    | "payment_method.rejected"
    | "payment_method.created"
    | "payment_method.updated"
    // Transaction lifecycle
    | "transaction.updated"
    | "transaction.sc_updated"
    // Dispute lifecycle
    | "payment.disputed"
    | "payment.dispute.updated"
    | "payment.dispute.closed"
    | "payment.dispute.funds_reinstated"
    | "payment.dispute.funds_withdrawn"
    // Payout lifecycle
    | "payout.succeeded"
    // Installment payment lifecycle
    | "payment.installment.succeeded"
    | "payment.installment.failed"
    // KYC lifecycle
    | "kyc.approved"
    | "kyc.rejected"
    | "kyc.action_required"
    // External deposit lifecycle
    | "external.deposit.received"
    | "external.deposit.awaiting_confirmation"
    | "external.deposit.completed"
    | "external.deposit.succeeded"
    | "external.virtual_account.funded"
    // Transfer lifecycle
    | "transfer.succeeded"
    | "transfer.failed"
    // Sell lifecycle
    | "sell.succeeded"
    | "sell.failed"
    // Buy lifecycle
    | "buy.succeeded"
    | "buy.completed"
    | "buy.awaiting_confirmation";

  export interface Notification {
    id: string;
    is_acknowledged: boolean;
    event: EventType | string | null;
    category: Category | string | null;
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
