import type { RetryOptions } from "../utils";
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
  getAccessToken(): Promise<string>;
  grantToken(): Promise<TokenResponse>;
}
