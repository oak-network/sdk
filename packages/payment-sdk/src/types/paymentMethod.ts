import { ApiResponse } from "./common";

export namespace PaymentMethod {
  export interface BridgeBankAccount {
    type: string; // from SUBJECT_PAYMENT_METHOD_TYPE keys
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

  export interface CrowdSplitBankAccount {
    type: string; // from SUBJECT_PAYMENT_METHOD_TYPE keys
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
    type: string; // from SUBJECT_PAYMENT_METHOD_TYPE keys
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
    type: string; // from SUBJECT_PAYMENT_METHOD_TYPE keys
    provider: string; // from PLATFORMS keys
    card_details: {
      card_token: string;
    };
    metadata?: Record<string, any>;
  }

  export interface PagarMeCard {
    type: string; // from SUBJECT_PAYMENT_METHOD_TYPE keys
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
    type: string; // from SUBJECT_PAYMENT_METHOD_TYPE keys
    provider: string; // from PLATFORMS keys
    metadata?: Record<string, any>;
  }

  export interface CrowdSplitCustomerWallet {
    type: string; // from SUBJECT_PAYMENT_METHOD_TYPE keys
    provider?: string; // from PLATFORMS keys
    evm_address: string; // validated as checksummed Ethereum address
    chain: string; // from WALLET_CHAIN keys
    currency: string; // from ASSET_TYPE keys
    metadata?: Record<string, any>;
  }

  export interface BridgeLiquidationAddress {
    type: string; // from SUBJECT_PAYMENT_METHOD_TYPE keys
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

  export interface CrowdSplitPix {
    type: string; // from SUBJECT_PAYMENT_METHOD_TYPE keys
    provider?: string; // from PLATFORMS keys
    pix_string: string;
    metadata?: Record<string, any>;
  }

  export interface BridgePlaid {
    type: string; // from SUBJECT_PAYMENT_METHOD_TYPE keys
    provider: string; // from PLATFORMS keys
    metadata?: Record<string, string>;
  }

  export interface BridgeVirtualAccount {
    type: string; // from SUBJECT_PAYMENT_METHOD_TYPE keys
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
    | CrowdSplitBankAccount
    | StripeBankAccount
    | MercadoPagoCard
    | PagarMeCard
    | StripeCard
    | CrowdSplitCustomerWallet
    | BridgeLiquidationAddress
    | CrowdSplitPix
    | BridgePlaid
    | BridgeVirtualAccount;

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
