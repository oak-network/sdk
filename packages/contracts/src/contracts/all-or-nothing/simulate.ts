import type { Address, Hex, PublicClient, WalletClient, Chain } from "../../lib";
import { ALL_OR_NOTHING_ABI } from "./abi";
import { requireSigner, requireAccount } from "../../utils/account";
import { simulateWithErrorDecode, toSimulationResult } from "../../errors";
import type { AllOrNothingSimulate } from "./types";
import type { TieredReward } from "../../types/structs";
import type { CallSignerOptions } from "../../client/types";

/**
 * Builds simulate methods for AllOrNothing write calls.
 * Each method calls simulateContract against the current chain state and throws a typed
 * SDK error on revert, decoded via simulateWithErrorDecode.
 * @param address - Deployed AllOrNothing contract address
 * @param publicClient - Viem PublicClient used to call simulateContract
 * @param walletClient - Viem WalletClient used to resolve the account for simulation
 * @param chain - Chain passed to simulateContract
 * @returns Simulation methods bound to the given contract address
 */
export function createAllOrNothingSimulate(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient | null,
  chain: Chain,
): AllOrNothingSimulate {
  const contract = { address, abi: ALL_OR_NOTHING_ABI } as const;

  return {
    async pauseTreasury(message: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "pauseTreasury",
          args: [message],
        }),
      );
      return toSimulationResult(response);
    },
    async unpauseTreasury(message: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "unpauseTreasury",
          args: [message],
        }),
      );
      return toSimulationResult(response);
    },
    async cancelTreasury(message: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "cancelTreasury",
          args: [message],
        }),
      );
      return toSimulationResult(response);
    },
    async addRewards(rewardNames: readonly Hex[], rewards: readonly TieredReward[], options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "addRewards",
          args: [[...rewardNames], [...rewards]],
        }),
      );
      return toSimulationResult(response);
    },
    async removeReward(rewardName: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "removeReward",
          args: [rewardName],
        }),
      );
      return toSimulationResult(response);
    },
    async pledgeForAReward(backer: Address, pledgeToken: Address, shippingFee: bigint, rewardNames: readonly Hex[], options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "pledgeForAReward",
          args: [backer, pledgeToken, shippingFee, [...rewardNames]],
        }),
      );
      return toSimulationResult(response);
    },
    async pledgeWithoutAReward(backer: Address, pledgeToken: Address, pledgeAmount: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "pledgeWithoutAReward",
          args: [backer, pledgeToken, pledgeAmount],
        }),
      );
      return toSimulationResult(response);
    },
    async claimRefund(tokenId: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "claimRefund",
          args: [tokenId],
        }),
      );
      return toSimulationResult(response);
    },
    async disburseFees(options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "disburseFees",
          args: [],
        }),
      );
      return toSimulationResult(response);
    },
    async withdraw(options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "withdraw",
          args: [],
        }),
      );
      return toSimulationResult(response);
    },
  };
}
