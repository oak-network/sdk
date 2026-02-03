import type { CreateBuyRequest, CreateBuyResponse, OakClient } from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";

export interface BuyService {
  create(buyRequest: CreateBuyRequest): Promise<CreateBuyResponse>;
}

export const createBuyService = (client: OakClient): BuyService => ({
  async create(buyRequest: CreateBuyRequest): Promise<CreateBuyResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.post<CreateBuyResponse>(
        `${client.config.baseUrl}/api/v1/buy`,
        buyRequest,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to create buy", error);
    }
  },
});
