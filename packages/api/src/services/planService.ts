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
import { buildQueryString } from "./helpers";
import { err } from "../types";

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
  ): Promise<Result<CreatePlanResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.post<CreatePlanResponse>(
      `${client.config.baseUrl}/api/v1/subscription/plans`,
      createPlanRequest,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async publish(id: string): Promise<Result<PublishPlanResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.patch<PublishPlanResponse>(
      `${client.config.baseUrl}/api/v1/subscription/plans/${id}/publish`,
      undefined,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async details(id: string): Promise<Result<PlanDetailsResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.get<PlanDetailsResponse>(
      `${client.config.baseUrl}/api/v1/subscription/plans/${id}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async list(
    params?: PlansListQueryParams,
  ): Promise<Result<PlansListResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    const queryString = buildQueryString(params);
    return httpClient.get<PlansListResponse>(
      `${client.config.baseUrl}/api/v1/subscription/plans${queryString}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async update(
    id: string,
    updatePlanRequest: UpdatePlanRequest,
  ): Promise<Result<UpdatePlanResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.patch<UpdatePlanResponse>(
      `${client.config.baseUrl}/api/v1/subscription/plans/${id}`,
      updatePlanRequest,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async delete(id: string): Promise<Result<DeletePlanResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.delete<DeletePlanResponse>(
      `${client.config.baseUrl}/api/v1/subscription/plans/${id}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },
});
