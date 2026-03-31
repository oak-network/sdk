/**
 * @file metrics/index.ts
 * Public surface for the @oaknetwork/contracts/metrics sub-path export.
 * TODO: Register in package.json exports as `@oaknetwork/contracts/metrics`.
 */

export { getPlatformStats } from "./platform";
export { getCampaignSummary } from "./campaign";
export { getTreasuryReport } from "./treasury";
export type { PlatformStats, CampaignSummary, TreasuryReport } from "./types";
