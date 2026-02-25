import type { Transfer, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

export interface TransferService {
  create(transfer: Transfer.Request): Promise<Result<Transfer.Response>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns TransferService instance
 */
export const createTransferService = (client: OakClient): TransferService => ({
  async create(transfer: Transfer.Request): Promise<Result<Transfer.Response>> {
    return withAuth(client, (token) =>
      httpClient.post<Transfer.Response>(
        buildUrl(client.config.baseUrl, "api/v1/transfer"),
        transfer,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
