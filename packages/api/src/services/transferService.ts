import type { Transfer, OakClient } from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";

export interface TransferService {
  create(transfer: Transfer.Request): Promise<Transfer.Response>;
}

export const createTransferService = (client: OakClient): TransferService => ({
  async create(transfer: Transfer.Request): Promise<Transfer.Response> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.post<Transfer.Response>(
        `${client.config.baseUrl}/api/v1/transfer`,
        transfer,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      );

      return response;
    } catch (error) {
      throw new SDKError("Failed to create transfer", error);
    }
  },
});
