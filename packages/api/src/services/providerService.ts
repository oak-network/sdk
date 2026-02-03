import type {
  GetProviderRegistrationStatusResponse,
  GetProviderSchemaRequest,
  GetProviderSchemaResponse,
  OakClient,
  SubmitProviderRegistrationRequest,
  SubmitProviderRegistrationResponse,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { getErrorBodyMessage } from "./helpers";

export interface ProviderService {
  getSchema(
    request: GetProviderSchemaRequest,
  ): Promise<GetProviderSchemaResponse>;
  getRegistrationStatus(
    customerId: string,
  ): Promise<GetProviderRegistrationStatusResponse>;
  submitRegistration(
    customerId: string,
    registration: SubmitProviderRegistrationRequest,
  ): Promise<SubmitProviderRegistrationResponse>;
}

export const createProviderService = (client: OakClient): ProviderService => ({
  async getSchema(
    request: GetProviderSchemaRequest,
  ): Promise<GetProviderSchemaResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.get<GetProviderSchemaResponse>(
        `${
          client.config.baseUrl
        }/api/v1/provider-registration/schema?provider=${encodeURIComponent(
          request.provider,
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to retrieve provider schema for ${request.provider}`,
        error,
      );
    }
  },

  async getRegistrationStatus(
    customerId: string,
  ): Promise<GetProviderRegistrationStatusResponse> {
    try {
      const token = await client.getAccessToken();

      const response =
        await httpClient.get<GetProviderRegistrationStatusResponse>(
          `${client.config.baseUrl}/api/v1/provider-registration/${customerId}/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            retryOptions: client.retryOptions,
          },
        );

      return response;
    } catch (error) {
      throw new SDKError(
        `Failed to retrieve provider registration status for customer ${customerId}`,
        error,
      );
    }
  },

  async submitRegistration(
    customerId: string,
    registration: SubmitProviderRegistrationRequest,
  ): Promise<SubmitProviderRegistrationResponse> {
    try {
      const token = await client.getAccessToken();

      const response =
        await httpClient.post<SubmitProviderRegistrationResponse>(
          `${client.config.baseUrl}/api/v1/provider-registration/${customerId}/submit`,
          registration,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            retryOptions: client.retryOptions,
          },
        );

      return response;
    } catch (error) {
      const msg = getErrorBodyMessage(error) || "Unknown error";
      throw new SDKError(
        `Failed to submit provider registration for customer ${customerId}: ${msg}`,
        error,
      );
    }
  },
});
