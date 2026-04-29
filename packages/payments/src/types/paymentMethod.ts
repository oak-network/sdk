import { ApiResponse } from "./common";

export namespace PaymentMethod {
  export type MethodType =
    | "bank"
    | "card"
    | "plaid"
    | "virtual_account"
    | "liquidation_address"
    | "trading_wallet"
    | "customer_wallet"
    | "pix"
    | "evm_address";

  export type PaymentMethodKind =
    | "pix"
    | "boleto"
    | "card"
    | "bank_transfer"
    | "bank"
    | "cash_payment";

  export type BankAccountType =
    | "payment"
    | "checking"
    | "savings"
    | "virtual_account";

  export interface BridgeBankAccount {
    type: MethodType;
    provider?: string; // from PLATFORMS keys
    currency?: string; // from CURRENCY keys (lowercase)
    bank_name: string;
    bank_account_number: string; // pattern: digits only
    bank_routing_number: string; // pattern: digits only
    bank_account_type: string;
    bank_account_name: string;
    billing_address: {
      street_line_1: string;
      street_line_2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
    metadata?: Record<string, any>;
  }

  export interface OakBankAccount {
    type: MethodType;
    provider?: string; // from PLATFORMS keys
    bank_branch_code: string;
    bank_account_number: string; // pattern: digits only
    bank_account_name: string;
    bank_account_type: string; // from SUBJECT_BANK_ACCOUNT_TYPE keys
    bank_name: string;
    bank_swift_code: string;
    metadata?: Record<string, any>;
  }

  export interface StripeBankAccount {
    type: MethodType;
    provider?: string; // from PLATFORMS keys
    currency?: string; // from CURRENCY keys
    bank_name: string;
    bank_account_number: string; // pattern: digits only
    bank_routing_number: string; // pattern: digits only
    bank_account_type: string;
    bank_account_name: string;
    bank_metadata?: Record<string, any>;
    metadata?: Record<string, any>;
  }

  export interface MercadoPagoCard {
    type: MethodType;
    provider: string; // from PLATFORMS keys
    card_details: {
      card_token: string;
    };
    metadata?: Record<string, any>;
  }

  export interface PagarMeCard {
    type: MethodType;
    provider: string; // from PLATFORMS keys
    card_token: string;
    billing_address: {
      house_number: string;
      street_number: string;
      street_name: string;
      postal_code: string;
      city: string;
      state: string;
      country_code: string; // validated externally
    };
    metadata?: Record<string, any>;
  }

  export interface StripeCard {
    type: MethodType;
    provider: string; // from PLATFORMS keys
    metadata?: Record<string, any>;
  }

  export interface OakCustomerWallet {
    type: MethodType;
    provider?: string; // from PLATFORMS keys
    evm_address: string; // validated as checksummed Ethereum address
    chain: string; // from WALLET_CHAIN keys
    currency: string; // from ASSET_TYPE keys
    metadata?: Record<string, any>;
  }

  export interface BridgeLiquidationAddress {
    type: MethodType;
    provider: string; // from PLATFORMS keys
    source_currency: string; // from ASSET_TYPE keys
    destination_currency: string; // from CURRENCY keys
    destination_payment_method_id: string;
    provider_data?: {
      destination_wire_message?: string;
      destination_payment_rail: string;
      chain: string;
    };
    metadata?: Record<string, any>;
  }

  export interface OakPix {
    type: MethodType;
    provider?: string; // from PLATFORMS keys
    pix_string: string;
    metadata?: Record<string, any>;
  }

  export interface BridgePlaid {
    type: MethodType;
    provider: string; // from PLATFORMS keys
    metadata?: Record<string, string>;
  }

  export interface PlaidResponseData {
    id: string;
    type: MethodType;
    link_token: string;
    callback_url: string;
    link_token_expires_at: string;
    metadata?: Record<string, string>;
  }

  export interface TradingWallet {
    type: MethodType;
    provider: string; // from PLATFORMS keys
    metadata?: Record<string, any>;
  }

  export interface TradingWalletResponseData {
    id: string;
    type: MethodType;
    status: string;
    wallet_details: {
      address: string;
    };
    metadata?: Record<string, any>;
  }

  export interface BridgeVirtualAccount {
    type: MethodType;
    provider: string; // from PLATFORMS keys
    source_currency: string; // from CURRENCY keys
    destination_currency: string; // from ASSET_TYPE keys
    provider_data?: {
      chain: string;
      evm_address: string;
    };
    destination_payment_method_id?: string; // UUID v4
    metadata?: Record<string, any>;
  }

  // export type MethodData =
  //   | BankMethod
  //   | CardMethod
  //   | PixMethod
  //   | CustomerWalletMethod
  //   | VirtualAccountMethod
  //   | LiquidationAddressMethod
  //   | PlaidMethod;

  export type Request =
    | BridgeBankAccount
    | OakBankAccount
    | StripeBankAccount
    | MercadoPagoCard
    | PagarMeCard
    | StripeCard
    | OakCustomerWallet
    | BridgeLiquidationAddress
    | OakPix
    | BridgePlaid
    | BridgeVirtualAccount
    | TradingWallet;

  export type ResponseData = Request & {
    id: string;
    status: string;
    created_at: string;
    updated_at: string;
  };

  export type Response = ApiResponse<ResponseData>;
  export type ListResponse = ApiResponse<ResponseData[]>;

  export interface ListQuery {
    type?: string;
    status?: string;
    platform?: string;
  }

  export interface DeleteResponse {
    msg: string;
  }
}
