import type { Sell, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { err } from "../types";

export interface SellService {
  create(sellRequest: Sell.Request): Promise<Result<Sell.Response>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns SellService instance
 */
export const createSellService = (client: OakClient): SellService => ({
  async create(sellRequest: Sell.Request): Promise<Result<Sell.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.post<Sell.Response>(
      `${client.config.baseUrl}/api/v1/sell`,
      sellRequest,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },
});
