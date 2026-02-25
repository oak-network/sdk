import { OakClient, Provider, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

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

/**
 * @param client - Configured OakClient instance
 * @returns ProviderService instance
 */
export const createProviderService = (client: OakClient): ProviderService => ({
  async getSchema(
    request: Provider.GetSchemaRequest,
  ): Promise<Result<Provider.GetSchemaResponse>> {
    return withAuth(client, (token) =>
      httpClient.get<Provider.GetSchemaResponse>(
        `${buildUrl(client.config.baseUrl, "api/v1/provider-registration/schema")}?provider=${encodeURIComponent(
          request.provider,
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async getRegistrationStatus(
    customerId: string,
  ): Promise<Result<Provider.GetRegistrationStatusResponse>> {
    return withAuth(client, (token) =>
      httpClient.get<Provider.GetRegistrationStatusResponse>(
        buildUrl(client.config.baseUrl, "api/v1/provider-registration", customerId, "status"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async submitRegistration(
    customerId: string,
    registration: Provider.Request,
  ): Promise<Result<Provider.Response>> {
    return withAuth(client, (token) =>
      httpClient.post<Provider.Response>(
        buildUrl(client.config.baseUrl, "api/v1/provider-registration", customerId, "submit"),
        registration,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
