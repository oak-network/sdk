/**
 * @file metrics/treasury.ts
 * Per-treasury reporting for AllOrNothing, KeepWhatsRaised, and PaymentTreasury.
 * Reads are dispatched concurrently; viem's `batch.multicall` transport
 * automatically aggregates them into a single Multicall3 RPC round-trip.
 */

import { ALL_OR_NOTHING_ABI } from "../contracts/all-or-nothing/abi";
import { KEEP_WHATS_RAISED_ABI } from "../contracts/keep-whats-raised/abi";
import { PAYMENT_TREASURY_ABI } from "../contracts/payment-treasury/abi";
import type { TreasuryReport, TreasuryReportOptions, TreasuryType } from "./types";

const ABI_BY_TYPE: Record<TreasuryType, readonly unknown[]> = {
  "all-or-nothing": ALL_OR_NOTHING_ABI,
  "keep-whats-raised": KEEP_WHATS_RAISED_ABI,
  "payment-treasury": PAYMENT_TREASURY_ABI,
};

/**
 * The on-chain function name for `getPlatformFeePercent` differs between
 * treasury contracts. PaymentTreasury uses a lowercase-p ABI name.
 */
const FEE_FN_BY_TYPE: Record<TreasuryType, string> = {
  "all-or-nothing": "getPlatformFeePercent",
  "keep-whats-raised": "getPlatformFeePercent",
  "payment-treasury": "getplatformFeePercent",
};

/**
 * Builds a financial report for a single deployed treasury contract.
 *
 * @param options - Treasury address, type discriminator, and PublicClient
 * @returns TreasuryReport with raised/refunded amounts, fee percent, and cancellation status
 *
 * @example
 * ```typescript
 * const report = await getTreasuryReport({
 *   treasuryAddress: "0x...",
 *   treasuryType: "all-or-nothing",
 *   publicClient,
 * });
 * console.log(`Raised: ${report.raisedAmount}`);
 * ```
 */
export async function getTreasuryReport(
  options: TreasuryReportOptions,
): Promise<TreasuryReport> {
  const { treasuryAddress, treasuryType, publicClient } = options;
  const abi = ABI_BY_TYPE[treasuryType];
  const feeFn = FEE_FN_BY_TYPE[treasuryType];
  const contract = { address: treasuryAddress, abi } as const;

  const [raisedAmount, lifetimeRaisedAmount, refundedAmount, platformFeePercent, cancelled] =
    await Promise.all([
      publicClient.readContract({ ...contract, functionName: "getRaisedAmount" }),
      publicClient.readContract({ ...contract, functionName: "getLifetimeRaisedAmount" }),
      publicClient.readContract({ ...contract, functionName: "getRefundedAmount" }),
      publicClient.readContract({ ...contract, functionName: feeFn }),
      publicClient.readContract({ ...contract, functionName: "cancelled" }),
    ]);

  return {
    address: treasuryAddress,
    treasuryType,
    raisedAmount: raisedAmount as bigint,
    lifetimeRaisedAmount: lifetimeRaisedAmount as bigint,
    refundedAmount: refundedAmount as bigint,
    platformFeePercent: platformFeePercent as bigint,
    cancelled: cancelled as boolean,
  };
}
