import type { Address, Hex, WalletClient, Chain } from "../../lib";
import { CAMPAIGN_INFO_FACTORY_ABI } from "./abi";
import { requireSigner, requireAccount } from "../../utils/account";
import type { CampaignInfoFactoryWrites } from "./types";
import type { CreateCampaignParams } from "../../types/params";

/**
 * Builds write methods for a CampaignInfoFactory contract instance.
 * @param address - Deployed CampaignInfoFactory contract address
 * @param walletClient - Viem WalletClient used to call writeContract; must have an account attached
 * @param chain - Chain passed to writeContract for EIP-1559 and replay protection
 * @returns Write methods bound to the given contract address
 */
export function createCampaignInfoFactoryWrites(
  address: Address,
  walletClient: WalletClient | null,
  chain: Chain,
): CampaignInfoFactoryWrites {
  const contract = { address, abi: CAMPAIGN_INFO_FACTORY_ABI } as const;

  return {
    async createCampaign(params: CreateCampaignParams): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
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
      });
    },
    async updateImplementation(newImplementation: Address): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "updateImplementation", args: [newImplementation] });
    },
    async transferOwnership(newOwner: Address): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "transferOwnership", args: [newOwner] });
    },
    async renounceOwnership(): Promise<Hex> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({ ...contract, chain, account, functionName: "renounceOwnership", args: [] });
    },
  };
}
