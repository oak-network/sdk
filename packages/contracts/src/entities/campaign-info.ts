import type { Address, PublicClient } from "viem";
import { CAMPAIGN_INFO_ABI } from "../abis/campaign-info.js";
import type { CampaignData } from "../types/index.js";

/**
 * Returns a typed contract config for CampaignInfo.
 *
 * @example
 * const ci = campaignInfoContract('0x...');
 * const deadline = await publicClient.readContract({ ...ci, functionName: 'getDeadline' });
 */
export function campaignInfoContract(address: Address) {
  return { address, abi: CAMPAIGN_INFO_ABI } as const;
}

export type CampaignInfoContractConfig = ReturnType<typeof campaignInfoContract>;

/**
 * Convenience: fetch the core campaign data in one batched call set.
 * Uses Promise.all over individual reads for simplicity.
 */
export async function getCampaignData(
  publicClient: PublicClient,
  address: Address,
): Promise<CampaignData> {
  const config = campaignInfoContract(address);
  const [launchTime, deadline, goalAmount, currency] = await Promise.all([
    publicClient.readContract({ ...config, functionName: "getLaunchTime" }),
    publicClient.readContract({ ...config, functionName: "getDeadline" }),
    publicClient.readContract({ ...config, functionName: "getGoalAmount" }),
    publicClient.readContract({ ...config, functionName: "getCampaignCurrency" }),
  ]);
  return { launchTime, deadline, goalAmount, currency };
}
