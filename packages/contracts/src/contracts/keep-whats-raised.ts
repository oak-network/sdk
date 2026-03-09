import type { Address, Hex, PublicClient, WalletClient, Chain } from "viem";
import { KEEP_WHATS_RAISED_ABI } from "../abis/keep-whats-raised";
import type { KeepWhatsRaisedTreasuryEntity, TieredReward, CampaignData, KeepWhatsRaisedConfig, KeepWhatsRaisedFeeKeys, KeepWhatsRaisedFeeValues } from "../types";

/**
 * Creates a KeepWhatsRaised treasury entity with full read/write access.
 *
 * @param address - Deployed KeepWhatsRaised treasury contract address
 * @param publicClient - Viem PublicClient for on-chain reads
 * @param walletClient - Viem WalletClient for sending transactions
 * @param chain - Chain object (required for writeContract)
 * @returns KeepWhatsRaisedTreasuryEntity
 *
 * @example
 * ```typescript
 * const kwr = createKeepWhatsRaisedEntity(KWR_ADDRESS, publicClient, walletClient, chain);
 * await kwr.configureTreasury(config, campaignData, feeKeys, feeValues);
 * await kwr.pledgeForAReward(pledgeId, backer, token, tip, rewardNames);
 * ```
 */
export function createKeepWhatsRaisedEntity(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
  chain: Chain,
): KeepWhatsRaisedTreasuryEntity {
  const contract = { address, abi: KEEP_WHATS_RAISED_ABI } as const;

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
    async getAvailableRaisedAmount() {
      return publicClient.readContract({ ...contract, functionName: "getAvailableRaisedAmount" });
    },
    async getReward(rewardName: Hex): Promise<TieredReward> {
      const result = await publicClient.readContract({ ...contract, functionName: "getReward", args: [rewardName] });
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
      return publicClient.readContract({ ...contract, functionName: "getPaymentGatewayFee", args: [pledgeId] });
    },
    async getFeeValue(feeKey: Hex) {
      return publicClient.readContract({ ...contract, functionName: "getFeeValue", args: [feeKey] });
    },
    async paused() {
      return publicClient.readContract({ ...contract, functionName: "paused" });
    },
    async cancelled() {
      return publicClient.readContract({ ...contract, functionName: "cancelled" });
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
    async cancelTreasury(message: Hex) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "cancelTreasury", args: [message] });
    },
    async configureTreasury(config: KeepWhatsRaisedConfig, campaignData: CampaignData, feeKeys: KeepWhatsRaisedFeeKeys, feeValues: KeepWhatsRaisedFeeValues) {
      const account = requireAccount();
      return walletClient.writeContract({
        ...contract, chain, account, functionName: "configureTreasury",
        args: [
          { minimumWithdrawalForFeeExemption: config.minimumWithdrawalForFeeExemption, withdrawalDelay: config.withdrawalDelay, refundDelay: config.refundDelay, configLockPeriod: config.configLockPeriod, isColombianCreator: config.isColombianCreator },
          { launchTime: campaignData.launchTime, deadline: campaignData.deadline, goalAmount: campaignData.goalAmount, currency: campaignData.currency },
          { flatFeeKey: feeKeys.flatFeeKey, cumulativeFlatFeeKey: feeKeys.cumulativeFlatFeeKey, grossPercentageFeeKeys: [...feeKeys.grossPercentageFeeKeys] },
          { flatFeeValue: feeValues.flatFeeValue, cumulativeFlatFeeValue: feeValues.cumulativeFlatFeeValue, grossPercentageFeeValues: [...feeValues.grossPercentageFeeValues] },
        ],
      });
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
    async approveWithdrawal() {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "approveWithdrawal", args: [] });
    },
    async setPaymentGatewayFee(pledgeId: Hex, fee: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "setPaymentGatewayFee", args: [pledgeId, fee] });
    },
    async setFeeAndPledge(pledgeId: Hex, backer: Address, pledgeToken: Address, pledgeAmount: bigint, tip: bigint, fee: bigint, reward: readonly Hex[], isPledgeForAReward: boolean) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "setFeeAndPledge", args: [pledgeId, backer, pledgeToken, pledgeAmount, tip, fee, [...reward], isPledgeForAReward] });
    },
    async pledgeForAReward(pledgeId: Hex, backer: Address, pledgeToken: Address, tip: bigint, rewardNames: readonly Hex[]) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "pledgeForAReward", args: [pledgeId, backer, pledgeToken, tip, [...rewardNames]] });
    },
    async pledgeWithoutAReward(pledgeId: Hex, backer: Address, pledgeToken: Address, pledgeAmount: bigint, tip: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "pledgeWithoutAReward", args: [pledgeId, backer, pledgeToken, pledgeAmount, tip] });
    },
    async claimRefund(tokenId: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "claimRefund", args: [tokenId] });
    },
    async claimTip() {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "claimTip", args: [] });
    },
    async claimFund() {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "claimFund", args: [] });
    },
    async disburseFees() {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "disburseFees", args: [] });
    },
    async withdraw(token: Address, amount: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "withdraw", args: [token, amount] });
    },
    async updateDeadline(deadline: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "updateDeadline", args: [deadline] });
    },
    async updateGoalAmount(goalAmount: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "updateGoalAmount", args: [goalAmount] });
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
