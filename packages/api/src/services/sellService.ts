import type { Sell, OakClient } from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";

export interface SellService {
  create(sellRequest: Sell.Request): Promise<Sell.Response>;
}

export const createSellService = (client: OakClient): SellService => ({
  async create(sellRequest: Sell.Request): Promise<Sell.Response> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.post<Sell.Response>(
        `${client.config.baseUrl}/api/v1/sell`,
        sellRequest,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to create sell", error);
    }
  },
});
