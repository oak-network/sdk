import type { CreateSellRequest, CreateSellResponse, OakClient } from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";

export interface SellService {
  createSell(sellRequest: CreateSellRequest): Promise<CreateSellResponse>;
}

export const createSellService = (client: OakClient): SellService => ({
  async createSell(
    sellRequest: CreateSellRequest
  ): Promise<CreateSellResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.post<CreateSellResponse>(
        `${client.config.baseUrl}/api/v1/sell`,
        sellRequest,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to create sell", error);
    }
  },
});
