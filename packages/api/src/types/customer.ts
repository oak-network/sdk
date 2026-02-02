import { ApiResponse } from "./common";

// ----- Common Types -----
export type DocumentType = "personal_tax_id" | "company_tax_id" | "cpf";

export interface CustomerBase {
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

// ----- Response Data Shape -----
export interface CustomerData {
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

// ----- Requests -----
export interface CreateCustomerRequest extends CustomerBase {}
export interface UpdateCustomerRequest extends Partial<CustomerBase> {}

// ----- Responses -----
export type CreateCustomerResponse = ApiResponse<CustomerData>;
export type GetCustomerResponse = ApiResponse<CustomerData>;
export type UpdateCustomerResponse = ApiResponse<CustomerData>;

export interface GetAllCustomerResponse
  extends ApiResponse<{
    count: number;
    customer_list: CustomerData[];
  }> {}

// ----- Query Params -----
export interface CustomerListQueryParams {
  limit?: number;
  offset?: number;
  customer_id?: string;
  type_list?: string;
  status?: string;
  payment_method?: string;
  dateFrom?: string;
  dateTo?: string;
  source_currency?: string;
  destination_currency?: string;
  country_code?: string;
}
