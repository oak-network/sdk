/**
 * @file metrics/types.ts
 * Types for cross-contract aggregation results returned by the metrics module.
 */

import type { Address, PublicClient } from "../lib";

/** Options for {@link getPlatformStats}. */
export interface PlatformStatsOptions {
  /** Deployed GlobalParams contract address. */
  globalParamsAddress: Address;
  /** Viem PublicClient for on-chain reads. */
  publicClient: PublicClient;
}

/** Aggregated protocol-level statistics from GlobalParams. */
export interface PlatformStats {
  /** Total number of enlisted platforms. */
  platformCount: bigint;
  /** Protocol fee percent in basis points. */
  protocolFeePercent: bigint;
}

/** Options for {@link getCampaignSummary}. */
export interface CampaignSummaryOptions {
  /** Deployed CampaignInfo contract address. */
  campaignInfoAddress: Address;
  /** Viem PublicClient for on-chain reads. */
  publicClient: PublicClient;
}

/** Summary of a single campaign's financial state. */
export interface CampaignSummary {
  /** Total amount raised across all linked treasuries. */
  totalRaised: bigint;
  /** Lifetime raised amount (includes refunded funds). */
  totalLifetimeRaised: bigint;
  /** Total amount refunded to backers. */
  totalRefunded: bigint;
  /** Available raised amount after refunds and fees. */
  totalAvailable: bigint;
  /** Total cancelled payment amount. */
  totalCancelled: bigint;
  /** Total expected payment amount. */
  totalExpected: bigint;
  /** Campaign funding goal. */
  goalAmount: bigint;
  /** Whether the total raised meets or exceeds the goal. */
  goalReached: boolean;
}

/** Treasury type discriminator for {@link TreasuryReport}. */
export type TreasuryType = "all-or-nothing" | "keep-whats-raised" | "payment-treasury";

/** Options for {@link getTreasuryReport}. */
export interface TreasuryReportOptions {
  /** Deployed treasury contract address. */
  treasuryAddress: Address;
  /** Which type of treasury contract is at the address. */
  treasuryType: TreasuryType;
  /** Viem PublicClient for on-chain reads. */
  publicClient: PublicClient;
}

/** Aggregated report for a single treasury contract. */
export interface TreasuryReport {
  /** Address of the treasury contract. */
  address: Address;
  /** Which treasury type this report was built from. */
  treasuryType: TreasuryType;
  /** Current raised amount held in the treasury. */
  raisedAmount: bigint;
  /** Lifetime raised amount including refunded funds. */
  lifetimeRaisedAmount: bigint;
  /** Total amount refunded. */
  refundedAmount: bigint;
  /** Platform fee percent in basis points. */
  platformFeePercent: bigint;
  /** Whether the treasury has been cancelled. */
  cancelled: boolean;
}
