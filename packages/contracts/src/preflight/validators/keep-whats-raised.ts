import type { Address, Hex } from "viem";
import { KEEP_WHATS_RAISED_ABI } from "../../abis/keep-whats-raised.js";
import type { CampaignData, KeepWhatsRaisedConfig, KeepWhatsRaisedFeeKeys, KeepWhatsRaisedFeeValues } from "../../types/index.js";
import { createIssue } from "../issue.js";
import * as codes from "../issue-codes.js";
import {
  checkZeroAddress,
  checkZeroBytes32,
  checkAddressChecksum,
  checkDuplicates,
  checkTokenAccepted,
  checkCampaignWindowStateful,
  checkCampaignEnded,
  checkErc20BalanceAndAllowance,
  checkRewardValidity,
  checkTreasuryPaused,
} from "../common/checks.js";
import { normalizeAddresses } from "../normalizers.js";
import type { MethodValidator, SafeMethodDescriptor } from "../types.js";
import { addRewardsValidator, removeRewardValidator } from "./all-or-nothing.js";
import type { AddRewardsInput, RemoveRewardInput } from "./all-or-nothing.js";

// ─── Input shapes ──────────────────────────────────────────────────────────────

/** Input shape for KeepWhatsRaised.configureTreasury preflight. */
export interface ConfigureTreasuryInput {
  config: KeepWhatsRaisedConfig;
  campaignData: CampaignData;
  feeKeys: KeepWhatsRaisedFeeKeys;
  feeValues: KeepWhatsRaisedFeeValues;
}

/** Input shape for KeepWhatsRaised.pledgeForAReward preflight. */
export interface KwrPledgeForARewardInput {
  pledgeId: Hex;
  backer: Address;
  pledgeToken: Address;
  tip: bigint;
  rewardNames: readonly Hex[];
}

/** Input shape for KeepWhatsRaised.pledgeWithoutAReward preflight. */
export interface KwrPledgeWithoutARewardInput {
  pledgeId: Hex;
  backer: Address;
  pledgeToken: Address;
  pledgeAmount: bigint;
  tip: bigint;
}

// ─── Validators ────────────────────────────────────────────────────────────────

/**
 * Preflight validator for KeepWhatsRaised.configureTreasury.
 */
export const configureTreasuryValidator: MethodValidator<ConfigureTreasuryInput> = {
  structural: [
    // launchTime must be before deadline
    (input) => {
      if (input.campaignData.launchTime >= input.campaignData.deadline) {
        return [
          createIssue(
            codes.KWR_INVALID_LAUNCH_DEADLINE_ORDER,
            "error",
            `launchTime (${input.campaignData.launchTime}) must be before deadline (${input.campaignData.deadline}).`,
            {
              fieldPath: "campaignData.launchTime",
              suggestion: "Set launchTime to a value less than deadline.",
            },
          ),
        ];
      }
      return [];
    },

    // grossPercentageFeeKeys and grossPercentageFeeValues must match length
    (input) => {
      if (input.feeKeys.grossPercentageFeeKeys.length !== input.feeValues.grossPercentageFeeValues.length) {
        return [
          createIssue(
            codes.KWR_FEE_ARRAY_MISMATCH,
            "error",
            `grossPercentageFeeKeys (length ${input.feeKeys.grossPercentageFeeKeys.length}) and grossPercentageFeeValues (length ${input.feeValues.grossPercentageFeeValues.length}) must have the same length.`,
            {
              fieldPath: "feeKeys.grossPercentageFeeKeys",
              suggestion: "Ensure fee keys and values arrays match in length.",
            },
          ),
        ];
      }
      return [];
    },
  ],

  semantic: [
    // warn on duplicate fee keys
    (input) => {
      const allKeys: Hex[] = [input.feeKeys.flatFeeKey, input.feeKeys.cumulativeFlatFeeKey, ...input.feeKeys.grossPercentageFeeKeys];
      return checkDuplicates(allKeys, "feeKeys", codes.KWR_DUPLICATE_FEE_KEY, "warn");
    },

    // warn on potentially unsafe fee setup
    (input) => {
      const allValuesZero =
        input.feeValues.flatFeeValue === 0n &&
        input.feeValues.cumulativeFlatFeeValue === 0n &&
        input.feeValues.grossPercentageFeeValues.every((v) => v === 0n);

      if (allValuesZero && !input.config.isColombianCreator) {
        return [
          createIssue(
            codes.KWR_UNSAFE_FEE_SETUP,
            "warn",
            "All fee values are zero for a non-Colombian creator. This may be unintended.",
            { suggestion: "Verify fee configuration is intentional." },
          ),
        ];
      }
      return [];
    },
  ],

  stateful: [],
};

