import {
  SDKConfig,
  GetProviderSchemaResponse,
  GetProviderRegistrationStatusResponse,
  SubmitProviderRegistrationRequest,
  SubmitProviderRegistrationResponse,
  GetProviderSchemaRequest,
  Result,
  ok,
  err,
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
  ): Promise<Result<GetProviderSchemaResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.get<GetProviderSchemaResponse>(
        `${
          this.config.baseUrl
        }/api/v1/provider-registration/schema?provider=${encodeURIComponent(
          getProviderSchemaRequest.provider
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: this.retryOptions,
        }
      );

      return ok(response);
    } catch (error) {
      return err(
        new SDKError(
          `Failed to retrieve provider schema for ${getProviderSchemaRequest.provider}`,
          error
        )
      );
    }
  }

  async getProviderRegistrationStatus(
    customerId: string
  ): Promise<Result<GetProviderRegistrationStatusResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response =
        await httpClient.get<GetProviderRegistrationStatusResponse>(
          `${this.config.baseUrl}/api/v1/provider-registration/${customerId}/status`,
          {
            headers: {
              Authorization: `Bearer ${token.value}`,
            },
            retryOptions: this.retryOptions,
          }
        );

      return ok(response);
    } catch (error) {
      return err(
        new SDKError(
          `Failed to retrieve provider registration status for customer ${customerId}`,
          error
        )
      );
    }
  }

  async submitProviderRegistration(
    customerId: string,
    registration: SubmitProviderRegistrationRequest
  ): Promise<Result<SubmitProviderRegistrationResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response =
        await httpClient.post<SubmitProviderRegistrationResponse>(
          `${this.config.baseUrl}/api/v1/provider-registration/${customerId}/submit`,
          registration,
          {
            headers: {
              Authorization: `Bearer ${token.value}`,
            },
            retryOptions: this.retryOptions,
          }
        );

      return ok(response);
    } catch (error: any) {
      const msg = error.body?.msg || "Unknown error";
      return err(
        new SDKError(
          `Failed to submit provider registration for customer ${customerId}: ${msg}`,
          error
        )
      );
    }
  }
}
