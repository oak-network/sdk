/**
 * Client options configuration
 */
export interface OakContractsClientOptions {
  /** Request timeout in milliseconds */
  timeout?: number;
}

export const DEFAULT_CLIENT_OPTIONS: OakContractsClientOptions = {
  timeout: 3000,
};
