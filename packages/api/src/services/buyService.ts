import type { Buy, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { err } from "../types";

export interface BuyService {
  create(buyRequest: Buy.Request): Promise<Result<Buy.Response>>;
}

export const createBuyService = (client: OakClient): BuyService => ({
  async create(buyRequest: Buy.Request): Promise<Result<Buy.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.post<Buy.Response>(
      `${client.config.baseUrl}/api/v1/buy`,
      buyRequest,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },
});
