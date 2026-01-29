import { SDKConfig, TokenRequest, TokenResponse, Result, ok, err } from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { RetryOptions } from "../utils/defaultRetryConfig";

export class AuthService {
  private config: SDKConfig;
  private accessToken: string | null = null;
  private tokenExpiration: number | null = null;
  private retryOptions: RetryOptions;

  constructor(config: SDKConfig, retryOptions: RetryOptions) {
    this.config = config;
    this.retryOptions = retryOptions;
  }

  async grantToken(): Promise<Result<TokenResponse, SDKError>> {
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
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to grant token", error));
    }
  }

  async getAccessToken(): Promise<Result<string, SDKError>> {
    const currentTime = Date.now();
    // Assume token is invalid if it doesn't exist or is within 60 seconds of expiring
    if (
      !this.accessToken ||
      !this.tokenExpiration ||
      currentTime >= this.tokenExpiration - 60000
    ) {
      const response = await this.grantToken();
      if (!response.ok) {
        return response;
      }
      return ok(response.value.access_token);
    }
    return ok(this.accessToken);
  }
}
