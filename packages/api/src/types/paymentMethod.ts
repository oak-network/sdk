import { ApiResponse } from "./common";

export namespace PaymentMethod {
  export interface Metadata {
    [key: string]: string;
  }

  export interface BillingAddress {
    house_number?: string;
    street_number?: string;
    street_name?: string;
    postal_code?: string;
    city?: string;
    state?: string;
    country_code?: string;
    address_line1?: string;
    address_line2?: string;
    zip_code?: string;
  }

  export interface FraudCheckData {
    last_four_digits?: string;
    card_expiration_date?: string;
    card_holder_name?: string;
  }

  export interface FraudCheckConfig {
    threshold?: "low" | "medium" | "high";
    sequence?: "fraud_before_auth" | "fraud_after_auth";
    action_on_fail?: "reject" | "review";
  }

  export interface FraudCheck {
    enabled: boolean;
    provider?: string;
    config?: FraudCheckConfig;
    data?: FraudCheckData;
  }

  export interface ProviderResponse {
    qr_code?: string;
    qr_code_url?: string;
    [key: string]: any;
  }

  // ----------------------------------------
  // Payment methods
  // ----------------------------------------
  export interface MethodBase {
    id?: string;
    type:
      | "bank"
      | "card"
      | "pix"
      | "customer_wallet"
      | "virtual_account"
      | "liquidation_address"
      | "plaid";
    status?: string;
    provider?: string;
    metadata?: Metadata;
  }

  export interface BankMethod extends MethodBase {
    type: "bank";
    bank_name?: string;
    bank_account_name?: string;
    bank_account_number?: string;
    bank_branch_code?: string;
    bank_swift_code?: string;
    bank_account_type?: string;
    bank_routing_number?: string;
  }

  export interface CardMethod extends MethodBase {
    type: "card";
    card_token?: string;
    billing_address?: BillingAddress;
    provider_response?: ProviderResponse;
  }

  export interface PixMethod extends MethodBase {
    type: "pix";
    pix_string?: string;
  }

  export interface CustomerWalletMethod extends MethodBase {
    type: "customer_wallet";
    evm_address?: string;
    chain?: string;
    currency?: string;
  }

  export interface VirtualAccountMethod extends MethodBase {
    type: "virtual_account";
    source_currency?: string;
    destination_currency?: string;
    chain?: string;
    provider_response?: { source_deposit_instructions?: Record<string, any> };
    provider_data?: Record<string, any>;
    destination_payment_method_id?: string;
  }

  export interface LiquidationAddressMethod extends MethodBase {
    type: "liquidation_address";
    source_currency?: string;
    destination_currency?: string;
    liquidation_address?: string;
    provider_data?: Record<string, any>;
    destination_payment_method_id?: string;
  }

  export interface PlaidMethod extends MethodBase {
    type: "plaid";
    link_token?: string;
    callback_url?: string;
    link_token_expires_at?: string;
  }

  export type MethodData =
    | BankMethod
    | CardMethod
    | PixMethod
    | CustomerWalletMethod
    | VirtualAccountMethod
    | LiquidationAddressMethod
    | PlaidMethod;

  export type Request =
    | Omit<BankMethod, "id" | "status">
    | Omit<CardMethod, "id" | "status">
    | Omit<PixMethod, "id" | "status">
    | Omit<CustomerWalletMethod, "id" | "status">
    | Omit<VirtualAccountMethod, "id" | "status">
    | Omit<LiquidationAddressMethod, "id" | "status">
    | Omit<PlaidMethod, "id" | "status">;

  export type Response = ApiResponse<MethodData>;
  export type ListResponse = ApiResponse<MethodData[]>;

  export interface ListQuery {
    type?: string;
    status?: string;
    platform?: string;
  }

  export interface DeleteResponse {
    msg: string;
  }
}
