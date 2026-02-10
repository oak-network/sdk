import { err, OakClient, Provider, Result } from "../types";
import { httpClient } from "../utils/httpClient";

export interface ProviderService {
  getSchema(
    request: Provider.GetSchemaRequest,
  ): Promise<Result<Provider.GetSchemaResponse>>;
  getRegistrationStatus(
    customerId: string,
  ): Promise<Result<Provider.GetRegistrationStatusResponse>>;
  submitRegistration(
    customerId: string,
    registration: Provider.Request,
  ): Promise<Result<Provider.Response>>;
}

export const createProviderService = (client: OakClient): ProviderService => ({
  async getSchema(
    request: Provider.GetSchemaRequest,
  ): Promise<Result<Provider.GetSchemaResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.get<Provider.GetSchemaResponse>(
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
  },

  async getRegistrationStatus(
    customerId: string,
  ): Promise<Result<Provider.GetRegistrationStatusResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.get<Provider.GetRegistrationStatusResponse>(
      `${client.config.baseUrl}/api/v1/provider-registration/${customerId}/status`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        retryOptions: client.retryOptions,
      },
    );
  },

  async submitRegistration(
    customerId: string,
    registration: Provider.Request,
  ): Promise<Result<Provider.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.post<Provider.Response>(
      `${client.config.baseUrl}/api/v1/provider-registration/${customerId}/submit`,
      registration,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        retryOptions: client.retryOptions,
      },
    );
  },
});
