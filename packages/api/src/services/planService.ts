import type { Plan, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { buildQueryString } from "./helpers";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

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

/**
 * @param client - Configured OakClient instance
 * @returns PlanService instance
 */
export const createPlanService = (client: OakClient): PlanService => ({
  async create(
    createPlanRequest: Plan.Request,
  ): Promise<Result<Plan.Response>> {
    return withAuth(client, (token) =>
      httpClient.post<Plan.Response>(
        buildUrl(client.config.baseUrl, "api/v1/subscription/plans"),
        createPlanRequest,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async publish(id: string): Promise<Result<Plan.Response>> {
    return withAuth(client, (token) =>
      httpClient.patch<Plan.Response>(
        buildUrl(client.config.baseUrl, "api/v1/subscription/plans", id, "publish"),
        undefined,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async details(id: string): Promise<Result<Plan.DetailsResponse>> {
    return withAuth(client, (token) =>
      httpClient.get<Plan.DetailsResponse>(
        buildUrl(client.config.baseUrl, "api/v1/subscription/plans", id),
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async list(params?: Plan.ListQuery): Promise<Result<Plan.ListResponse>> {
    const queryString = buildQueryString(params);
    return withAuth(client, (token) =>
      httpClient.get<Plan.ListResponse>(
        `${buildUrl(client.config.baseUrl, "api/v1/subscription/plans")}${queryString}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async update(
    id: string,
    updatePlanRequest: Plan.Request,
  ): Promise<Result<Plan.Response>> {
    return withAuth(client, (token) =>
      httpClient.patch<Plan.Response>(
        buildUrl(client.config.baseUrl, "api/v1/subscription/plans", id),
        updatePlanRequest,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async delete(id: string): Promise<Result<Plan.Response>> {
    return withAuth(client, (token) =>
      httpClient.delete<Plan.Response>(
        buildUrl(client.config.baseUrl, "api/v1/subscription/plans", id),
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
