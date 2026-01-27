// ----------------------------------------
// Common Base Types

import { ApiResponse } from "./common";

// ----------------------------------------
export interface Customer {
  id: string;
}

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

// ----------------------------------------
// Payment Methods
// ----------------------------------------
export interface BasePaymentMethod {
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

// Variants
export interface BankPaymentMethod extends BasePaymentMethod {
  type: "bank";
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_branch_code?: string;
  bank_swift_code?: string;
  bank_account_type?: string;
  bank_routing_number?: string;
}

export interface CardPaymentMethod extends BasePaymentMethod {
  type: "card";
  card_token?: string;
  billing_address?: BillingAddress;
  provider_response?: ProviderResponse;
}

export interface PixPaymentMethod extends BasePaymentMethod {
  type: "pix";
  pix_string?: string;
}

export interface CustomerWalletPaymentMethod extends BasePaymentMethod {
  type: "customer_wallet";
  evm_address?: string;
  chain?: string;
  currency?: string;
}

export interface VirtualAccountPaymentMethod extends BasePaymentMethod {
  type: "virtual_account";
  source_currency?: string;
  destination_currency?: string;
  chain?: string;
  provider_response?: {
    source_deposit_instructions?: Record<string, any>;
  };
  provider_data?: Record<string, any>;
  destination_payment_method_id?: string;
}

export interface LiquidationAddressPaymentMethod extends BasePaymentMethod {
  type: "liquidation_address";
  source_currency?: string;
  destination_currency?: string;
  liquidation_address?: string;
  provider_data?: Record<string, any>;
  destination_payment_method_id?: string;
}

export interface PlaidPaymentMethod extends BasePaymentMethod {
  type: "plaid";
  link_token?: string;
  callback_url?: string;
  link_token_expires_at?: string;
}

// Unified type for responses
export type PaymentMethodResponseData =
  | BankPaymentMethod
  | CardPaymentMethod
  | PixPaymentMethod
  | CustomerWalletPaymentMethod
  | VirtualAccountPaymentMethod
  | LiquidationAddressPaymentMethod
  | PlaidPaymentMethod;

// ----------------------------------------
// Source/Destination Shapes
// ----------------------------------------

export interface PaymentSource {
  amount: number;
  currency: string;
  customer?: Customer;
  payment_method: PaymentMethodResponseData;
  installments?: number;
  float_rate?: number;
  capture_method?: "automatic" | "manual";
  fraud_check?: FraudCheck;
}

export interface PaymentDestination {
  amount?: number;
  currency?: string;
  customer?: Customer;
}

// ----------------------------------------
// Provider Response
// ----------------------------------------
export interface ProviderResponse {
  qr_code?: string;
  qr_code_url?: string;
  [key: string]: any;
}

// ----------------------------------------
// Request Types
// ----------------------------------------
export interface MercadoPagoPaymentRequest {
  provider: "mercado_pago";
  source: PaymentSource & {
    currency: "COP";
    customer: Customer;
    payment_method: { type: "card"; card_token: string };
    capture_method: "automatic";
  };
  confirm?: boolean;
  metadata?: Metadata;
}

export interface PagarMePaymentRequest {
  provider: "pagar_me";
  source: PaymentSource & {
    currency: "brl";
    customer: Customer;
    payment_method: {
      type: "card" | "pix";
      card_token?: string;
      expiry_date?: string;
    };
    capture_method: "automatic" | "manual";
    fraud_check: FraudCheck & { provider?: "konduto" };
  };
  confirm?: boolean;
  metadata?: Metadata;
}

export interface StripePaymentRequest {
  provider: "stripe";
  source: PaymentSource & {
    payment_method: { type: "card"; id?: string };
    capture_method: "automatic";
    fraud_check?: { enabled: false };
  };
  destination?: PaymentDestination;
  confirm?: boolean;
  metadata?: Metadata;
}

export type CreatePaymentRequest =
  | MercadoPagoPaymentRequest
  | PagarMePaymentRequest
  | StripePaymentRequest;

// ----------------------------------------
// Response Types
// ----------------------------------------
export type CreatePaymentResponse = ApiResponse<{
  id: string;
  status: string;
  type: string;
  source: PaymentSource;
  confirm: boolean;
  metadata?: Metadata;
  provider: string;
}>;

export type ConfirmPaymentResponse = ApiResponse<{
  id: string;
  status: string;
  type: string;
  source: PaymentSource;
  confirm: boolean;
  metadata?: Metadata;
  provider: string;
  provider_response?: ProviderResponse;
}>;

export type CancelPaymentResponse = ApiResponse<{
  id: string;
  status: string;
  type: string;
  source: PaymentSource;
  confirm: boolean;
  metadata?: Metadata;
  provider: string;
  provider_response?: ProviderResponse;
}>;

export type AddCustomerPaymentMethodRequest =
  | Omit<BankPaymentMethod, "id" | "status">
  | Omit<CardPaymentMethod, "id" | "status">
  | Omit<PixPaymentMethod, "id" | "status">
  | Omit<CustomerWalletPaymentMethod, "id" | "status">
  | Omit<VirtualAccountPaymentMethod, "id" | "status">
  | Omit<LiquidationAddressPaymentMethod, "id" | "status">
  | Omit<PlaidPaymentMethod, "id" | "status">;

export type AddCustomerPaymentMethodResponse =
  ApiResponse<PaymentMethodResponseData>;
export type GetCustomerPaymentMethodResponse =
  ApiResponse<PaymentMethodResponseData>;
export type GetAllCustomerPaymentMethodsResponse = ApiResponse<
  PaymentMethodResponseData[]
>;

export interface GetAllCustomerPaymentMethodsQuery {
  type?: string;
  status?: string;
  platform?: string;
}

export interface DeletePaymentMethodResponse {
  msg: string;
}