/**
 * Preflight validator for KeepWhatsRaised.pledgeForAReward.
 */
export const kwrPledgeForARewardValidator: MethodValidator<KwrPledgeForARewardInput> = {
  structural: [
    (input) => checkZeroBytes32(input.pledgeId, "pledgeId", codes.KWR_ZERO_PLEDGE_ID),
    (input, ctx) => [
      ...checkZeroAddress(input.backer, "backer", codes.KWR_ZERO_BACKER),
      ...checkZeroAddress(input.pledgeToken, "pledgeToken", codes.COMMON_ZERO_ADDRESS),
      ...checkAddressChecksum(input, ["backer", "pledgeToken"], ctx.options.mode === "normalize"),
    ],
    (input) => {
      if (input.rewardNames.length === 0) {
        return [
          createIssue(codes.KWR_EMPTY_REWARD_NAMES, "error", "rewardNames must not be empty.", {
            fieldPath: "rewardNames",
            suggestion: "Provide at least one reward name. Use pledgeWithoutAReward for no-reward pledges.",
          }),
        ];
      }
      return [];
    },
  ],

  semantic: [],

  stateful: [
    // Token acceptance
    async (input, ctx) => {
      const infoAddress = ctx.addresses.infoAddress;
      if (!infoAddress) return [];
      return checkTokenAccepted(ctx.stateReader, infoAddress, input.pledgeToken, "pledgeToken", codes.KWR_UNACCEPTED_TOKEN);
    },

    // Campaign window
    async (_input, ctx) => {
      const infoAddress = ctx.addresses.infoAddress;
      if (!infoAddress) return [];
      return checkCampaignWindowStateful(
        ctx.stateReader,
        infoAddress,
        codes.KWR_CAMPAIGN_NOT_STARTED,
        codes.KWR_CAMPAIGN_ENDED,
      );
    },

    // Reward existence and first-tier validity
    async (input, ctx) => {
      return checkRewardValidity(
        ctx.stateReader,
        ctx.contractAddress,
        input.rewardNames,
        codes.KWR_UNKNOWN_REWARD,
        codes.KWR_INVALID_FIRST_REWARD_TIER,
        "rewardNames",
      );
    },

    // ERC20 balance/allowance for backer
    // Note: For pledgeForAReward, required amount depends on reward values + tip.
    // Reward value resolution requires summing per-reward reads. Defer to simulation.
  ],

  normalize: (input) => normalizeAddresses({ ...input }, ["backer", "pledgeToken"]),
};

/**
 * Preflight validator for KeepWhatsRaised.pledgeWithoutAReward.
 */
export const kwrPledgeWithoutARewardValidator: MethodValidator<KwrPledgeWithoutARewardInput> = {
  structural: [
    (input) => checkZeroBytes32(input.pledgeId, "pledgeId", codes.KWR_ZERO_PLEDGE_ID),
    (input, ctx) => [
      ...checkZeroAddress(input.backer, "backer", codes.KWR_ZERO_BACKER),
      ...checkZeroAddress(input.pledgeToken, "pledgeToken", codes.COMMON_ZERO_ADDRESS),
      ...checkAddressChecksum(input, ["backer", "pledgeToken"], ctx.options.mode === "normalize"),
    ],
    (input) => {
      if (input.pledgeAmount === 0n) {
        return [
          createIssue(codes.KWR_ZERO_PLEDGE_AMOUNT, "error", "pledgeAmount must not be zero.", {
            fieldPath: "pledgeAmount",
            suggestion: "Provide a non-zero pledge amount.",
          }),
        ];
      }
      return [];
    },
  ],

  semantic: [],

  stateful: [
    // Token acceptance
    async (input, ctx) => {
      const infoAddress = ctx.addresses.infoAddress;
      if (!infoAddress) return [];
      return checkTokenAccepted(ctx.stateReader, infoAddress, input.pledgeToken, "pledgeToken", codes.KWR_UNACCEPTED_TOKEN);
    },

    // Campaign window
    async (_input, ctx) => {
      const infoAddress = ctx.addresses.infoAddress;
      if (!infoAddress) return [];
      return checkCampaignWindowStateful(
        ctx.stateReader,
        infoAddress,
        codes.KWR_CAMPAIGN_NOT_STARTED,
        codes.KWR_CAMPAIGN_ENDED,
      );
    },

    // ERC20 balance/allowance for backer
    async (input, ctx) => {
      const totalRequired = input.pledgeAmount + input.tip;
      return checkErc20BalanceAndAllowance(
        ctx.stateReader,
        input.pledgeToken,
        input.backer,
        ctx.contractAddress,
        totalRequired,
        "backer",
      );
    },
  ],

  normalize: (input) => normalizeAddresses({ ...input }, ["backer", "pledgeToken"]),
};

