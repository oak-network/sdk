import type { OakClientConfig, TokenRequest, TokenResponse } from "./types";
import { httpClient } from "./utils/httpClient";
import { SDKError } from "./utils/errorHandler";
import { RetryOptions } from "./utils/defaultRetryConfig";

export class AuthManager {
  private config: OakClientConfig;
  private accessToken: string | null = null;
  private tokenExpiration: number | null = null;
  private retryOptions: RetryOptions;

  constructor(config: OakClientConfig, retryOptions: RetryOptions) {
    this.config = config;
    this.retryOptions = retryOptions;
  }

  async grantToken(): Promise<TokenResponse> {
    try {
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
      this.accessToken = response.access_token;
      this.tokenExpiration = Date.now() + response.expires_in;
      return response;
    } catch (error) {
      throw new SDKError("Failed to grant token", error);
    }
  }

  async getAccessToken(): Promise<string> {
    const currentTime = Date.now();
    // Assume token is invalid if it doesn't exist or is within 60 seconds of expiring
    if (
      !this.accessToken ||
      !this.tokenExpiration ||
      currentTime >= this.tokenExpiration - 60000
    ) {
      const response = await this.grantToken();
      return response.access_token;
    }
    return this.accessToken;
  }
}
