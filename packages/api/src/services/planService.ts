import type { Plan, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { buildQueryString } from "./helpers";
import { err } from "../types";

export interface PlanService {
  create(createPlanRequest: Plan.Request): Promise<Result<Plan.Response>>;
  publish(id: string): Promise<Result<Plan.Response>>;
  details(id: string): Promise<Result<Plan.DetailsResponse>>;
  list(params?: Plan.ListQuery): Promise<Result<Plan.ListResponse>>;
  update(
    id: string,
    updatePlanRequest: Plan.Request,
  ): Promise<Result<Plan.Response>>;
  delete(id: string): Promise<Result<Plan.Response>>;
}

export const createPlanService = (client: OakClient): PlanService => ({
  async create(
    createPlanRequest: Plan.Request,
  ): Promise<Result<Plan.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.post<Plan.Response>(
      `${client.config.baseUrl}/api/v1/subscription/plans`,
      createPlanRequest,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async publish(id: string): Promise<Result<Plan.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.patch<Plan.Response>(
      `${client.config.baseUrl}/api/v1/subscription/plans/${id}/publish`,
      undefined,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async details(id: string): Promise<Result<Plan.DetailsResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.get<Plan.DetailsResponse>(
      `${client.config.baseUrl}/api/v1/subscription/plans/${id}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async list(params?: Plan.ListQuery): Promise<Result<Plan.ListResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    const queryString = buildQueryString(params);
    return httpClient.get<Plan.ListResponse>(
      `${client.config.baseUrl}/api/v1/subscription/plans${queryString}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async update(
    id: string,
    updatePlanRequest: Plan.Request,
  ): Promise<Result<Plan.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.patch<Plan.Response>(
      `${client.config.baseUrl}/api/v1/subscription/plans/${id}`,
      updatePlanRequest,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async delete(id: string): Promise<Result<Plan.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.delete<Plan.Response>(
      `${client.config.baseUrl}/api/v1/subscription/plans/${id}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },
});
