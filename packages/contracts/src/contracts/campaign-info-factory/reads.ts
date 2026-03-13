import type { Address, Hex, PublicClient } from "../../lib";
import { CAMPAIGN_INFO_FACTORY_ABI } from "./abi";
import type { CampaignInfoFactoryReads } from "./types";

/**
 * Builds read methods for a CampaignInfoFactory contract instance.
 * @param address - Contract address
 * @param publicClient - Viem PublicClient for reads
 * @returns CampaignInfoFactoryReads
 */
export function createCampaignInfoFactoryReads(
  address: Address,
  publicClient: PublicClient,
): CampaignInfoFactoryReads {
  const contract = { address, abi: CAMPAIGN_INFO_FACTORY_ABI } as const;

  return {
    async identifierToCampaignInfo(identifierHash: Hex): Promise<Address> {
      return publicClient.readContract({ ...contract, functionName: "identifierToCampaignInfo", args: [identifierHash] });
    },
    async isValidCampaignInfo(campaignInfo: Address): Promise<boolean> {
      return publicClient.readContract({ ...contract, functionName: "isValidCampaignInfo", args: [campaignInfo] });
    },
    async owner(): Promise<Address> {
      return publicClient.readContract({ ...contract, functionName: "owner" });
    },
  };
}
