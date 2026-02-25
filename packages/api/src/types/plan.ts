import { ApiResponse } from "./common";

export namespace Plan {
  // ----------------------
  // Request
  // ----------------------
  export interface Base {
    name: string;
    description: string;
    frequency: number; // in days
    price: number;
    start_date: string; // ISO date format (YYYY-MM-DD)
    end_date?: string; // Optional ISO date format
    is_auto_renewable: boolean;
    currency: string; // e.g. "BRL"
    allow_amount_override: boolean;
    created_by: string;
  }

  export interface Request extends Base {}

  // ----------------------
  // Data
  // ----------------------
  export interface Details {
    hash_id: string;
    name: string;
    description: string;
    frequency: number; // in days
    price: number;
    is_active: boolean;
    start_time: string; // ISO datetime
    end_time: string; // ISO datetime
    is_auto_renewable: boolean;
    created_by: string;
    updated_by: string;
    currency: string; // lowercase like "brl"
    allow_amount_override: boolean;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    deleted_at: string | null;
  }

  export interface Pagination {
    per_page: number;
    page_no: number;
    total: number;
  }

  export interface ListData {
    data: Details[];
    pagination: Pagination;
  }

  // ----------------------
  // Responses
  // ----------------------
  export type Response = ApiResponse<string>;

  export type DetailsResponse = ApiResponse<Details>;
  export type ListResponse = ApiResponse<ListData>;

  // ----------------------
  // Query
  // ----------------------
  export interface ListQuery {
    page_no?: number;
    per_page?: number;
  }
}
