import type { Address, Hex, PublicClient, WalletClient, Chain } from "../../lib";
import { CAMPAIGN_INFO_ABI } from "./abi";
import { requireSigner, requireAccount } from "../../utils/account";
import { simulateWithErrorDecode, toSimulationResult } from "../../errors";
import type { CampaignInfoSimulate } from "./types";
import type { CallSignerOptions } from "../../client/types";

/**
 * Builds simulate methods for CampaignInfo write calls.
 * Each method calls simulateContract against the current chain state and throws a typed
 * SDK error on revert, decoded via simulateWithErrorDecode.
 * @param address - Deployed CampaignInfo contract address
 * @param publicClient - Viem PublicClient used to call simulateContract
 * @param walletClient - Viem WalletClient used to resolve the account for simulation
 * @param chain - Chain passed to simulateContract
 * @returns Simulation methods bound to the given contract address
 */
export function createCampaignInfoSimulate(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient | null,
  chain: Chain,
): CampaignInfoSimulate {
  const contract = { address, abi: CAMPAIGN_INFO_ABI } as const;

  return {
    async updateDeadline(deadline: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "updateDeadline",
          args: [deadline],
        }),
      );
      return toSimulationResult(response);
    },
    async updateGoalAmount(goalAmount: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "updateGoalAmount",
          args: [goalAmount],
        }),
      );
      return toSimulationResult(response);
    },
    async updateLaunchTime(launchTime: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "updateLaunchTime",
          args: [launchTime],
        }),
      );
      return toSimulationResult(response);
    },
    async updateSelectedPlatform(platformHash: Hex, selection: boolean, platformDataKey: readonly Hex[], platformDataValue: readonly Hex[], options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "updateSelectedPlatform",
          args: [platformHash, selection, [...platformDataKey], [...platformDataValue]],
        }),
      );
      return toSimulationResult(response);
    },
    async setImageURI(newImageURI: string, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "setImageURI",
          args: [newImageURI],
        }),
      );
      return toSimulationResult(response);
    },
    async updateContractURI(newContractURI: string, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "updateContractURI",
          args: [newContractURI],
        }),
      );
      return toSimulationResult(response);
    },
    async mintNFTForPledge(backer: Address, reward: Hex, tokenAddress: Address, amount: bigint, shippingFee: bigint, tipAmount: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "mintNFTForPledge",
          args: [backer, reward, tokenAddress, amount, shippingFee, tipAmount],
        }),
      );
      return toSimulationResult(response);
    },
    async burn(tokenId: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "burn",
          args: [tokenId],
        }),
      );
      return toSimulationResult(response);
    },
    async pauseCampaign(message: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "_pauseCampaign",
          args: [message],
        }),
      );
      return toSimulationResult(response);
    },
    async unpauseCampaign(message: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "_unpauseCampaign",
          args: [message],
        }),
      );
      return toSimulationResult(response);
    },
    async cancelCampaign(message: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "_cancelCampaign",
          args: [message],
        }),
      );
      return toSimulationResult(response);
    },
    async setPlatformInfo(platformBytes: Hex, platformTreasuryAddress: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "_setPlatformInfo",
          args: [platformBytes, platformTreasuryAddress],
        }),
      );
      return toSimulationResult(response);
    },
    async transferOwnership(newOwner: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "transferOwnership",
          args: [newOwner],
        }),
      );
      return toSimulationResult(response);
    },
    async renounceOwnership(options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "renounceOwnership",
          args: [],
        }),
      );
      return toSimulationResult(response);
    },
    async approve(to: Address, tokenId: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "approve",
          args: [to, tokenId],
        }),
      );
      return toSimulationResult(response);
    },
    async setApprovalForAll(operator: Address, approved: boolean, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "setApprovalForAll",
          args: [operator, approved],
        }),
      );
      return toSimulationResult(response);
    },
  };
}

