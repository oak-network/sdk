import type {
  CreateBuyRequest,
  CreateBuyResponse,
  OakClient,
  Result,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { err, ok } from "../types";

export interface BuyService {
  create(buyRequest: CreateBuyRequest): Promise<Result<CreateBuyResponse>>;
}

export const createBuyService = (client: OakClient): BuyService => ({
  async create(
    buyRequest: CreateBuyRequest,
  ): Promise<Result<CreateBuyResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.post<CreateBuyResponse>(
        `${client.config.baseUrl}/api/v1/buy`,
        buyRequest,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to create buy", error));
    }
  },
});
