import { ApiResponse } from "./common";

export namespace Customer {
  export type DocumentType = "personal_tax_id" | "company_tax_id";

  export interface Base {
    email: string;
    document_number?: string;
    document_type?: DocumentType;
    first_name?: string;
    last_name?: string;
    dob?: string;
    phone_country_code?: string;
    phone_area_code?: string;
    phone_number?: string;
    country_code?: string;
    company_name?: string;
  }

  export interface Data {
    id?: string;
    customer_id?: string;
    document_number?: string | null;
    document_type?: string | null;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    house_number?: string | null;
    street_number?: string | null;
    street_name?: string | null;
    postal_code?: string | null;
    city?: string | null;
    state?: string | null;
    country_code?: string | null;
    subdivision?: string | null;
    phone_country_code?: string | null;
    phone_area_code?: string | null;
    phone_number?: string | null;
    dob?: string | null;
    mother_name?: string | null;
    monthly_net_income?: number | null;
    gender?: string | null;
    owner_legal_name?: string | null;
    owner_document_number?: string | null;
    owner_document_type?: string | null;
    company_name?: string | null;
    company_start_date?: string | null;
    social_name?: string | null;
    tax_id?: string | null;
    neighborhood?: string | null;
    customer_wallet?: string | null;
    trading_wallet?: string | null;
    account_type?: string | null;
  }

  export interface Sync {
    // provider is an array of providers to sync the customer with and length must be 1
    providers:
      | "stripe"
      | "bridge"
      | "pagar_me"
      | "brla"
      | "avenia"
      | "mercado_pago"[];

    // fields is an array of fields to sync the customer
    fields: "shipping" | "email" | "first_name" | "last_name"[];
  }

  export type SyncResponse = ApiResponse<null>;

  export interface Request extends Partial<Base> {}

  export type Response = ApiResponse<Data>;
  export interface ListResponse
    extends ApiResponse<{
      count: number;
      customer_list: Data[];
    }> {}

  export interface ListQueryParams {
    limit?: number;
    offset?: number;
    target_role?: string;
    provider_registration_status?: string;
    provider?: string;
    email?: string;
    document_type?: string;
    country_code?: string;
  }
  export interface BalanceFilter {
    provider: string;
    role: string;
  }

  export interface BalanceResponse
    extends ApiResponse<{
      as_of: string;
      filters: {
        customer_id: string;
        provider?: string;
        role?: string;
      };

      balances: {
        account_id: string;
        provider: string;
        customer: {
          id: string;
          role: string;
        };
        as_of: string;
        totals: {
          currency: string;
          amount: number;
          pending: number;
          reserved: number;
          instant_payouts: number;
        }[];
      }[];
    }> {}
}
