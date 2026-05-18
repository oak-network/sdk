import type { RetryOptions } from "../utils";
import type { Result } from "./result";
import type { TokenResponse } from "./token";
import type { OakEnvironment } from "./environment";

export interface OakClientConfig {
  environment: OakEnvironment;
  clientId: string;
  /** Required for authenticated endpoints. May be omitted when using only public services (e.g. countries). */
  clientSecret?: string;
  customUrl?: string;
  retryOptions?: Partial<RetryOptions>;
}

export interface ResolvedOakClientConfig extends OakClientConfig {
  baseUrl: string;
}

/**
 * Public configuration exposed by the OakClient.
 * Excludes clientSecret for security reasons.
 */
export interface PublicOakClientConfig {
  environment: OakEnvironment;
  clientId: string;
  baseUrl: string;
  customUrl?: string;
  retryOptions?: Partial<RetryOptions>;
}

export interface OakClient {
  readonly config: PublicOakClientConfig;
  readonly retryOptions: RetryOptions;
  getAccessToken(): Promise<Result<string>>;
  grantToken(): Promise<Result<TokenResponse>>;
}
