import type {
  CreateSellRequest,
  CreateSellResponse,
  OakClient,
  Result,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { err, ok } from "../types";

export interface SellService {
  create(sellRequest: CreateSellRequest): Promise<Result<CreateSellResponse>>;
}

export const createSellService = (client: OakClient): SellService => ({
  async create(
    sellRequest: CreateSellRequest,
  ): Promise<Result<CreateSellResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.post<CreateSellResponse>(
        `${client.config.baseUrl}/api/v1/sell`,
        sellRequest,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to create sell", error));
    }
  },
});
