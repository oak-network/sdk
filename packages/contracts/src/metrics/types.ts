/**
 * @file metrics/types.ts
 * Placeholder types for cross-contract aggregation results.
 * TODO: Complete shapes once multicall-based aggregation is implemented.
 */

/** Aggregated protocol-level statistics across all campaigns. */
export interface PlatformStats {
  /** Total number of enlisted platforms. */
  platformCount?: bigint;
  /** Total protocol fees collected across all treasuries. */
  totalProtocolFees?: bigint;
}

/** Summary of a single campaign's treasury state. */
export interface CampaignSummary {
  /** Total amount raised across all treasury types. */
  totalRaised?: bigint;
  /** Total amount refunded. */
  totalRefunded?: bigint;
  /** Whether the campaign goal has been reached. */
  goalReached?: boolean;
}

/** Aggregated report for a single treasury contract. */
export interface TreasuryReport {
  /** Address of the treasury contract. */
  address?: string;
  /** Current raised amount held in the treasury. */
  raisedAmount?: bigint;
  /** Platform fee percent in basis points. */
  platformFeePercent?: bigint;
}
