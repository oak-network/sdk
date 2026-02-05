import type { RetryOptions } from "../utils";
import type { Result } from "./result";
import type { TokenResponse } from "./token";
import type { OakEnvironment } from "./environment";

export interface OakClientConfig {
  environment: OakEnvironment;
  clientId: string;
  clientSecret: string;
  customUrl?: string;
  retryOptions?: Partial<RetryOptions>;
}

export interface ResolvedOakClientConfig extends OakClientConfig {
  baseUrl: string;
}

export interface OakClient {
  readonly config: ResolvedOakClientConfig;
  readonly retryOptions: RetryOptions;
  getAccessToken(): Promise<Result<string>>;
  grantToken(): Promise<Result<TokenResponse>>;
}
