import type { ProviderProxy, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

export interface ProviderProxyService {
  proxy(
    provider: string,
    request: ProviderProxy.Request,
  ): Promise<Result<ProviderProxy.Response>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns ProviderProxyService instance
 */
export const createProviderProxyService = (
  client: OakClient,
): ProviderProxyService => ({
  async proxy(
    provider: string,
    request: ProviderProxy.Request,
  ): Promise<Result<ProviderProxy.Response>> {
    return withAuth(client, (token) =>
      httpClient.post<ProviderProxy.Response>(
        buildUrl(client.config.baseUrl, "api/v1/providers", provider, "proxy"),
        request,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
