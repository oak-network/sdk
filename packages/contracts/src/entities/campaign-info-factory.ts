import type { Address } from "viem";
import { CAMPAIGN_INFO_FACTORY_ABI } from "../abis/campaign-info-factory.js";

/**
 * Returns a typed contract config for CampaignInfoFactory.
 *
 * @example
 * const factory = campaignInfoFactoryContract('0x...');
 * const isValid = await publicClient.readContract({ ...factory, functionName: 'isValidCampaignInfo', args: [addr] });
 */
export function campaignInfoFactoryContract(address: Address) {
  return { address, abi: CAMPAIGN_INFO_FACTORY_ABI } as const;
}

export type CampaignInfoFactoryContractConfig = ReturnType<typeof campaignInfoFactoryContract>;
