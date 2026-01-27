import { RetryOptions } from "./defaultRetryConfig";

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    maxNumberOfRetries,
    delay,
    backoffFactor = 2,
    maxDelay = 30000,
    retryOnStatus = [408, 429, 500, 502, 503, 504],
    retryOnError = (err) => Boolean(err?.isNetworkError),
    onRetry,
    signal,
  } = options;

  let attempt = 0;
  let waitTime = delay;

  while (attempt <= maxNumberOfRetries) {
    try {
      if (signal?.aborted) throw new Error("Retry aborted");
      return await fn();
    } catch (error: any) {
      const status = error?.status;
      const shouldRetry = retryOnStatus.includes(status) || retryOnError(error);

      if (attempt === maxNumberOfRetries || !shouldRetry) throw error;

      onRetry?.(attempt + 1, error);

      // Honor Retry-After header if present
      let retryAfter = error?.headers?.["retry-after"];
      if (retryAfter) {
        waitTime = Number(retryAfter) * 1000;
      } else {
        waitTime = Math.min(waitTime * backoffFactor, maxDelay);
        // Jitter to avoid traffic spikes
        waitTime = waitTime * (0.8 + Math.random() * 0.4);
      }

      await new Promise((resolve) => setTimeout(resolve, waitTime));
      attempt++;
    }
  }

  throw new Error("Retry failed after maximum attempts");
}
