import { AuthManager } from "./authManager";
import type { OakClient, OakClientConfig, ResolvedOakClientConfig } from "./types";
import { resolveBaseUrl } from "./types/environment";
import {
  DEFAULT_RETRY_OPTIONS,
  RetryOptions,
} from "./utils/defaultRetryConfig";

export function createOakClient(config: OakClientConfig): OakClient {
  const baseUrl = resolveBaseUrl(config.environment, config.customUrl);

  const resolvedConfig: ResolvedOakClientConfig = {
    ...config,
    baseUrl,
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
    config: resolvedConfig,
    retryOptions,
    getAccessToken: () => getAuthManager().getAccessToken(),
    grantToken: () => getAuthManager().grantToken(),
  };
}
