import type { Address, Hex, PublicClient, WalletClient, Chain } from "../../lib";
import { CAMPAIGN_INFO_FACTORY_ABI } from "./abi";
import { requireSigner, requireAccount } from "../../utils/account";
import { parseContractError, getRevertData, simulateWithErrorDecode } from "../../errors";
import type { CampaignInfoFactorySimulate } from "./types";
import type { CreateCampaignParams } from "../../types/params";

/**
 * Builds simulate methods for CampaignInfoFactory write calls.
 * Each method calls simulateContract against the current chain state and throws a typed
 * SDK error on revert, decoded via parseContractError.
 * @param address - Deployed CampaignInfoFactory contract address
 * @param publicClient - Viem PublicClient used to call simulateContract
 * @param walletClient - Viem WalletClient used to resolve the account for simulation
 * @param chain - Chain passed to simulateContract
 * @returns Simulation methods bound to the given contract address
 */
export function createCampaignInfoFactorySimulate(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient | null,
  chain: Chain,
): CampaignInfoFactorySimulate {
  const contract = { address, abi: CAMPAIGN_INFO_FACTORY_ABI } as const;

  return {
    async createCampaign(params: CreateCampaignParams): Promise<void> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
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
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
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

