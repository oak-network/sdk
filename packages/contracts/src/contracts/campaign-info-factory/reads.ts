import type { Address, Hex, PublicClient } from "../../lib";
import { CAMPAIGN_INFO_FACTORY_ABI } from "./abi";
import type { CampaignInfoFactoryReads } from "./types";

/**
 * Builds read methods for a CampaignInfoFactory contract instance.
 * @param address - Deployed CampaignInfoFactory contract address
 * @param publicClient - Viem PublicClient used to call readContract
 * @returns Read methods bound to the given contract address
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
