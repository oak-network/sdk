export interface RetryOptions {
  maxNumberOfRetries: number;
  delay: number;
  backoffFactor?: number;
  maxDelay?: number;
  retryOnStatus?: number[];
  retryOnError?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
  signal?: AbortSignal;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxNumberOfRetries: 0,
  delay: 500,
  backoffFactor: 2,
  maxDelay: 30000,
  retryOnStatus: [408, 429, 500, 502, 503, 504],
  retryOnError: (err) => Boolean(err?.isNetworkError),
  // No default onRetry — SDK does not log to stdout. Pass onRetry in retryOptions to log retries.
};
