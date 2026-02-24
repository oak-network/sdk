import type { Sell, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

export interface SellService {
  create(sellRequest: Sell.Request): Promise<Result<Sell.Response>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns SellService instance
 */
export const createSellService = (client: OakClient): SellService => ({
  async create(sellRequest: Sell.Request): Promise<Result<Sell.Response>> {
    return withAuth(client, (token) =>
      httpClient.post<Sell.Response>(
        buildUrl(client.config.baseUrl, "api/v1/sell"),
        sellRequest,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
