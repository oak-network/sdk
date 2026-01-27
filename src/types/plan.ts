// ----------------------
// Shared Request Fields

import { ApiResponse } from "./common";

// ----------------------
export interface PlanBaseRequest {
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

// Requests
export interface CreatePlanRequest extends PlanBaseRequest {}
export interface UpdatePlanRequest extends PlanBaseRequest {}

// ----------------------
// Plan Data Structure
// ----------------------
export interface PlanDetails {
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

// ----------------------
// Pagination
// ----------------------
export interface Pagination {
  per_page: number;
  page_no: number;
  total: number;
}

export interface PlansListData {
  data: PlanDetails[];
  pagination: Pagination;
}

// ----------------------
// API Responses
// ----------------------
export type CreatePlanResponse = ApiResponse<string>;
export type UpdatePlanResponse = ApiResponse<string>;
export type PublishPlanResponse = ApiResponse<string>;
export type DeletePlanResponse = ApiResponse<string>;
export type PlanDetailsResponse = ApiResponse<PlanDetails>;
export type PlansListResponse = ApiResponse<PlansListData>;

// ----------------------
// Query Params
// ----------------------
export interface PlansListQueryParams {
  page_no?: number;
  per_page?: number;
}
