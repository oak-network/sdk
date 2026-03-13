import type { Address, Hex, PublicClient, WalletClient, Chain } from "../../lib";
import { CAMPAIGN_INFO_FACTORY_ABI } from "./abi";
import { requireAccount } from "../../utils/account";
import { parseContractError, getRevertData, simulateWithErrorDecode } from "../../errors";
import type { CampaignInfoFactorySimulate } from "./types";
import type { CreateCampaignParams } from "../../types/params";

/**
 * Builds simulate methods for CampaignInfoFactory write calls.
 * @param address - Contract address
 * @param publicClient - Viem PublicClient for simulateContract
 * @param walletClient - WalletClient (for account)
 * @param chain - Chain for simulateContract
 * @returns CampaignInfoFactorySimulate
 */
export function createCampaignInfoFactorySimulate(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
  chain: Chain,
): CampaignInfoFactorySimulate {
  const contract = { address, abi: CAMPAIGN_INFO_FACTORY_ABI } as const;

  return {
    async createCampaign(params: CreateCampaignParams): Promise<void> {
      const account = requireAccount(walletClient);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "createCampaign",
          args: [
            params.creator,
            params.identifierHash,
            [...params.selectedPlatformHash],
            [...(params.platformDataKey ?? [])],
            [...(params.platformDataValue ?? [])],
            {
              launchTime: params.campaignData.launchTime,
              deadline: params.campaignData.deadline,
              goalAmount: params.campaignData.goalAmount,
              currency: params.campaignData.currency,
            },
            params.nftName,
            params.nftSymbol,
            params.nftImageURI,
            params.contractURI,
          ],
        }),
      );
    },
    async updateImplementation(newImplementation: Address): Promise<void> {
      const account = requireAccount(walletClient);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "updateImplementation",
          args: [newImplementation],
        }),
      );
    },
  };
}

