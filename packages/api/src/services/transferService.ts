import type { Transfer, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { err } from "../types";

export interface TransferService {
  create(transfer: Transfer.Request): Promise<Result<Transfer.Response>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns TransferService instance
 */
export const createTransferService = (client: OakClient): TransferService => ({
  async create(transfer: Transfer.Request): Promise<Result<Transfer.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.post<Transfer.Response>(
      `${client.config.baseUrl}/api/v1/transfer`,
      transfer,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        retryOptions: client.retryOptions,
      },
    );
  },
});
