import type { Tax, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

export interface TaxService {
  calculate(request: Tax.CalculateRequest): Promise<Result<Tax.CalculateResponse>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns TaxService instance
 */
export const createTaxService = (client: OakClient): TaxService => ({
  async calculate(
    request: Tax.CalculateRequest,
  ): Promise<Result<Tax.CalculateResponse>> {
    return withAuth(client, (token) =>
      httpClient.post<Tax.CalculateResponse>(
        buildUrl(client.config.baseUrl, "api/v1/taxes/calculate"),
        request,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
