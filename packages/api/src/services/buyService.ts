import type {
  CreateBuyRequest,
  CreateBuyResponse,
  OakClient,
  Result,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { err } from "../types";

export interface BuyService {
  create(buyRequest: CreateBuyRequest): Promise<Result<CreateBuyResponse>>;
}

export const createBuyService = (client: OakClient): BuyService => ({
  async create(
    buyRequest: CreateBuyRequest,
  ): Promise<Result<CreateBuyResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.post<CreateBuyResponse>(
      `${client.config.baseUrl}/api/v1/buy`,
      buyRequest,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },
});
