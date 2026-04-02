/**
 * @file metrics/campaign.ts
 * Campaign-level financial aggregation from CampaignInfo.
 * Reads are dispatched concurrently; viem's `batch.multicall` transport
 * automatically aggregates them into a single Multicall3 RPC round-trip.
 */

import { CAMPAIGN_INFO_ABI } from "../contracts/campaign-info/abi";
import type { CampaignSummary, CampaignSummaryOptions } from "./types";

/**
 * Aggregates financial state from a deployed CampaignInfo contract.
 *
 * CampaignInfo already maintains running totals across all linked treasuries,
 * so this function reads those aggregated values directly rather than iterating
 * individual treasury contracts.
 *
 * @param options - CampaignInfo address and PublicClient for on-chain reads
 * @returns CampaignSummary with raised, refunded, cancelled, expected amounts and goal status
 *
 * @example
 * ```typescript
 * const summary = await getCampaignSummary({
 *   campaignInfoAddress: "0x...",
 *   publicClient,
 * });
 * if (summary.goalReached) {
 *   console.log("Campaign goal met!");
 * }
 * ```
 */
export async function getCampaignSummary(
  options: CampaignSummaryOptions,
): Promise<CampaignSummary> {
  const { campaignInfoAddress, publicClient } = options;
  const contract = { address: campaignInfoAddress, abi: CAMPAIGN_INFO_ABI } as const;

  const [
    totalRaised,
    totalLifetimeRaised,
    totalRefunded,
    totalAvailable,
    totalCancelled,
    totalExpected,
    goalAmount,
  ] = await Promise.all([
    publicClient.readContract({ ...contract, functionName: "getTotalRaisedAmount" }),
    publicClient.readContract({ ...contract, functionName: "getTotalLifetimeRaisedAmount" }),
    publicClient.readContract({ ...contract, functionName: "getTotalRefundedAmount" }),
    publicClient.readContract({ ...contract, functionName: "getTotalAvailableRaisedAmount" }),
    publicClient.readContract({ ...contract, functionName: "getTotalCancelledAmount" }),
    publicClient.readContract({ ...contract, functionName: "getTotalExpectedAmount" }),
    publicClient.readContract({ ...contract, functionName: "getGoalAmount" }),
  ]);

  const raised = totalRaised as bigint;
  const goal = goalAmount as bigint;

  return {
    totalRaised: raised,
    totalLifetimeRaised: totalLifetimeRaised as bigint,
    totalRefunded: totalRefunded as bigint,
    totalAvailable: totalAvailable as bigint,
    totalCancelled: totalCancelled as bigint,
    totalExpected: totalExpected as bigint,
    goalAmount: goal,
    goalReached: raised >= goal,
  };
}
