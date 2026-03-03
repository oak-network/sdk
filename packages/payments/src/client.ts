import { AuthManager } from "./authManager";
import type { OakClient, OakClientConfig, ResolvedOakClientConfig, PublicOakClientConfig } from "./types";
import { resolveBaseUrl } from "./types/environment";
import {
  DEFAULT_RETRY_OPTIONS,
  RetryOptions,
} from "./utils/defaultRetryConfig";

/**
 * Creates a new Oak SDK client instance.
 * @param config - Client configuration including credentials and environment
 * @returns Configured OakClient instance
 *
 * @example
 * ```typescript
 * const client = createOakClient({
 *   environment: "sandbox",
 *   clientId: "your-client-id",
 *   clientSecret: "your-client-secret",
 * });
 * ```
 */
export function createOakClient(config: OakClientConfig): OakClient {
  const baseUrl = resolveBaseUrl(config.environment, config.customUrl);

  const resolvedConfig: ResolvedOakClientConfig = {
    ...config,
    baseUrl,
  };

  // Create public config without clientSecret for security
  const publicConfig: PublicOakClientConfig = {
    environment: config.environment,
    clientId: config.clientId,
    baseUrl,
    customUrl: config.customUrl,
    retryOptions: config.retryOptions,
  };

  const retryOptions: RetryOptions = {
    ...DEFAULT_RETRY_OPTIONS,
    ...config.retryOptions,
  };

  let authManager: AuthManager | null = null;

  const getAuthManager = (): AuthManager => {
    if (!authManager) {
      authManager = new AuthManager(resolvedConfig, retryOptions);
    }
    return authManager;
  };

  return {
    config: publicConfig,
    retryOptions,
    getAccessToken: () => getAuthManager().getAccessToken(),
    grantToken: () => getAuthManager().grantToken(),
  };
}
