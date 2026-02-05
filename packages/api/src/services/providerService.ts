import type {
  GetProviderRegistrationStatusResponse,
  GetProviderSchemaRequest,
  GetProviderSchemaResponse,
  OakClient,
  Result,
  SubmitProviderRegistrationRequest,
  SubmitProviderRegistrationResponse,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { getErrorBodyMessage } from "./helpers";
import { err, ok } from "../types";

export interface ProviderService {
  getSchema(
    request: GetProviderSchemaRequest,
  ): Promise<Result<GetProviderSchemaResponse>>;
  getRegistrationStatus(
    customerId: string,
  ): Promise<Result<GetProviderRegistrationStatusResponse>>;
  submitRegistration(
    customerId: string,
    registration: SubmitProviderRegistrationRequest,
  ): Promise<Result<SubmitProviderRegistrationResponse>>;
}

export const createProviderService = (client: OakClient): ProviderService => ({
  async getSchema(
    request: GetProviderSchemaRequest,
  ): Promise<Result<GetProviderSchemaResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.get<GetProviderSchemaResponse>(
        `${
          client.config.baseUrl
        }/api/v1/provider-registration/schema?provider=${encodeURIComponent(
          request.provider,
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return ok(response);
    } catch (error) {
      return err(
        new SDKError(
          `Failed to retrieve provider schema for ${request.provider}`,
          error,
        ),
      );
    }
  },

  async getRegistrationStatus(
    customerId: string,
  ): Promise<Result<GetProviderRegistrationStatusResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response =
        await httpClient.get<GetProviderRegistrationStatusResponse>(
          `${client.config.baseUrl}/api/v1/provider-registration/${customerId}/status`,
          {
            headers: {
              Authorization: `Bearer ${token.value}`,
            },
            retryOptions: client.retryOptions,
          },
        );

      return ok(response);
    } catch (error) {
      return err(
        new SDKError(
          `Failed to retrieve provider registration status for customer ${customerId}`,
          error,
        ),
      );
    }
  },

  async submitRegistration(
    customerId: string,
    registration: SubmitProviderRegistrationRequest,
  ): Promise<Result<SubmitProviderRegistrationResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response =
        await httpClient.post<SubmitProviderRegistrationResponse>(
          `${client.config.baseUrl}/api/v1/provider-registration/${customerId}/submit`,
          registration,
          {
            headers: {
              Authorization: `Bearer ${token.value}`,
            },
            retryOptions: client.retryOptions,
          },
        );

      return ok(response);
    } catch (error) {
      const msg = getErrorBodyMessage(error) || "Unknown error";
      return err(
        new SDKError(
          `Failed to submit provider registration for customer ${customerId}: ${msg}`,
          error,
        ),
      );
    }
  },
});
