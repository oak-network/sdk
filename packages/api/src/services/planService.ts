import type { Plan, OakClient } from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { buildQueryString } from "./helpers";

export interface PlanService {
  create(createPlanRequest: Plan.Request): Promise<Plan.Response>;
  publish(id: string): Promise<Plan.Response>;
  details(id: string): Promise<Plan.DetailsResponse>;
  list(params?: Plan.ListQuery): Promise<Plan.ListResponse>;
  update(id: string, updatePlanRequest: Plan.Request): Promise<Plan.Response>;
  delete(id: string): Promise<Plan.Response>;
}

export const createPlanService = (client: OakClient): PlanService => ({
  async create(createPlanRequest: Plan.Request): Promise<Plan.Response> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.post<Plan.Response>(
        `${client.config.baseUrl}/api/v1/subscription/plans`,
        createPlanRequest,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to create plan", error);
    }
  },

  async publish(id: string): Promise<Plan.Response> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.patch<Plan.Response>(
        `${client.config.baseUrl}/api/v1/subscription/plans/${id}/publish`,
        undefined,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to publish plan", error);
    }
  },

  async details(id: string): Promise<Plan.DetailsResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.get<Plan.DetailsResponse>(
        `${client.config.baseUrl}/api/v1/subscription/plans/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to get plan details", error);
    }
  },

  async list(params?: Plan.ListQuery): Promise<Plan.ListResponse> {
    try {
      const token = await client.getAccessToken();
      const queryString = buildQueryString(params);
      const response = await httpClient.get<Plan.ListResponse>(
        `${client.config.baseUrl}/api/v1/subscription/plans${queryString}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to get available plans", error);
    }
  },

  async update(
    id: string,
    updatePlanRequest: Plan.Request,
  ): Promise<Plan.Response> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.patch<Plan.Response>(
        `${client.config.baseUrl}/api/v1/subscription/plans/${id}`,
        updatePlanRequest,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to update plan", error);
    }
  },

  async delete(id: string): Promise<Plan.Response> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.delete<Plan.Response>(
        `${client.config.baseUrl}/api/v1/subscription/plans/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to delete plan", error);
    }
  },
});
