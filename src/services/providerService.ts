import {
  SDKConfig,
  GetProviderSchemaResponse,
  GetProviderRegistrationStatusResponse,
  SubmitProviderRegistrationRequest,
  SubmitProviderRegistrationResponse,
  GetProviderSchemaRequest,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { AuthService } from "./authService";
import { RetryOptions } from "../utils/defaultRetryConfig";

export class ProviderService {
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

  async getProviderSchema(
    getProviderSchemaRequest: GetProviderSchemaRequest
  ): Promise<GetProviderSchemaResponse> {
    try {
      const token = await this.authService.getAccessToken();

      const response = await httpClient.get<GetProviderSchemaResponse>(
        `${
          this.config.baseUrl
        }/api/v1/provider-registration/schema?provider=${encodeURIComponent(
          getProviderSchemaRequest.provider
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to retrieve provider schema for ${getProviderSchemaRequest.provider}`,
        error
      );
    }
  }

  async getProviderRegistrationStatus(
    customerId: string
  ): Promise<GetProviderRegistrationStatusResponse> {
    try {
      const token = await this.authService.getAccessToken();

      const response =
        await httpClient.get<GetProviderRegistrationStatusResponse>(
          `${this.config.baseUrl}/api/v1/provider-registration/${customerId}/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            retryOptions: this.retryOptions,
          }
        );

      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to retrieve provider registration status for customer ${customerId}`,
        error
      );
    }
  }

  async submitProviderRegistration(
    customerId: string,
    registration: SubmitProviderRegistrationRequest
  ): Promise<SubmitProviderRegistrationResponse> {
    try {
      const token = await this.authService.getAccessToken();

      const response =
        await httpClient.post<SubmitProviderRegistrationResponse>(
          `${this.config.baseUrl}/api/v1/provider-registration/${customerId}/submit`,
          registration,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            retryOptions: this.retryOptions,
          }
        );

      return response;
    } catch (error: any) {
      const msg = error.body?.msg || "Unknown error";
      throw new SDKError(
        `Failed to submit provider registration for customer ${customerId}: ${msg}`,
        error
      );
    }
  }
}
