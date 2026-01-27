import { RetryOptions } from "../utils";

export interface SDKConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  retryOptions?: Partial<RetryOptions>; // optional overrides for retry
}
