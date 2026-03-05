import type { Address, Hex, PublicClient, WalletClient, Chain } from "viem";
import { ALL_OR_NOTHING_ABI } from "../abis/all-or-nothing";
import type { AllOrNothingTreasuryEntity, TieredReward } from "../types";

/**
 * Creates an AllOrNothing treasury entity with full read/write access.
 *
 * @param address - Deployed AllOrNothing treasury contract address
 * @param publicClient - Viem PublicClient for on-chain reads
 * @param walletClient - Viem WalletClient for sending transactions
 * @param chain - Chain object (required for writeContract)
 * @returns AllOrNothingTreasuryEntity
 *
 * @example
 * ```typescript
 * const aon = createAllOrNothingEntity(AON_ADDRESS, publicClient, walletClient, chain);
 * const raised = await aon.getRaisedAmount();
 * await aon.pledgeForAReward(backer, token, shippingFee, rewardNames);
 * ```
 */
export function createAllOrNothingEntity(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
  chain: Chain,
): AllOrNothingTreasuryEntity {
  const contract = { address, abi: ALL_OR_NOTHING_ABI } as const;

  function requireAccount() {
    if (!walletClient.account) {
      throw new Error("Wallet client has no account; cannot send transaction.");
    }
    return walletClient.account;
  }

  return {
    // ── Reads ────────────────────────────────────────────────────────────────

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
      return result as unknown as TieredReward;
    },
    async getPlatformHash() {
      return publicClient.readContract({ ...contract, functionName: "getPlatformHash" });
    },
    async getplatformFeePercent() {
      return publicClient.readContract({ ...contract, functionName: "getplatformFeePercent" });
    },
    async paused() {
      return publicClient.readContract({ ...contract, functionName: "paused" });
    },
    async balanceOf(owner: Address) {
      return publicClient.readContract({ ...contract, functionName: "balanceOf", args: [owner] });
    },
    async ownerOf(tokenId: bigint) {
      return publicClient.readContract({ ...contract, functionName: "ownerOf", args: [tokenId] });
    },
    async tokenURI(tokenId: bigint) {
      return publicClient.readContract({ ...contract, functionName: "tokenURI", args: [tokenId] });
    },
    async name() {
      return publicClient.readContract({ ...contract, functionName: "name" });
    },
    async symbol() {
      return publicClient.readContract({ ...contract, functionName: "symbol" });
    },
    async getApproved(tokenId: bigint) {
      return publicClient.readContract({ ...contract, functionName: "getApproved", args: [tokenId] });
    },
    async isApprovedForAll(owner: Address, operator: Address) {
      return publicClient.readContract({ ...contract, functionName: "isApprovedForAll", args: [owner, operator] });
    },
    async supportsInterface(interfaceId: Hex) {
      return publicClient.readContract({ ...contract, functionName: "supportsInterface", args: [interfaceId as `0x${string}`] });
    },

    // ── Writes ───────────────────────────────────────────────────────────────

    async pauseTreasury(message: Hex) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "pauseTreasury", args: [message] });
    },
    async unpauseTreasury(message: Hex) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "unpauseTreasury", args: [message] });
    },
    async addRewards(rewardNames: readonly Hex[], rewards: readonly TieredReward[]) {
      const account = requireAccount();
      return walletClient.writeContract({
        ...contract, chain, account, functionName: "addRewards",
        args: [[...rewardNames], rewards.map((r) => ({ rewardValue: r.rewardValue, isRewardTier: r.isRewardTier, itemId: [...r.itemId], itemValue: [...r.itemValue], itemQuantity: [...r.itemQuantity] }))],
      });
    },
    async removeReward(rewardName: Hex) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "removeReward", args: [rewardName] });
    },
    async pledgeForAReward(backer: Address, pledgeToken: Address, shippingFee: bigint, rewardNames: readonly Hex[]) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "pledgeForAReward", args: [backer, pledgeToken, shippingFee, [...rewardNames]] });
    },
    async pledgeWithoutAReward(backer: Address, pledgeToken: Address, pledgeAmount: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "pledgeWithoutAReward", args: [backer, pledgeToken, pledgeAmount] });
    },
    async claimRefund(tokenId: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "claimRefund", args: [tokenId] });
    },
    async disburseFees() {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "disburseFees", args: [] });
    },
    async withdraw() {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "withdraw", args: [] });
    },
    async burn(tokenId: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "burn", args: [tokenId] });
    },
    async approve(to: Address, tokenId: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "approve", args: [to, tokenId] });
    },
    async setApprovalForAll(operator: Address, approved: boolean) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "setApprovalForAll", args: [operator, approved] });
    },
    async safeTransferFrom(from: Address, to: Address, tokenId: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "safeTransferFrom", args: [from, to, tokenId] });
    },
    async transferFrom(from: Address, to: Address, tokenId: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "transferFrom", args: [from, to, tokenId] });
    },
  };
}
