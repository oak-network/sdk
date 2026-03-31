import type { Address, Hex, PublicClient, WalletClient, Chain } from "../../lib";
import { KEEP_WHATS_RAISED_ABI } from "./abi";
import { requireSigner, requireAccount } from "../../utils/account";
import { simulateWithErrorDecode } from "../../errors";
import type { KeepWhatsRaisedSimulate } from "./types";
import type { CallSignerOptions } from "../../client/types";
import type { TieredReward, CampaignData } from "../../types/structs";
import type {
  KeepWhatsRaisedConfig,
  KeepWhatsRaisedFeeKeys,
  KeepWhatsRaisedFeeValues,
} from "../../types/params";

/**
 * Builds simulate methods for KeepWhatsRaised write calls.
 * Each method calls simulateContract against the current chain state and throws a typed
 * SDK error on revert, decoded via simulateWithErrorDecode.
 * @param address - Deployed KeepWhatsRaised contract address
 * @param publicClient - Viem PublicClient used to call simulateContract
 * @param walletClient - Viem WalletClient used to resolve the account for simulation
 * @param chain - Chain passed to simulateContract
 * @returns Simulation methods bound to the given contract address
 */
export function createKeepWhatsRaisedSimulate(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient | null,
  chain: Chain,
): KeepWhatsRaisedSimulate {
  const contract = { address, abi: KEEP_WHATS_RAISED_ABI } as const;

  return {
    async pauseTreasury(message: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "pauseTreasury",
          args: [message],
        }),
      );
    },
    async unpauseTreasury(message: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "unpauseTreasury",
          args: [message],
        }),
      );
    },
    async cancelTreasury(message: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "cancelTreasury",
          args: [message],
        }),
      );
    },
    async configureTreasury(
      config: KeepWhatsRaisedConfig,
      campaignData: CampaignData,
      feeKeys: KeepWhatsRaisedFeeKeys,
      feeValues: KeepWhatsRaisedFeeValues,
      options?: CallSignerOptions,
    ) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
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
        }),
      );
    },
    async addRewards(rewardNames: readonly Hex[], rewards: readonly TieredReward[], options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
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
        }),
      );
    },
    async removeReward(rewardName: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "removeReward",
          args: [rewardName],
        }),
      );
    },
    async approveWithdrawal(options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "approveWithdrawal",
          args: [],
        }),
      );
    },
    async setPaymentGatewayFee(pledgeId: Hex, fee: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "setPaymentGatewayFee",
          args: [pledgeId, fee],
        }),
      );
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
      options?: CallSignerOptions,
    ) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "setFeeAndPledge",
          args: [pledgeId, backer, pledgeToken, pledgeAmount, tip, fee, [...reward], isPledgeForAReward],
        }),
      );
    },
    async pledgeForAReward(
      pledgeId: Hex,
      backer: Address,
      pledgeToken: Address,
      tip: bigint,
      rewardNames: readonly Hex[],
      options?: CallSignerOptions,
    ) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "pledgeForAReward",
          args: [pledgeId, backer, pledgeToken, tip, [...rewardNames]],
        }),
      );
    },
    async pledgeWithoutAReward(
      pledgeId: Hex,
      backer: Address,
      pledgeToken: Address,
      pledgeAmount: bigint,
      tip: bigint,
      options?: CallSignerOptions,
    ) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "pledgeWithoutAReward",
          args: [pledgeId, backer, pledgeToken, pledgeAmount, tip],
        }),
      );
    },
    async claimRefund(tokenId: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "claimRefund",
          args: [tokenId],
        }),
      );
    },
    async claimTip(options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "claimTip",
          args: [],
        }),
      );
    },
    async claimFund(options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "claimFund",
          args: [],
        }),
      );
    },
    async disburseFees(options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "disburseFees",
          args: [],
        }),
      );
    },
    async withdraw(token: Address, amount: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "withdraw",
          args: [token, amount],
        }),
      );
    },
    async updateDeadline(deadline: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
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
    async updateGoalAmount(goalAmount: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
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
    async approve(to: Address, tokenId: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "approve",
          args: [to, tokenId],
        }),
      );
    },
    async setApprovalForAll(operator: Address, approved: boolean, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "setApprovalForAll",
          args: [operator, approved],
        }),
      );
    },
    async safeTransferFrom(from: Address, to: Address, tokenId: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "safeTransferFrom",
          args: [from, to, tokenId],
        }),
      );
    },
    async transferFrom(from: Address, to: Address, tokenId: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "transferFrom",
          args: [from, to, tokenId],
        }),
      );
    },
  };
}
