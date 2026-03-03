/**
 * Builds a URL from base and path segments with consistent trailing slash handling.
 * Automatically removes trailing slashes from segments and joins them properly.
 *
 * @param segments - URL segments to join (base URL, path parts, IDs, etc.)
 * @returns Complete URL string
 *
 * @example
 * ```typescript
 * buildUrl(client.config.baseUrl, "api/v1/customers", customerId)
 * // => "https://api.oak.com/api/v1/customers/123"
 *
 * buildUrl(client.config.baseUrl, "api/v1/customers/")
 * // => "https://api.oak.com/api/v1/customers"
 * ```
 */
export function buildUrl(...segments: (string | undefined)[]): string {
  return segments
    .filter((segment): segment is string => segment !== undefined && segment !== "")
    .map((segment) => segment.replace(/\/$/, "")) // Remove trailing slashes
    .join("/");
}