// ─── addRewards (re-export shared validator from AON) ─────────────────────────

export { addRewardsValidator } from "./all-or-nothing.js";
export type { AddRewardsInput } from "./all-or-nothing.js";

// ─── setFeeAndPledge ──────────────────────────────────────────────────────────

/** Input shape for KeepWhatsRaised.setFeeAndPledge preflight. */
export interface SetFeeAndPledgeInput {
  pledgeId: Hex;
  backer: Address;
  pledgeToken: Address;
  pledgeAmount: bigint;
  tip: bigint;
  fee: bigint;
  reward: readonly Hex[];
  isPledgeForAReward: boolean;
}

/**
 * Preflight validator for KeepWhatsRaised.setFeeAndPledge.
 */
export const setFeeAndPledgeValidator: MethodValidator<SetFeeAndPledgeInput> = {
  structural: [
    (input) => checkZeroBytes32(input.pledgeId, "pledgeId", codes.KWR_ZERO_PLEDGE_ID),
    (input, ctx) => [
      ...checkZeroAddress(input.backer, "backer", codes.KWR_ZERO_BACKER),
      ...checkZeroAddress(input.pledgeToken, "pledgeToken", codes.COMMON_ZERO_ADDRESS),
      ...checkAddressChecksum(input, ["backer", "pledgeToken"], ctx.options.mode === "normalize"),
    ],
    (input) => {
      if (input.isPledgeForAReward && input.reward.length === 0) {
        return [
          createIssue(codes.KWR_EMPTY_REWARD_NAMES, "error", "reward must not be empty when isPledgeForAReward is true.", {
            fieldPath: "reward",
            suggestion: "Provide at least one reward name, or set isPledgeForAReward to false.",
          }),
        ];
      }
      return [];
    },
  ],

  semantic: [
    (input) => {
      if (input.pledgeAmount === 0n && input.tip === 0n && input.fee === 0n) {
        return [
          createIssue(codes.KWR_ZERO_PLEDGE_AMOUNT_AND_FEE, "warn", "pledgeAmount, tip, and fee are all zero.", {
            suggestion: "Verify that a zero-value pledge is intentional.",
          }),
        ];
      }
      return [];
    },
  ],

  stateful: [
    // Token acceptance
    async (input, ctx) => {
      const infoAddress = ctx.addresses.infoAddress;
      if (!infoAddress) return [];
      return checkTokenAccepted(ctx.stateReader, infoAddress, input.pledgeToken, "pledgeToken", codes.KWR_UNACCEPTED_TOKEN);
    },

    // Campaign window
    async (_input, ctx) => {
      const infoAddress = ctx.addresses.infoAddress;
      if (!infoAddress) return [];
      return checkCampaignWindowStateful(
        ctx.stateReader,
        infoAddress,
        codes.KWR_CAMPAIGN_NOT_STARTED,
        codes.KWR_CAMPAIGN_ENDED,
      );
    },

    // Reward validity (only when isPledgeForAReward)
    async (input, ctx) => {
      if (!input.isPledgeForAReward) return [];
      return checkRewardValidity(
        ctx.stateReader,
        ctx.contractAddress,
        input.reward,
        codes.KWR_UNKNOWN_REWARD,
        codes.KWR_INVALID_FIRST_REWARD_TIER,
        "reward",
      );
    },

    // ERC20 balance/allowance for backer
    async (input, ctx) => {
      const totalRequired = input.pledgeAmount + input.tip + input.fee;
      return checkErc20BalanceAndAllowance(
        ctx.stateReader,
        input.pledgeToken,
        input.backer,
        ctx.contractAddress,
        totalRequired,
        "backer",
      );
    },
  ],

  normalize: (input) => normalizeAddresses({ ...input }, ["backer", "pledgeToken"]),
};

