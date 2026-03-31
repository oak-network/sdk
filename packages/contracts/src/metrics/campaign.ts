/**
 * @file metrics/campaign.ts
 * TODO: Implement campaign-level aggregation across treasuries.
 */

import type { CampaignSummary } from "./types";

/**
 * Aggregates state from all treasuries linked to a campaign.
 * @param _campaignInfoAddress - Deployed CampaignInfo contract address
 * @returns CampaignSummary — currently a stub returning empty summary
 */
export async function getCampaignSummary(
  _campaignInfoAddress: string,
): Promise<CampaignSummary> {
  // TODO: implement by reading linked treasury contracts via CampaignInfo
  return {};
}
