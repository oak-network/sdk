import type { RetryOptions } from "../utils";
import type { Result } from "./result";
import type { TokenResponse } from "./token";

export interface OakClientConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  retryOptions?: Partial<RetryOptions>;
}

export interface OakClient {
  readonly config: OakClientConfig;
  readonly retryOptions: RetryOptions;
  getAccessToken(): Promise<Result<string>>;
  grantToken(): Promise<Result<TokenResponse>>;
}