// ─── KWR Settlement validators ────────────────────────────────────────────────

/** Input shape for KeepWhatsRaised.claimRefund preflight. */
export interface KwrClaimRefundInput {
  tokenId: bigint;
}

/** Input shape for KeepWhatsRaised.claimTip preflight. */
export type KwrClaimTipInput = Record<string, never>;

/** Input shape for KeepWhatsRaised.claimFund preflight. */
export type KwrClaimFundInput = Record<string, never>;

/** Input shape for KeepWhatsRaised.disburseFees preflight. */
export type KwrDisburseFeesInput = Record<string, never>;

/**
 * Preflight validator for KeepWhatsRaised.claimRefund.
 * Lightweight — tokenId 0 may be valid.
 */
export const kwrClaimRefundValidator: MethodValidator<KwrClaimRefundInput> = {
  structural: [],
  semantic: [],
  stateful: [
    async (_input, ctx) => checkTreasuryPaused(ctx.stateReader, ctx.contractAddress, codes.SETTLEMENT_TREASURY_PAUSED),
  ],
};

/**
 * Preflight validator for KeepWhatsRaised.claimTip.
 * Lightweight — checks paused state and campaign deadline.
 */
export const kwrClaimTipValidator: MethodValidator<KwrClaimTipInput> = {
  structural: [],
  semantic: [],
  stateful: [
    async (_input, ctx) => checkTreasuryPaused(ctx.stateReader, ctx.contractAddress, codes.SETTLEMENT_TREASURY_PAUSED),
    async (_input, ctx) => {
      const infoAddress = ctx.addresses.infoAddress;
      if (!infoAddress) return [];
      return checkCampaignEnded(ctx.stateReader, infoAddress, codes.SETTLEMENT_CAMPAIGN_STILL_ACTIVE);
    },
  ],
};

/**
 * Preflight validator for KeepWhatsRaised.claimFund.
 * Checks withdrawal approval (error), paused state, and campaign deadline.
 */
export const kwrClaimFundValidator: MethodValidator<KwrClaimFundInput> = {
  structural: [],
  semantic: [],
  stateful: [
    async (_input, ctx) => checkTreasuryPaused(ctx.stateReader, ctx.contractAddress, codes.SETTLEMENT_TREASURY_PAUSED),
    async (_input, ctx) => {
      const infoAddress = ctx.addresses.infoAddress;
      if (!infoAddress) return [];
      return checkCampaignEnded(ctx.stateReader, infoAddress, codes.SETTLEMENT_CAMPAIGN_STILL_ACTIVE);
    },
    async (_input, ctx) => {
      const approved = await ctx.stateReader.getWithdrawalApprovalStatus(ctx.contractAddress);
      if (approved === null) {
        return [
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read withdrawal approval status."),
        ];
      }
      if (!approved) {
        return [
          createIssue(
            codes.SETTLEMENT_WITHDRAWAL_NOT_APPROVED,
            "error",
            "Withdrawal has not been approved. Call approveWithdrawal() first.",
            { suggestion: "The campaign creator must approve withdrawal before funds can be claimed." },
          ),
        ];
      }
      return [];
    },
  ],
};

/**
 * Preflight validator for KeepWhatsRaised.disburseFees.
 * Lightweight — defers most logic to simulation.
 */
export const kwrDisburseFeesValidator: MethodValidator<KwrDisburseFeesInput> = {
  structural: [],
  semantic: [],
  stateful: [
    async (_input, ctx) => checkTreasuryPaused(ctx.stateReader, ctx.contractAddress, codes.SETTLEMENT_TREASURY_PAUSED),
  ],
};

// ─── withdraw ─────────────────────────────────────────────────────────────────

/** Input shape for KeepWhatsRaised.withdraw preflight. */
export interface KwrWithdrawInput {
  token: Address;
  amount: bigint;
}

