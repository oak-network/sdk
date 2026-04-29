import type { Pix, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

export interface PixService {
  createPaid(request: Pix.PaidRequest): Promise<Result<Pix.PaidResponse>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns PixService instance
 */
export const createPixService = (client: OakClient): PixService => ({
  async createPaid(
    request: Pix.PaidRequest,
  ): Promise<Result<Pix.PaidResponse>> {
    return withAuth(client, (token) =>
      httpClient.post<Pix.PaidResponse>(
        buildUrl(client.config.baseUrl, "api/v1/pix/paid"),
        request,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
