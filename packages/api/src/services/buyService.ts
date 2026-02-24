import type { Buy, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

export interface BuyService {
  create(buyRequest: Buy.Request): Promise<Result<Buy.Response>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns BuyService instance
 */
export const createBuyService = (client: OakClient): BuyService => ({
  async create(buyRequest: Buy.Request): Promise<Result<Buy.Response>> {
    return withAuth(client, (token) =>
      httpClient.post<Buy.Response>(
        buildUrl(client.config.baseUrl, "api/v1/buy"),
        buyRequest,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
