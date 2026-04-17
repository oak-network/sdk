import type { Address, Hex, PublicClient } from "../../lib";
import { ALL_OR_NOTHING_ABI } from "./abi";
import type { AllOrNothingReads } from "./types";
import type { TieredReward } from "../../types/structs";

/**
 * Builds read methods for an AllOrNothing treasury contract instance.
 * @param address - Deployed AllOrNothing contract address
 * @param publicClient - Viem PublicClient used to call readContract
 * @returns Read methods bound to the given contract address
 */
export function createAllOrNothingReads(
  address: Address,
  publicClient: PublicClient,
): AllOrNothingReads {
  const contract = { address, abi: ALL_OR_NOTHING_ABI } as const;

  return {
    async getRaisedAmount() {
      return publicClient.readContract({ ...contract, functionName: "getRaisedAmount" });
    },
    async getLifetimeRaisedAmount() {
      return publicClient.readContract({ ...contract, functionName: "getLifetimeRaisedAmount" });
    },
    async getRefundedAmount() {
      return publicClient.readContract({ ...contract, functionName: "getRefundedAmount" });
    },
    async getReward(rewardName: Hex): Promise<TieredReward> {
      const result = await publicClient.readContract({ ...contract, functionName: "getReward", args: [rewardName] });
      // viem returns Solidity structs as readonly tuple objects whose type doesn't
      // unify with the SDK's named interface; the double-cast bridges the gap safely
      // because the ABI field names and types are identical to TieredReward.
      return result as unknown as TieredReward;
    },
    async getPlatformHash() {
      return publicClient.readContract({ ...contract, functionName: "getPlatformHash" });
    },
    async getPlatformFeePercent() {
      return publicClient.readContract({ ...contract, functionName: "getPlatformFeePercent" });
    },
    async paused() {
      return publicClient.readContract({ ...contract, functionName: "paused" });
    },
    async cancelled() {
      return publicClient.readContract({ ...contract, functionName: "cancelled" });
    },
  };
}
