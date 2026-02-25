import { ApiResponse } from "./common";

export namespace Provider {
  // ----------------------
  // Enums / literals
  // ----------------------
  export type Name =
    | "avenia"
    | "mercado_pago"
    | "bridge"
    | "stripe"
    | "pagar_me";

  export type TargetRole = "subaccount" | "customer" | "connected_account";

  // ----------------------
  // Schema
  // ----------------------
  export interface SchemaCondition {
    if: { properties: { document_type: { const: string } } };
    then: {
      not?: { anyOf?: Array<{ required: string[] }> };
      properties?: Record<string, { maxLength?: number; minLength?: number }>;
      errorMessage?: { not?: string };
    };
  }

  export interface Schema {
    type: string;
    allOf?: SchemaCondition[];
    $async?: boolean;
    required: string[];
    properties: Record<
      string,
      {
        type?: string;
        format?: string;
        enum?: string[];
        nullable?: boolean;
        minLength?: number;
        validateCountry?: boolean;
      }
    >;
  }

  export interface GetSchemaRequest {
    provider: Name;
  }

  export type GetSchemaResponse = ApiResponse<Schema>;

  // ----------------------
  // Registration status
  // ----------------------
  export interface RegistrationStatus {
    provider: string;
    status: string; // e.g., "created"
    target_role: string | null;
    provider_response: any | null;
    rejection_reason: string | null;
    readiness: any | null;
    created_at: string;
    updated_at: string;
  }

  export type GetRegistrationStatusResponse = ApiResponse<RegistrationStatus[]>;

  // ----------------------
  // Registration submission
  // ----------------------
  export interface RegistrationData {
    callback_url?: string;
    account_type?: string;
    transfers_requested?: boolean;
    card_payments_requested?: boolean;
    tax_reporting_us_1099_k_requested?: boolean;
    payouts_debit_negative_balances?: boolean;
    external_account_collection_requested?: boolean;
  }

  export interface Request {
    provider: Name;
    target_role: TargetRole;
    provider_data?: RegistrationData;
  }

  export interface SubmitResponse {
    status: string;
    provider: string;
    target_role: string;
    provider_response: any | null;
    rejection_reason: string | null;
    readiness: any | null;
    created_at: string;
    updated_at: string;
  }

  export type Response = ApiResponse<SubmitResponse[]>;
}
