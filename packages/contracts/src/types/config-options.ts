/**
 * Client options configuration
 */
export interface OakContractsClientOptions {
  /**
   * Request timeout in milliseconds.
   * Applied to HTTP transport calls (readContract, writeContract) and waitForTransactionReceipt.
   * @default 30000
   */
  timeout?: number;
}

export const DEFAULT_CLIENT_OPTIONS: OakContractsClientOptions = {
  timeout: 30000,
};
