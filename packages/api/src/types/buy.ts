import { ApiResponse } from "./common";

// ----- Common Types -----
export interface WalletDetails {
  address: string;
}

export interface PaymentMethod {
  wallet_details: WalletDetails;
}

export interface CurrencyInfo {
  currency: string;
}

export interface BuySource extends CurrencyInfo {
  customer_id: string;
}

export interface BuyDestination extends CurrencyInfo {
  payment_method: PaymentMethod;
}

export interface ProviderData {
  destination_payment_rail: string; // e.g., "polygon"
}

export interface BuyProviderResponse {
  currency: string;
  bank_name: string;
  bank_address: string;
  bank_routing_number: string;
  bank_account_number: string;
  bank_beneficiary_name: string;
  bank_beneficiary_address: string;
  payment_rails: string[]; // e.g., ["ach_push", "wire"]
  deposit_message: string;
}

// ----- Requests -----
export interface CreateBuyRequest {
  provider: string; // e.g., "bridge"
  source: BuySource;
  destination: BuyDestination;
  provider_data: ProviderData;
}

// ----- Transactions -----
export interface BuyTransaction {
  id: string;
  status: string; // e.g., "captured"
  type: string; // e.g., "buy"
  source: BuySource;
  provider: string;
  destination: BuyDestination;
  provider_data: ProviderData;
  provider_response: BuyProviderResponse;
}

// ----- Responses -----
export type CreateBuyResponse = ApiResponse<BuyTransaction>;
