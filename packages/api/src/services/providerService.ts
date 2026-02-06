import type { OakClient, Provider } from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { getErrorBodyMessage } from "./helpers";

export interface ProviderService {
  getSchema(
    request: Provider.GetSchemaRequest,
  ): Promise<Provider.GetSchemaResponse>;
  getRegistrationStatus(
    customerId: string,
  ): Promise<Provider.GetRegistrationStatusResponse>;
  submitRegistration(
    customerId: string,
    registration: Provider.Request,
  ): Promise<Provider.Response>;
}

export const createProviderService = (client: OakClient): ProviderService => ({
  async getSchema(
    request: Provider.GetSchemaRequest,
  ): Promise<Provider.GetSchemaResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.get<Provider.GetSchemaResponse>(
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
  ): Promise<Provider.GetRegistrationStatusResponse> {
    try {
      const token = await client.getAccessToken();

      const response =
        await httpClient.get<Provider.GetRegistrationStatusResponse>(
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
    registration: Provider.Request,
  ): Promise<Provider.Response> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.post<Provider.Response>(
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
