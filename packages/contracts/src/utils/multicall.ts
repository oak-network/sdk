/**
 * @file utils/multicall.ts
 * Ergonomic multicall helper that batches multiple entity read calls into a
 * single RPC round-trip. Works by running closures concurrently via
 * {@link Promise.all}; viem's `batch.multicall` transport option (enabled by
 * default in the SDK) automatically aggregates all `readContract` calls
 * dispatched within the same tick into one Multicall3 on-chain call.
 *
 * @example
 * ```typescript
 * const gp = oak.globalParams(address);
 * const [count, fee] = await multicall([
 *   () => gp.getNumberOfListedPlatforms(),
 *   () => gp.getProtocolFeePercent(),
 * ]);
 * ```
 */

/**
 * Executes an array of lazy read calls concurrently. When the underlying
 * `PublicClient` has `batch.multicall` enabled (SDK default), all
 * `readContract` invocations within the same tick are automatically
 * aggregated into a single Multicall3 RPC request.
 *
 * @param calls - Array of zero-argument functions that each return a Promise
 * @returns Array of resolved values in the same order as the input calls
 */
export async function multicall<T extends readonly (() => Promise<unknown>)[]>(
  calls: [...T],
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const results = await Promise.all(calls.map((fn) => fn()));
  return results as { [K in keyof T]: Awaited<ReturnType<T[K]>> };
}
