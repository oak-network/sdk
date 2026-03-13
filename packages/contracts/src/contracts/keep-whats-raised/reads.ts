import type { Address, Hex, PublicClient } from "../../lib";
import { KEEP_WHATS_RAISED_ABI } from "./abi";
import type { KeepWhatsRaisedReads } from "./types";
import type { TieredReward } from "../../types/structs";

/**
 * Builds read methods for a KeepWhatsRaised treasury contract instance.
 * @param address - Deployed KeepWhatsRaised contract address
 * @param publicClient - Viem PublicClient used to call readContract
 * @returns Read methods bound to the given contract address
 */
export function createKeepWhatsRaisedReads(
  address: Address,
  publicClient: PublicClient,
): KeepWhatsRaisedReads {
  const contract = { address, abi: KEEP_WHATS_RAISED_ABI } as const;

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
    async getAvailableRaisedAmount() {
      return publicClient.readContract({ ...contract, functionName: "getAvailableRaisedAmount" });
    },
    async getReward(rewardName: Hex): Promise<TieredReward> {
      const result = await publicClient.readContract({
        ...contract,
        functionName: "getReward",
        args: [rewardName],
      });
      return result as unknown as TieredReward;
    },
    async getPlatformHash() {
      return publicClient.readContract({ ...contract, functionName: "getPlatformHash" });
    },
    async getPlatformFeePercent() {
      return publicClient.readContract({ ...contract, functionName: "getPlatformFeePercent" });
    },
    async getWithdrawalApprovalStatus() {
      return publicClient.readContract({ ...contract, functionName: "getWithdrawalApprovalStatus" });
    },
    async getLaunchTime() {
      return publicClient.readContract({ ...contract, functionName: "getLaunchTime" });
    },
    async getDeadline() {
      return publicClient.readContract({ ...contract, functionName: "getDeadline" });
    },
    async getGoalAmount() {
      return publicClient.readContract({ ...contract, functionName: "getGoalAmount" });
    },
    async getPaymentGatewayFee(pledgeId: Hex) {
      return publicClient.readContract({
        ...contract,
        functionName: "getPaymentGatewayFee",
        args: [pledgeId],
      });
    },
    async getFeeValue(feeKey: Hex) {
      return publicClient.readContract({
        ...contract,
        functionName: "getFeeValue",
        args: [feeKey],
      });
    },
    async paused() {
      return publicClient.readContract({ ...contract, functionName: "paused" });
    },
    async cancelled() {
      return publicClient.readContract({ ...contract, functionName: "cancelled" });
    },
    async balanceOf(owner: Address) {
      return publicClient.readContract({
        ...contract,
        functionName: "balanceOf",
        args: [owner],
      });
    },
    async ownerOf(tokenId: bigint) {
      return publicClient.readContract({
        ...contract,
        functionName: "ownerOf",
        args: [tokenId],
      });
    },
    async tokenURI(tokenId: bigint) {
      return publicClient.readContract({
        ...contract,
        functionName: "tokenURI",
        args: [tokenId],
      });
    },
    async name() {
      return publicClient.readContract({ ...contract, functionName: "name" });
    },
    async symbol() {
      return publicClient.readContract({ ...contract, functionName: "symbol" });
    },
    async getApproved(tokenId: bigint) {
      return publicClient.readContract({
        ...contract,
        functionName: "getApproved",
        args: [tokenId],
      });
    },
    async isApprovedForAll(owner: Address, operator: Address) {
      return publicClient.readContract({
        ...contract,
        functionName: "isApprovedForAll",
        args: [owner, operator],
      });
    },
    async supportsInterface(interfaceId: Hex) {
      return publicClient.readContract({
        ...contract,
        functionName: "supportsInterface",
        args: [interfaceId as `0x${string}`],
      });
    },
  };
}
