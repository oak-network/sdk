import type { OakClient, Country, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { buildUrl } from "../utils/buildUrl";

export interface CountryService {
  /**
   * Lists all countries with KYC support status.
   * This is a public endpoint — no authentication required.
   *
   * @returns Result containing the list of countries or error
   *
   * @example
   * ```typescript
   * const result = await countryService.list();
   * if (result.ok) {
   *   console.log(result.value.data.countries);
   * }
   * ```
   */
  list(): Promise<Result<Country.ListResponse>>;
}

/**
 * Creates a service for fetching the public list of supported countries.
 *
 * @param client - Configured OakClient instance
 * @returns CountryService instance
 *
 * @example
 * ```typescript
 * const countryService = createCountryService(client);
 * const result = await countryService.list();
 * ```
 */
export const createCountryService = (client: OakClient): CountryService => ({
  async list(): Promise<Result<Country.ListResponse>> {
    return httpClient.get<Country.ListResponse>(
      buildUrl(client.config.baseUrl, "api/v1/countries"),
      {
        retryOptions: client.retryOptions,
      },
    );
  },
});
