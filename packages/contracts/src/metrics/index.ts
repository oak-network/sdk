/**
 * @file metrics/index.ts
 * Public surface for the `@oaknetwork/contracts/metrics` sub-path export.
 *
 * - platform.ts — protocol-level statistics from GlobalParams.
 * - campaign.ts — campaign-level financial aggregation from CampaignInfo.
 * - treasury.ts — per-treasury reporting for AllOrNothing, KeepWhatsRaised, and PaymentTreasury.
 */

export { getPlatformStats } from "./platform";
export { getCampaignSummary } from "./campaign";
export { getTreasuryReport } from "./treasury";
export type {
  PlatformStats,
  PlatformStatsOptions,
  CampaignSummary,
  CampaignSummaryOptions,
  TreasuryReport,
  TreasuryReportOptions,
  TreasuryType,
} from "./types";
