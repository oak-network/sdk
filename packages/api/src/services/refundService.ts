import { err, OakClient, Refund, Result } from "../types";
import { httpClient } from "../utils/httpClient";

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
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.post<Refund.Response>(
      `${client.config.baseUrl}/api/v1/payments/${paymentId}/refund`,
      refund,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },
});
