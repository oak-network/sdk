import type {
  CreateSellRequest,
  CreateSellResponse,
  OakClient,
  Result,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { err } from "../types";

export interface SellService {
  create(sellRequest: CreateSellRequest): Promise<Result<CreateSellResponse>>;
}

export const createSellService = (client: OakClient): SellService => ({
  async create(
    sellRequest: CreateSellRequest,
  ): Promise<Result<CreateSellResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.post<CreateSellResponse>(
      `${client.config.baseUrl}/api/v1/sell`,
      sellRequest,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },
});
