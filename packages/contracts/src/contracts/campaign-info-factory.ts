import type { Address, Hex, PublicClient, WalletClient, Chain } from "viem";
import { CAMPAIGN_INFO_FACTORY_ABI } from "../abis/campaign-info-factory";
import type { CampaignInfoFactoryEntity, CreateCampaignParams } from "../types";

/**
 * Creates a CampaignInfoFactory entity with full read/write access.
 *
 * @param address - Deployed CampaignInfoFactory contract address
 * @param publicClient - Viem PublicClient for on-chain reads
 * @param walletClient - Viem WalletClient for sending transactions
 * @param chain - Chain object (required for writeContract)
 * @returns CampaignInfoFactoryEntity
 *
 * @example
 * ```typescript
 * const factory = createCampaignInfoFactoryEntity(FACTORY_ADDRESS, publicClient, walletClient, chain);
 * const txHash = await factory.createCampaign({ creator, identifierHash, campaignData, ... });
 * const address = await factory.identifierToCampaignInfo(identifierHash);
 * ```
 */
export function createCampaignInfoFactoryEntity(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
  chain: Chain,
): CampaignInfoFactoryEntity {
  const contract = { address, abi: CAMPAIGN_INFO_FACTORY_ABI } as const;

  function requireAccount() {
    if (!walletClient.account) {
      throw new Error("Wallet client has no account; cannot send transaction.");
    }
    return walletClient.account;
  }

  return {
    // ── Writes ──────────────────────────────────────────────────────────────

    async createCampaign(params: CreateCampaignParams): Promise<Hex> {
      const account = requireAccount();
      return walletClient.writeContract({
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
      const account = requireAccount();
      return walletClient.writeContract({
        ...contract,
        chain,
        account,
        functionName: "updateImplementation",
        args: [newImplementation],
      });
    },

    async transferOwnership(newOwner: Address): Promise<Hex> {
      const account = requireAccount();
      return walletClient.writeContract({
        ...contract,
        chain,
        account,
        functionName: "transferOwnership",
        args: [newOwner],
      });
    },

    async renounceOwnership(): Promise<Hex> {
      const account = requireAccount();
      return walletClient.writeContract({
        ...contract,
        chain,
        account,
        functionName: "renounceOwnership",
        args: [],
      });
    },

    // ── Reads ────────────────────────────────────────────────────────────────

    async identifierToCampaignInfo(identifierHash: Hex): Promise<Address> {
      return publicClient.readContract({
        ...contract,
        functionName: "identifierToCampaignInfo",
        args: [identifierHash],
      });
    },

    async isValidCampaignInfo(campaignInfo: Address): Promise<boolean> {
      return publicClient.readContract({
        ...contract,
        functionName: "isValidCampaignInfo",
        args: [campaignInfo],
      });
    },

    async owner(): Promise<Address> {
      return publicClient.readContract({ ...contract, functionName: "owner" });
    },
  };
}
