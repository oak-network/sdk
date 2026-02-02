import { AuthManager } from "./authManager";
import type { OakClient, OakClientConfig } from "./types";
import {
  DEFAULT_RETRY_OPTIONS,
  RetryOptions,
} from "./utils/defaultRetryConfig";

export function createOakClient(config: OakClientConfig): OakClient {
  const retryOptions: RetryOptions = {
    ...DEFAULT_RETRY_OPTIONS,
    ...config.retryOptions,
  };
  let authManager: AuthManager | null = null;

  const getAuthManager = (): AuthManager => {
    if (!authManager) {
      authManager = new AuthManager(config, retryOptions);
    }
    return authManager;
  };

  return {
    config,
    retryOptions,
    getAccessToken: () => getAuthManager().getAccessToken(),
    grantToken: () => getAuthManager().grantToken(),
  };
}
