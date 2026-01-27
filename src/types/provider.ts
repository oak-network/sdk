// ----------------------
// Shared Enums

import { ApiResponse } from "./common";

// ----------------------
export type ProviderName =
  | "avenia"
  | "mercado_pago"
  | "bridge"
  | "stripe"
  | "pagar_me";

export type TargetRole = "subaccount" | "customer" | "connected_account";

// ----------------------
// Provider Schema Types
// ----------------------
export interface ProviderSchemaCondition {
  if: { properties: { document_type: { const: string } } };
  then: {
    not?: { anyOf?: Array<{ required: string[] }> };
    properties?: Record<string, { maxLength?: number; minLength?: number }>;
    errorMessage?: { not?: string };
  };
}

export interface ProviderSchema {
  type: string;
  allOf?: ProviderSchemaCondition[];
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

export type GetProviderSchemaRequest = {
  provider: ProviderName;
};

export type GetProviderSchemaResponse = ApiResponse<ProviderSchema>;

// ----------------------
// Provider Registration Status
// ----------------------
export interface ProviderRegistrationStatus {
  provider: string;
  status: string;
  target_role: string | null;
  provider_response: any | null;
  rejection_reason: string | null;
}

export type GetProviderRegistrationStatusResponse = ApiResponse<
  ProviderRegistrationStatus[]
>;

// ----------------------
// Provider Registration Submission
// ----------------------
export interface ProviderRegistrationData {
  callback_url?: string;
  account_type?: string;
  transfers_requested?: boolean;
  card_payments_requested?: boolean;
  tax_reporting_us_1099_k_requested?: boolean;
  payouts_debit_negative_balances?: boolean;
  external_account_collection_requested?: boolean;
}

export interface SubmitProviderRegistrationRequest {
  provider: ProviderName;
  target_role: TargetRole;
  provider_data?: ProviderRegistrationData;
}

export interface SubmitProviderRegistrationResult {
  status: string;
  provider: string;
  target_role: string;
}

export type SubmitProviderRegistrationResponse =
  ApiResponse<SubmitProviderRegistrationResult>;
