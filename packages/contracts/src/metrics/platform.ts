/**
 * @file metrics/platform.ts
 * TODO: Implement with multicall where supported.
 */

import type { PlatformStats } from "./types";

/**
 * Aggregates protocol-level statistics from GlobalParams and all treasury contracts.
 * @returns PlatformStats — currently a stub returning empty stats
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  // TODO: implement using multicall across GlobalParams and treasury contracts
  return {};
}
