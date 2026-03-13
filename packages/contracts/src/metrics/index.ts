/**
 * @file metrics/index.ts
 * Public surface for the @oak-network/contracts/metrics sub-path export.
 * TODO: Register in package.json exports as `@oak-network/contracts/metrics`.
 */

export { getPlatformStats } from "./platform";
export { getCampaignSummary } from "./campaign";
export { getTreasuryReport } from "./treasury";
export type { PlatformStats, CampaignSummary, TreasuryReport } from "./types";
