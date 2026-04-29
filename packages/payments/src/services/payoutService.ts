import type { Payout, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

export interface PayoutService {
  create(request: Payout.Request): Promise<Result<Payout.Response>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns PayoutService instance
 */
export const createPayoutService = (client: OakClient): PayoutService => ({
  async create(request: Payout.Request): Promise<Result<Payout.Response>> {
    return withAuth(client, (token) =>
      httpClient.post<Payout.Response>(
        buildUrl(client.config.baseUrl, "api/v1/outbound_payments"),
        request,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
