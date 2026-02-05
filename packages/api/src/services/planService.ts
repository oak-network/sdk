import type {
  CreatePlanRequest,
  CreatePlanResponse,
  DeletePlanResponse,
  OakClient,
  PlanDetailsResponse,
  PlansListQueryParams,
  PlansListResponse,
  PublishPlanResponse,
  Result,
  UpdatePlanRequest,
  UpdatePlanResponse,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { buildQueryString } from "./helpers";
import { err, ok } from "../types";

export interface PlanService {
  create(
    createPlanRequest: CreatePlanRequest,
  ): Promise<Result<CreatePlanResponse>>;
  publish(id: string): Promise<Result<PublishPlanResponse>>;
  details(id: string): Promise<Result<PlanDetailsResponse>>;
  list(params?: PlansListQueryParams): Promise<Result<PlansListResponse>>;
  update(
    id: string,
    updatePlanRequest: UpdatePlanRequest,
  ): Promise<Result<UpdatePlanResponse>>;
  delete(id: string): Promise<Result<DeletePlanResponse>>;
}

export const createPlanService = (client: OakClient): PlanService => ({
  async create(
    createPlanRequest: CreatePlanRequest,
  ): Promise<Result<CreatePlanResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.post<CreatePlanResponse>(
        `${client.config.baseUrl}/api/v1/subscription/plans`,
        createPlanRequest,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to create plan", error));
    }
  },

  async publish(id: string): Promise<Result<PublishPlanResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.patch<PublishPlanResponse>(
        `${client.config.baseUrl}/api/v1/subscription/plans/${id}/publish`,
        undefined,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to publish plan", error));
    }
  },

  async details(id: string): Promise<Result<PlanDetailsResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.get<PlanDetailsResponse>(
        `${client.config.baseUrl}/api/v1/subscription/plans/${id}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to get plan details", error));
    }
  },

  async list(
    params?: PlansListQueryParams,
  ): Promise<Result<PlansListResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const queryString = buildQueryString(params);
      const response = await httpClient.get<PlansListResponse>(
        `${client.config.baseUrl}/api/v1/subscription/plans${queryString}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to get available plans", error));
    }
  },

  async update(
    id: string,
    updatePlanRequest: UpdatePlanRequest,
  ): Promise<Result<UpdatePlanResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.patch<UpdatePlanResponse>(
        `${client.config.baseUrl}/api/v1/subscription/plans/${id}`,
        updatePlanRequest,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to update plan", error));
    }
  },

  async delete(id: string): Promise<Result<DeletePlanResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.delete<DeletePlanResponse>(
        `${client.config.baseUrl}/api/v1/subscription/plans/${id}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to delete plan", error));
    }
  },
});
