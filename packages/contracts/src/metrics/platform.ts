/**
 * @file metrics/platform.ts
 * Protocol-level statistics aggregated from GlobalParams.
 * Reads are dispatched concurrently; viem's `batch.multicall` transport
 * automatically aggregates them into a single Multicall3 RPC round-trip.
 */

import { GLOBAL_PARAMS_ABI } from "../contracts/global-params/abi";
import type { PlatformStats, PlatformStatsOptions } from "./types";

/**
 * Aggregates protocol-level statistics from a deployed GlobalParams contract.
 *
 * @param options - GlobalParams address and PublicClient for on-chain reads
 * @returns PlatformStats with platform count and protocol fee percent
 *
 * @example
 * ```typescript
 * const stats = await getPlatformStats({
 *   globalParamsAddress: "0x...",
 *   publicClient,
 * });
 * console.log(`${stats.platformCount} platforms enlisted`);
 * ```
 */
export async function getPlatformStats(
  options: PlatformStatsOptions,
): Promise<PlatformStats> {
  const { globalParamsAddress, publicClient } = options;
  const contract = { address: globalParamsAddress, abi: GLOBAL_PARAMS_ABI } as const;

  const [platformCount, protocolFeePercent] = await Promise.all([
    publicClient.readContract({ ...contract, functionName: "getNumberOfListedPlatforms" }),
    publicClient.readContract({ ...contract, functionName: "getProtocolFeePercent" }),
  ]);

  return {
    platformCount: platformCount as bigint,
    protocolFeePercent: protocolFeePercent as bigint,
  };
}
