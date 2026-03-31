/**
 * @file metrics/treasury.ts
 * TODO: Implement per-treasury reporting.
 */

import type { TreasuryReport } from "./types";

/**
 * Builds a report for a single treasury contract address.
 * @param _treasuryAddress - Deployed treasury contract address
 * @returns TreasuryReport — currently a stub returning empty report
 */
export async function getTreasuryReport(
  _treasuryAddress: string,
): Promise<TreasuryReport> {
  // TODO: implement by reading raised/refunded amounts and fee config
  return {};
}
