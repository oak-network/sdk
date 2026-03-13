import type { Address, Hex, PublicClient, WalletClient, Chain } from "../../lib";
import { CAMPAIGN_INFO_ABI } from "./abi";
import { requireAccount } from "../../utils/account";
import { parseContractError, getRevertData, simulateWithErrorDecode } from "../../errors";
import type { CampaignInfoSimulate } from "./types";

/**
 * Builds simulate methods for CampaignInfo write calls.
 * Each method calls simulateContract against the current chain state and throws a typed
 * SDK error on revert, decoded via parseContractError.
 * @param address - Deployed CampaignInfo contract address
 * @param publicClient - Viem PublicClient used to call simulateContract
 * @param walletClient - Viem WalletClient used to resolve the account for simulation
 * @param chain - Chain passed to simulateContract
 * @returns Simulation methods bound to the given contract address
 */
export function createCampaignInfoSimulate(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
  chain: Chain,
): CampaignInfoSimulate {
  const contract = { address, abi: CAMPAIGN_INFO_ABI } as const;

  return {
    async updateDeadline(deadline: bigint): Promise<void> {
      const account = requireAccount(walletClient);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "updateDeadline",
          args: [deadline],
        }),
      );
    },
    async updateGoalAmount(goalAmount: bigint): Promise<void> {
      const account = requireAccount(walletClient);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "updateGoalAmount",
          args: [goalAmount],
        }),
      );
    },
    async updateLaunchTime(launchTime: bigint): Promise<void> {
      const account = requireAccount(walletClient);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "updateLaunchTime",
          args: [launchTime],
        }),
      );
    },
    async updateSelectedPlatform(platformHash: Hex, selection: boolean, platformDataKey: readonly Hex[], platformDataValue: readonly Hex[]): Promise<void> {
      const account = requireAccount(walletClient);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "updateSelectedPlatform",
          args: [platformHash, selection, [...platformDataKey], [...platformDataValue]],
        }),
      );
    },
    async mintNFTForPledge(backer: Address, reward: Hex, tokenAddress: Address, amount: bigint, shippingFee: bigint, tipAmount: bigint): Promise<void> {
      const account = requireAccount(walletClient);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "mintNFTForPledge",
          args: [backer, reward, tokenAddress, amount, shippingFee, tipAmount],
        }),
      );
    },
    async pauseCampaign(message: Hex): Promise<void> {
      const account = requireAccount(walletClient);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "_pauseCampaign",
          args: [message],
        }),
      );
    },
    async cancelCampaign(message: Hex): Promise<void> {
      const account = requireAccount(walletClient);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "_cancelCampaign",
          args: [message],
        }),
      );
    },
  };
}

