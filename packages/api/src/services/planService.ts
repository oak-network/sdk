import type {
  CreatePlanRequest,
  CreatePlanResponse,
  DeletePlanResponse,
  OakClient,
  PlanDetailsResponse,
  PlansListQueryParams,
  PlansListResponse,
  PublishPlanResponse,
  UpdatePlanRequest,
  UpdatePlanResponse,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { buildQueryString } from "./helpers";

export interface PlanService {
  createPlan(createPlanRequest: CreatePlanRequest): Promise<CreatePlanResponse>;
  publishPlan(id: string): Promise<PublishPlanResponse>;
  planDetails(id: string): Promise<PlanDetailsResponse>;
  listAvailablePlans(params?: PlansListQueryParams): Promise<PlansListResponse>;
  updatePlan(id: string, updatePlanRequest: UpdatePlanRequest): Promise<UpdatePlanResponse>;
  deletePlan(id: string): Promise<DeletePlanResponse>;
}

export const createPlanService = (client: OakClient): PlanService => ({
  async createPlan(
    createPlanRequest: CreatePlanRequest
  ): Promise<CreatePlanResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.post<CreatePlanResponse>(
        `${client.config.baseUrl}/api/v1/subscription/plans`,
        createPlanRequest,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to create plan", error);
    }
  },

  async publishPlan(id: string): Promise<PublishPlanResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.patch<PublishPlanResponse>(
        `${client.config.baseUrl}/api/v1/subscription/plans/${id}/publish`,
        undefined,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to publish plan", error);
    }
  },

  async planDetails(id: string): Promise<PlanDetailsResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.get<PlanDetailsResponse>(
        `${client.config.baseUrl}/api/v1/subscription/plans/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to get plan details", error);
    }
  },

  async listAvailablePlans(
    params?: PlansListQueryParams
  ): Promise<PlansListResponse> {
    try {
      const token = await client.getAccessToken();
      const queryString = buildQueryString(params);
      const response = await httpClient.get<PlansListResponse>(
        `${client.config.baseUrl}/api/v1/subscription/plans${queryString}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to get available plans", error);
    }
  },

  async updatePlan(
    id: string,
    updatePlanRequest: UpdatePlanRequest
  ): Promise<UpdatePlanResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.patch<UpdatePlanResponse>(
        `${client.config.baseUrl}/api/v1/subscription/plans/${id}`,
        updatePlanRequest,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to update plan", error);
    }
  },

  async deletePlan(id: string): Promise<DeletePlanResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.delete<DeletePlanResponse>(
        `${client.config.baseUrl}/api/v1/subscription/plans/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to delete plan", error);
    }
  },
});
