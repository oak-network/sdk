import type { Address, Hex, WalletClient, Chain } from "../../lib";
import { KEEP_WHATS_RAISED_ABI } from "./abi";
import { requireSigner, requireAccount } from "../../utils/account";
import type { KeepWhatsRaisedWrites } from "./types";
import type { TieredReward } from "../../types/structs";
import type { CampaignData } from "../../types/structs";
import type {
  KeepWhatsRaisedConfig,
  KeepWhatsRaisedFeeKeys,
  KeepWhatsRaisedFeeValues,
} from "../../types/params";

/**
 * Builds write methods for a KeepWhatsRaised treasury contract instance.
 * @param address - Deployed KeepWhatsRaised contract address
 * @param walletClient - Viem WalletClient used to call writeContract; must have an account attached
 * @param chain - Chain passed to writeContract for EIP-1559 and replay protection
 * @returns Write methods bound to the given contract address
 */
export function createKeepWhatsRaisedWrites(
  address: Address,
  walletClient: WalletClient | null,
  chain: Chain,
): KeepWhatsRaisedWrites {
  const contract = { address, abi: KEEP_WHATS_RAISED_ABI } as const;

  return {
    async pauseTreasury(message: Hex) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "pauseTreasury",
        args: [message],
      });
    },
    async unpauseTreasury(message: Hex) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "unpauseTreasury",
        args: [message],
      });
    },
    async cancelTreasury(message: Hex) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "cancelTreasury",
        args: [message],
      });
    },
    async configureTreasury(
      config: KeepWhatsRaisedConfig,
      campaignData: CampaignData,
      feeKeys: KeepWhatsRaisedFeeKeys,
      feeValues: KeepWhatsRaisedFeeValues,
    ) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "configureTreasury",
        args: [
          {
            minimumWithdrawalForFeeExemption: config.minimumWithdrawalForFeeExemption,
            withdrawalDelay: config.withdrawalDelay,
            refundDelay: config.refundDelay,
            configLockPeriod: config.configLockPeriod,
            isColombianCreator: config.isColombianCreator,
          },
          {
            launchTime: campaignData.launchTime,
            deadline: campaignData.deadline,
            goalAmount: campaignData.goalAmount,
            currency: campaignData.currency,
          },
          {
            flatFeeKey: feeKeys.flatFeeKey,
            cumulativeFlatFeeKey: feeKeys.cumulativeFlatFeeKey,
            grossPercentageFeeKeys: [...feeKeys.grossPercentageFeeKeys],
          },
          {
            flatFeeValue: feeValues.flatFeeValue,
            cumulativeFlatFeeValue: feeValues.cumulativeFlatFeeValue,
            grossPercentageFeeValues: [...feeValues.grossPercentageFeeValues],
          },
        ],
      });
    },
    async addRewards(rewardNames: readonly Hex[], rewards: readonly TieredReward[]) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "addRewards",
        args: [
          [...rewardNames],
          rewards.map((r) => ({
            rewardValue: r.rewardValue,
            isRewardTier: r.isRewardTier,
            itemId: [...r.itemId],
            itemValue: [...r.itemValue],
            itemQuantity: [...r.itemQuantity],
          })),
        ],
      });
    },
    async removeReward(rewardName: Hex) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "removeReward",
        args: [rewardName],
      });
    },
    async approveWithdrawal() {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "approveWithdrawal",
        args: [],
      });
    },
    async setPaymentGatewayFee(pledgeId: Hex, fee: bigint) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "setPaymentGatewayFee",
        args: [pledgeId, fee],
      });
    },
    async setFeeAndPledge(
      pledgeId: Hex,
      backer: Address,
      pledgeToken: Address,
      pledgeAmount: bigint,
      tip: bigint,
      fee: bigint,
      reward: readonly Hex[],
      isPledgeForAReward: boolean,
    ) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "setFeeAndPledge",
        args: [pledgeId, backer, pledgeToken, pledgeAmount, tip, fee, [...reward], isPledgeForAReward],
      });
    },
    async pledgeForAReward(
      pledgeId: Hex,
      backer: Address,
      pledgeToken: Address,
      tip: bigint,
      rewardNames: readonly Hex[],
    ) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "pledgeForAReward",
        args: [pledgeId, backer, pledgeToken, tip, [...rewardNames]],
      });
    },
    async pledgeWithoutAReward(
      pledgeId: Hex,
      backer: Address,
      pledgeToken: Address,
      pledgeAmount: bigint,
      tip: bigint,
    ) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "pledgeWithoutAReward",
        args: [pledgeId, backer, pledgeToken, pledgeAmount, tip],
      });
    },
    async claimRefund(tokenId: bigint) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "claimRefund",
        args: [tokenId],
      });
    },
    async claimTip() {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "claimTip",
        args: [],
      });
    },
    async claimFund() {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "claimFund",
        args: [],
      });
    },
    async disburseFees() {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "disburseFees",
        args: [],
      });
    },
    async withdraw(token: Address, amount: bigint) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "withdraw",
        args: [token, amount],
      });
    },
    async updateDeadline(deadline: bigint) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "updateDeadline",
        args: [deadline],
      });
    },
    async updateGoalAmount(goalAmount: bigint) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "updateGoalAmount",
        args: [goalAmount],
      });
    },
    async approve(to: Address, tokenId: bigint) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "approve",
        args: [to, tokenId],
      });
    },
    async setApprovalForAll(operator: Address, approved: boolean) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "setApprovalForAll",
        args: [operator, approved],
      });
    },
    async safeTransferFrom(from: Address, to: Address, tokenId: bigint) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "safeTransferFrom",
        args: [from, to, tokenId],
      });
    },
    async transferFrom(from: Address, to: Address, tokenId: bigint) {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      return signer.writeContract({
        ...contract,
        chain,
        account,
        functionName: "transferFrom",
        args: [from, to, tokenId],
      });
    },
  };
}