/**
 * Preflight validator for KeepWhatsRaised.withdraw.
 * Checks token/amount validity, accepted token state, treasury status,
 * campaign end, withdrawal approval, and treasury balance.
 */
export const kwrWithdrawValidator: MethodValidator<KwrWithdrawInput> = {
  structural: [
    (input) => checkZeroAddress(input.token, "token"),
    (input, ctx) => checkAddressChecksum(input, ["token"], ctx.options.mode === "normalize"),
    (input) => {
      if (input.amount === 0n) {
        return [
          createIssue(codes.KWR_ZERO_WITHDRAW_AMOUNT, "error", "amount must not be zero.", {
            fieldPath: "amount",
            suggestion: "Provide a non-zero withdrawal amount.",
          }),
        ];
      }
      return [];
    },
  ],

  semantic: [],

  stateful: [
    async (input, ctx) => {
      const infoAddress = ctx.addresses.infoAddress;
      if (!infoAddress) return [];
      return checkTokenAccepted(ctx.stateReader, infoAddress, input.token, "token", codes.KWR_UNACCEPTED_TOKEN);
    },
    async (_input, ctx) => {
      const infoAddress = ctx.addresses.infoAddress;
      if (!infoAddress) return [];

      const sender = ctx.options.effectiveSender;
      if (!sender) {
        return [
          createIssue(
            codes.COMMON_SENDER_UNAVAILABLE,
            "warn",
            "No sender available for authorization check. Provide effectiveSender or a signer.",
          ),
        ];
      }

      const [campaignOwner, platformHash] = await Promise.all([
        ctx.stateReader.owner(infoAddress),
        ctx.stateReader.getPlatformHash(ctx.contractAddress),
      ]);

      if (campaignOwner === null) {
        return [createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read campaign owner from on-chain state.")];
      }
      if (platformHash === null) {
        return [createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read treasury platform hash from on-chain state.")];
      }

      const platformAdmin = await ctx.stateReader.getCampaignPlatformAdminAddress(infoAddress, platformHash);

      const normalizedSender = sender.toLowerCase();
      const normalizedOwner = campaignOwner.toLowerCase();
      if (normalizedSender === normalizedOwner) {
        return [];
      }
      if (platformAdmin === null) {
        return [createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read platform admin from on-chain state.")];
      }
      const normalizedAdmin = platformAdmin.toLowerCase();

      if (normalizedSender !== normalizedAdmin) {
        return [
          createIssue(
            codes.SETTLEMENT_SENDER_NOT_AUTHORIZED,
            "error",
            `Sender ${sender} is neither the campaign owner (${campaignOwner}) nor the platform admin (${platformAdmin}).`,
            { suggestion: "Use the campaign owner or platform admin account to withdraw funds." },
          ),
        ];
      }

      return [];
    },
    async (_input, ctx) => checkTreasuryPaused(ctx.stateReader, ctx.contractAddress, codes.SETTLEMENT_TREASURY_PAUSED),
    async (_input, ctx) => {
      const cancelled = await ctx.stateReader.getCancelled(ctx.contractAddress);
      if (cancelled === null) {
        return [createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read treasury cancelled state.")];
      }
      if (cancelled) {
        return [
          createIssue(
            codes.SETTLEMENT_TREASURY_CANCELLED,
            "error",
            "Treasury has been cancelled, so withdrawals are disabled.",
            { suggestion: "Do not submit this withdrawal while the treasury is cancelled." },
          ),
        ];
      }
      return [];
    },
    async (_input, ctx) => {
      const infoAddress = ctx.addresses.infoAddress;
      if (!infoAddress) return [];
      return checkCampaignEnded(ctx.stateReader, infoAddress, codes.SETTLEMENT_CAMPAIGN_STILL_ACTIVE);
    },
    async (_input, ctx) => {
      const approved = await ctx.stateReader.getWithdrawalApprovalStatus(ctx.contractAddress);
      if (approved === null) {
        return [createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read withdrawal approval status.")];
      }
      if (!approved) {
        return [
          createIssue(
            codes.SETTLEMENT_WITHDRAWAL_NOT_APPROVED,
            "error",
            "Withdrawal has not been approved. Call approveWithdrawal() first.",
            { suggestion: "The campaign creator must approve withdrawal before funds can be withdrawn." },
          ),
        ];
      }
      return [];
    },
    async (input, ctx) => {
      const balance = await ctx.stateReader.erc20BalanceOf(input.token, ctx.contractAddress);
      if (balance === null) {
        return [createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read treasury token balance.")];
      }
      if (balance < input.amount) {
        return [
          createIssue(
            codes.KWR_INSUFFICIENT_TREASURY_BALANCE,
            "error",
            `Treasury balance (${balance}) is less than the requested withdrawal amount (${input.amount}).`,
            { fieldPath: "amount", suggestion: "Reduce the withdrawal amount to at most the available treasury balance." },
          ),
        ];
      }
      return [];
    },
  ],

  normalize: (input) => normalizeAddresses({ ...input }, ["token"]),
};

// ─── Safe descriptors ─────────────────────────────────────────────────────────

/** Safe method descriptor for KeepWhatsRaised.configureTreasury. */
export const configureTreasuryDescriptor: SafeMethodDescriptor<ConfigureTreasuryInput> = {
  validator: configureTreasuryValidator,
  abi: KEEP_WHATS_RAISED_ABI,
  functionName: "configureTreasury",
  toArgs: (input) => [
    {
      minimumWithdrawalForFeeExemption: input.config.minimumWithdrawalForFeeExemption,
      withdrawalDelay: input.config.withdrawalDelay,
      refundDelay: input.config.refundDelay,
      configLockPeriod: input.config.configLockPeriod,
      isColombianCreator: input.config.isColombianCreator,
    },
    {
      launchTime: input.campaignData.launchTime,
      deadline: input.campaignData.deadline,
      goalAmount: input.campaignData.goalAmount,
      currency: input.campaignData.currency,
    },
    {
      flatFeeKey: input.feeKeys.flatFeeKey,
      cumulativeFlatFeeKey: input.feeKeys.cumulativeFlatFeeKey,
      grossPercentageFeeKeys: [...input.feeKeys.grossPercentageFeeKeys],
    },
    {
      flatFeeValue: input.feeValues.flatFeeValue,
      cumulativeFlatFeeValue: input.feeValues.cumulativeFlatFeeValue,
      grossPercentageFeeValues: [...input.feeValues.grossPercentageFeeValues],
    },
  ],
};

/** Safe method descriptor for KeepWhatsRaised.pledgeForAReward. */
export const kwrPledgeForARewardDescriptor: SafeMethodDescriptor<KwrPledgeForARewardInput> = {
  validator: kwrPledgeForARewardValidator,
  abi: KEEP_WHATS_RAISED_ABI,
  functionName: "pledgeForAReward",
  toArgs: (input) => [input.pledgeId, input.backer, input.pledgeToken, input.tip, [...input.rewardNames]],
};

/** Safe method descriptor for KeepWhatsRaised.pledgeWithoutAReward. */
export const kwrPledgeWithoutARewardDescriptor: SafeMethodDescriptor<KwrPledgeWithoutARewardInput> = {
  validator: kwrPledgeWithoutARewardValidator,
  abi: KEEP_WHATS_RAISED_ABI,
  functionName: "pledgeWithoutAReward",
  toArgs: (input) => [input.pledgeId, input.backer, input.pledgeToken, input.pledgeAmount, input.tip],
};

/** Safe method descriptor for KeepWhatsRaised.addRewards (uses KWR ABI). */
export const kwrAddRewardsDescriptor: SafeMethodDescriptor<AddRewardsInput> = {
  validator: addRewardsValidator,
  abi: KEEP_WHATS_RAISED_ABI,
  functionName: "addRewards",
  toArgs: (input) => [
    [...input.rewardNames],
    input.rewards.map((r) => ({
      rewardValue: r.rewardValue,
      isRewardTier: r.isRewardTier,
      itemId: [...r.itemId],
      itemValue: [...r.itemValue],
      itemQuantity: [...r.itemQuantity],
    })),
  ],
};

/** Safe method descriptor for KeepWhatsRaised.setFeeAndPledge. */
export const setFeeAndPledgeDescriptor: SafeMethodDescriptor<SetFeeAndPledgeInput> = {
  validator: setFeeAndPledgeValidator,
  abi: KEEP_WHATS_RAISED_ABI,
  functionName: "setFeeAndPledge",
  toArgs: (input) => [
    input.pledgeId, input.backer, input.pledgeToken, input.pledgeAmount,
    input.tip, input.fee, [...input.reward], input.isPledgeForAReward,
  ],
};

/** Safe method descriptor for KeepWhatsRaised.withdraw. */
export const kwrWithdrawDescriptor: SafeMethodDescriptor<KwrWithdrawInput> = {
  validator: kwrWithdrawValidator,
  abi: KEEP_WHATS_RAISED_ABI,
  functionName: "withdraw",
  toArgs: (input) => [input.token, input.amount],
};

/** Safe method descriptor for KeepWhatsRaised.claimRefund. */
export const kwrClaimRefundDescriptor: SafeMethodDescriptor<KwrClaimRefundInput> = {
  validator: kwrClaimRefundValidator,
  abi: KEEP_WHATS_RAISED_ABI,
  functionName: "claimRefund",
  toArgs: (input) => [input.tokenId],
};

/** Safe method descriptor for KeepWhatsRaised.claimTip. */
export const kwrClaimTipDescriptor: SafeMethodDescriptor<KwrClaimTipInput> = {
  validator: kwrClaimTipValidator,
  abi: KEEP_WHATS_RAISED_ABI,
  functionName: "claimTip",
  toArgs: () => [],
};

/** Safe method descriptor for KeepWhatsRaised.claimFund. */
export const kwrClaimFundDescriptor: SafeMethodDescriptor<KwrClaimFundInput> = {
  validator: kwrClaimFundValidator,
  abi: KEEP_WHATS_RAISED_ABI,
  functionName: "claimFund",
  toArgs: () => [],
};

/** Safe method descriptor for KeepWhatsRaised.disburseFees. */
export const kwrDisburseFeesDescriptor: SafeMethodDescriptor<KwrDisburseFeesInput> = {
  validator: kwrDisburseFeesValidator,
  abi: KEEP_WHATS_RAISED_ABI,
  functionName: "disburseFees",
  toArgs: () => [],
};

// ─── removeReward (re-export shared validator, KWR-specific descriptor) ────────

export { removeRewardValidator } from "./all-or-nothing.js";
export type { RemoveRewardInput } from "./all-or-nothing.js";

/** Safe method descriptor for KeepWhatsRaised.removeReward (uses KWR ABI). */
export const kwrRemoveRewardDescriptor: SafeMethodDescriptor<RemoveRewardInput> = {
  validator: removeRewardValidator,
  abi: KEEP_WHATS_RAISED_ABI,
  functionName: "removeReward",
  toArgs: (input) => [input.rewardName],
};

// ─── approveWithdrawal ────────────────────────────────────────────────────────

/** Input shape for KeepWhatsRaised.approveWithdrawal preflight. */
export type ApproveWithdrawalInput = Record<string, never>;

/**
 * Preflight validator for KeepWhatsRaised.approveWithdrawal.
 * Warns if already approved (idempotent but may be unintentional) or paused.
 */
export const approveWithdrawalValidator: MethodValidator<ApproveWithdrawalInput> = {
  structural: [],
  semantic: [],
  stateful: [
    async (_input, ctx) => checkTreasuryPaused(ctx.stateReader, ctx.contractAddress, codes.SETTLEMENT_TREASURY_PAUSED),
    async (_input, ctx) => {
      const approved = await ctx.stateReader.getWithdrawalApprovalStatus(ctx.contractAddress);
      if (approved === null) {
        return [
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read withdrawal approval status."),
        ];
      }
      if (approved) {
        return [
          createIssue(
            codes.KWR_WITHDRAWAL_ALREADY_APPROVED,
            "warn",
            "Withdrawal has already been approved. Calling approveWithdrawal again is a no-op.",
            { suggestion: "Verify this call is intentional." },
          ),
        ];
      }
      return [];
    },
  ],
};

/** Safe method descriptor for KeepWhatsRaised.approveWithdrawal. */
export const approveWithdrawalDescriptor: SafeMethodDescriptor<ApproveWithdrawalInput> = {
  validator: approveWithdrawalValidator,
  abi: KEEP_WHATS_RAISED_ABI,
  functionName: "approveWithdrawal",
  toArgs: () => [],
};
