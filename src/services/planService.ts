import {
  SDKConfig,
  CreatePlanRequest,
  CreatePlanResponse,
  PlanDetailsResponse,
  PlansListResponse,
  PlansListQueryParams,
  DeletePlanResponse,
  PublishPlanResponse,
  UpdatePlanRequest,
  UpdatePlanResponse,
  Result,
  ok,
  err,
} from "../types";
import { httpClient, SDKError } from "../utils";
import { RetryOptions } from "../utils/defaultRetryConfig";
import { AuthService } from "./authService";

export class PlanService {
  private config: SDKConfig;
  private authService: AuthService;
  private retryOptions: RetryOptions;

  constructor(
    config: SDKConfig,
    authService: AuthService,
    retryOptions: RetryOptions
  ) {
    this.config = config;
    this.authService = authService;
    this.retryOptions = retryOptions;
  }

  async createPlan(
    createPlanRequest: CreatePlanRequest
  ): Promise<Result<CreatePlanResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.post<CreatePlanResponse>(
        `${this.config.baseUrl}/api/v1/subscription/plans`,
        createPlanRequest,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to create plan", error));
    }
  }

  async publishPlan(
    id: string
  ): Promise<Result<PublishPlanResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.patch<PublishPlanResponse>(
        `${this.config.baseUrl}/api/v1/subscription/plans/${id}/publish`,
        undefined, // no body needed
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to publish plan", error));
    }
  }

  async planDetails(
    id: string
  ): Promise<Result<PlanDetailsResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.get<PlanDetailsResponse>(
        `${this.config.baseUrl}/api/v1/subscription/plans/${id}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to get plan details", error));
    }
  }

  async listAvailablePlans(
    params?: PlansListQueryParams
  ): Promise<Result<PlansListResponse, SDKError>> {
    const queryString = params
      ? `?${Object.entries(params)
          .filter(([_, value]) => value !== undefined)
          .map(
            ([key, value]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
          )
          .join("&")}`
      : "";

    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.get<PlansListResponse>(
        `${this.config.baseUrl}/api/v1/subscription/plans/${queryString}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to get available plans", error));
    }
  }

  async updatePlan(
    id: string,
    createPlanRequest: UpdatePlanRequest
  ): Promise<Result<UpdatePlanResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.patch<UpdatePlanResponse>(
        `${this.config.baseUrl}/api/v1/subscription/plans/${id}`,
        createPlanRequest,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to update plan", error));
    }
  }

  async deletePlan(id: string): Promise<Result<DeletePlanResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.delete<DeletePlanResponse>(
        `${this.config.baseUrl}/api/v1/subscription/plans/${id}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to delete plan", error));
    }
  }
}
