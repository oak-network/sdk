import { ApiResponse } from "./common";

export namespace Dispute {
  // ----------------------
  // Evidence request
  // ----------------------
  export interface FileEvidence {
    id: string;
    type:
      | "receipt"
      | "customer_signature"
      | "shipping_documentation"
      | "service_documentation"
      | "refund_policy"
      | "cancellation_policy"
      | "uncategorized_file";
  }

  export interface TextEvidence {
    key:
      | "customer_name"
      | "customer_email_address"
      | "customer_purchase_ip"
      | "product_description"
      | "duplicate_charge_id"
      | "enhanced_evidence"
      | "customer_communication"
      | "refund_policy"
      | "refund_policy_disclosure"
      | "refund_refusal_explanation"
      | "service_date"
      | "shipping_address"
      | "shipping_carrier"
      | "shipping_date"
      | "shipping_tracking_number"
      | "shipping_tracking_url"
      | "duplicate_charge_explanation"
      | "cancellation_policy"
      | "cancellation_rebuttal"
      | "uncategorized_text";
    value: string;
  }

  export interface EvidenceRequest {
    file_evidences?: FileEvidence[];
    text_evidences?: TextEvidence[];
  }

  // ----------------------
  // Responses
  // ----------------------
  export type ListResponse = ApiResponse<unknown>;
  export type UpdateResponse = ApiResponse<unknown>;
  export type SubmitResponse = ApiResponse<unknown>;
  export type CloseResponse = ApiResponse<unknown>;
}
