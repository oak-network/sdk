import type { Merchant, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

export interface MerchantService {
  calculateTransferDate(
    request: Merchant.TransferDateRequest,
  ): Promise<Result<Merchant.TransferDateResponse>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns MerchantService instance
 */
export const createMerchantService = (
  client: OakClient,
): MerchantService => ({
  async calculateTransferDate(
    request: Merchant.TransferDateRequest,
  ): Promise<Result<Merchant.TransferDateResponse>> {
    return withAuth(client, (token) =>
      httpClient.post<Merchant.TransferDateResponse>(
        buildUrl(client.config.baseUrl, "api/v1/merchant/util/transfer-date"),
        request,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
