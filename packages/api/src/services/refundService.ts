import { OakClient, Refund, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

export interface RefundService {
  create(
    paymentId: string,
    refund: Refund.Request,
  ): Promise<Result<Refund.Response>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns RefundService instance
 */
export const createRefundService = (client: OakClient): RefundService => ({
  async create(
    paymentId: string,
    refund: Refund.Request,
  ): Promise<Result<Refund.Response>> {
    return withAuth(client, (token) =>
      httpClient.post<Refund.Response>(
        buildUrl(client.config.baseUrl, "api/v1/payments", paymentId, "refund"),
        refund,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
