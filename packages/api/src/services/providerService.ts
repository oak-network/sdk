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
import { err } from "../types";

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
  ): Promise<Result<GetProviderSchemaResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.get<GetProviderSchemaResponse>(
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
  ): Promise<Result<GetProviderRegistrationStatusResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.get<GetProviderRegistrationStatusResponse>(
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
    registration: SubmitProviderRegistrationRequest,
  ): Promise<Result<SubmitProviderRegistrationResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.post<SubmitProviderRegistrationResponse>(
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
