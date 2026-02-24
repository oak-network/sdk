import type {
  ResolvedOakClientConfig,
  Result,
  TokenRequest,
  TokenResponse,
} from "./types";
import { httpClient } from "./utils/httpClient";
import { ApiError, OakError } from "./utils/errorHandler";
import { RetryOptions } from "./utils/defaultRetryConfig";
import { err, ok } from "./types";

export class AuthManager {
  private config: ResolvedOakClientConfig;
  private accessToken: string | null = null;
  private tokenExpiration: number | null = null;
  private retryOptions: RetryOptions;
  /** Coalesces concurrent token refresh so only one grantToken() runs at a time. */
  private refreshPromise: Promise<Result<TokenResponse, OakError>> | null = null;

  /**
   * @param config - Resolved client configuration
   * @param retryOptions - Retry options for token requests
   */
  constructor(config: ResolvedOakClientConfig, retryOptions: RetryOptions) {
    this.config = config;
    this.retryOptions = retryOptions;
  }

  /**
   * Requests a new OAuth token from the API.
   * @returns Result containing TokenResponse or error
   */
  async grantToken(): Promise<Result<TokenResponse, OakError>> {
    const payload: TokenRequest = {
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: "client_credentials",
    };

    const response = await httpClient.post<TokenResponse>(
      `${this.config.baseUrl}/api/v1/merchant/token/grant`,
      payload,
      {
        retryOptions: this.retryOptions,
      }
    );
    if (!response.ok) {
      if (response.error instanceof ApiError && response.error.status === 401) {
        this.accessToken = null;
        this.tokenExpiration = null;
      }
      return err(response.error);
    }
    this.accessToken = response.value.access_token;
    // Convert expires_in from seconds to milliseconds
    this.tokenExpiration = Date.now() + (response.value.expires_in * 1000);
    return ok(response.value);
  }

  /**
   * Gets a valid access token, refreshing if expired.
   * Concurrent callers share a single in-flight refresh to avoid race conditions.
   * @returns Result containing the access token string or error
   */
  async getAccessToken(): Promise<Result<string, OakError>> {
    const currentTime = Date.now();
    const needsRefresh =
      !this.accessToken ||
      !this.tokenExpiration ||
      currentTime >= this.tokenExpiration - 60000;

    if (!needsRefresh && this.accessToken) {
      return ok(this.accessToken);
    }

    if (!this.refreshPromise) {
      this.refreshPromise = this.grantToken().finally(() => {
        this.refreshPromise = null;
      });
    }

    const response = await this.refreshPromise;
    if (!response.ok) {
      return response;
    }
    return ok(response.value.access_token);
  }
}
