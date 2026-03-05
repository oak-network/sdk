import type { OakClient, Result } from "../types";
import { err } from "../types";

/**
 * Higher-order function that wraps HTTP operations with authentication.
 * Handles token fetching and error propagation automatically.
 *
 * @param client - Configured OakClient instance
 * @param operation - Callback that receives the access token and returns a Result
 * @returns Result from the operation or token fetch error
 *
 * @example
 * ```typescript
 * return withAuth(client, (token) =>
 *   httpClient.post<Response>(url, data, {
 *     headers: { Authorization: `Bearer ${token}` },
 *     retryOptions: client.retryOptions,
 *   })
 * );
 * ```
 */
export async function withAuth<T>(
  client: OakClient,
  operation: (token: string) => Promise<Result<T>>,
): Promise<Result<T>> {
  const tokenResult = await client.getAccessToken();
  if (!tokenResult.ok) {
    return err(tokenResult.error);
  }
  return operation(tokenResult.value);
}
