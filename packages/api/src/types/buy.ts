import { ApiResponse } from "./common";

export namespace Buy {
  export interface WalletDetails {
    address: string;
  }

  export interface PaymentMethod {
    wallet_details: WalletDetails;
  }

  export interface CurrencyInfo {
    currency: string;
  }

  export interface Source extends CurrencyInfo {
    customer_id: string;
  }

  export interface Destination extends CurrencyInfo {
    payment_method: PaymentMethod;
  }

  export interface ProviderData {
    destination_payment_rail: string; // e.g., "polygon"
  }

  export interface ProviderResponse {
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

  export interface Transaction {
    id: string;
    status: string; // e.g., "captured"
    type: string; // e.g., "buy"
    source: Source;
    provider: string;
    destination: Destination;
    provider_data: ProviderData;
    provider_response: ProviderResponse;
  }

  export interface Request {
    provider: string; // e.g., "bridge"
    source: Source;
    destination: Destination;
    provider_data: ProviderData;
  }

  export type Response = ApiResponse<Transaction>;
}
