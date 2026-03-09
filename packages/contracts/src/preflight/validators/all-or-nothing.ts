import type { Address, Hex } from "viem";
import { ALL_OR_NOTHING_ABI } from "../../abis/all-or-nothing.js";
import { BYTES32_ZERO } from "../../constants/index.js";
import type { TieredReward } from "../../types/index.js";
import { createIssue } from "../issue.js";
import * as codes from "../issue-codes.js";
import {
  checkZeroAddress,
  checkAddressChecksum,
  checkTokenAccepted,
  checkCampaignWindowStateful,
  checkCampaignEnded,
  checkErc20BalanceAndAllowance,
  checkRewardValidity,
  checkRewardItemArrayParity,
  checkDuplicates,
  checkTreasuryPaused,
} from "../common/checks.js";
import { normalizeAddresses } from "../normalizers.js";
import type { MethodValidator, SafeMethodDescriptor, PreflightIssue } from "../types.js";

// ─── Input shapes ──────────────────────────────────────────────────────────────

/** Input shape for AllOrNothing.pledgeForAReward preflight. */
export interface AonPledgeForARewardInput {
  backer: Address;
  pledgeToken: Address;
  shippingFee: bigint;
  rewardNames: readonly Hex[];
}

/** Input shape for AllOrNothing.pledgeWithoutAReward preflight. */
export interface AonPledgeWithoutARewardInput {
  backer: Address;
  pledgeToken: Address;
  pledgeAmount: bigint;
}

// ─── Validators ────────────────────────────────────────────────────────────────

/**
 * Preflight validator for AllOrNothing.pledgeForAReward.
 */
export const aonPledgeForARewardValidator: MethodValidator<AonPledgeForARewardInput> = {
  structural: [
    (input, ctx) => [
      ...checkZeroAddress(input.backer, "backer", codes.AON_ZERO_BACKER),
      ...checkZeroAddress(input.pledgeToken, "pledgeToken", codes.COMMON_ZERO_ADDRESS),
      ...checkAddressChecksum(input, ["backer", "pledgeToken"], ctx.options.mode === "normalize"),
    ],

    (input) => {
      if (input.rewardNames.length === 0) {
        return [
          createIssue(codes.AON_EMPTY_REWARD_NAMES, "error", "rewardNames must not be empty.", {
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
      return checkTokenAccepted(ctx.stateReader, infoAddress, input.pledgeToken, "pledgeToken", codes.AON_UNACCEPTED_TOKEN);
    },

    // Campaign window
    async (_input, ctx) => {
      const infoAddress = ctx.addresses.infoAddress;
      if (!infoAddress) return [];
      return checkCampaignWindowStateful(
        ctx.stateReader,
        infoAddress,
        codes.AON_CAMPAIGN_NOT_STARTED,
        codes.AON_CAMPAIGN_ENDED,
      );
    },

    // Reward existence and first-tier validity
    async (input, ctx) => {
      return checkRewardValidity(
        ctx.stateReader,
        ctx.contractAddress,
        input.rewardNames,
        codes.AON_UNKNOWN_REWARD,
        codes.AON_INVALID_FIRST_REWARD_TIER,
        "rewardNames",
      );
    },

    // ERC20 balance/allowance for backer
    // Note: For pledgeForAReward, the required amount depends on reward values which
    // would need additional state reads to sum. Defer to simulation for amount check.
  ],

  normalize: (input) => normalizeAddresses({ ...input }, ["backer", "pledgeToken"]),
};

/**
 * Preflight validator for AllOrNothing.pledgeWithoutAReward.
 */
export const aonPledgeWithoutARewardValidator: MethodValidator<AonPledgeWithoutARewardInput> = {
  structural: [
    (input, ctx) => [
      ...checkZeroAddress(input.backer, "backer", codes.AON_ZERO_BACKER),
      ...checkZeroAddress(input.pledgeToken, "pledgeToken", codes.COMMON_ZERO_ADDRESS),
      ...checkAddressChecksum(input, ["backer", "pledgeToken"], ctx.options.mode === "normalize"),
    ],

    (input) => {
      if (input.pledgeAmount === 0n) {
        return [
          createIssue(codes.AON_ZERO_PLEDGE_AMOUNT, "error", "pledgeAmount must not be zero.", {
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
      return checkTokenAccepted(ctx.stateReader, infoAddress, input.pledgeToken, "pledgeToken", codes.AON_UNACCEPTED_TOKEN);
    },

    // Campaign window
    async (_input, ctx) => {
      const infoAddress = ctx.addresses.infoAddress;
      if (!infoAddress) return [];
      return checkCampaignWindowStateful(
        ctx.stateReader,
        infoAddress,
        codes.AON_CAMPAIGN_NOT_STARTED,
        codes.AON_CAMPAIGN_ENDED,
      );
    },

    // ERC20 balance/allowance for backer
    async (input, ctx) => {
      return checkErc20BalanceAndAllowance(
        ctx.stateReader,
        input.pledgeToken,
        input.backer,
        ctx.contractAddress,
        input.pledgeAmount,
        "backer",
      );
    },
  ],

  normalize: (input) => normalizeAddresses({ ...input }, ["backer", "pledgeToken"]),
};

// ─── addRewards ───────────────────────────────────────────────────────────────

/** Input shape for addRewards preflight (shared between AON and KWR). */
export interface AddRewardsInput {
  rewardNames: readonly Hex[];
  rewards: readonly TieredReward[];
}

/**
 * Preflight validator for addRewards (shared between AON and KWR).
 */
export const addRewardsValidator: MethodValidator<AddRewardsInput> = {
  structural: [
    // Array length parity
    (input) => {
      if (input.rewardNames.length !== input.rewards.length) {
        return [
          createIssue(
            codes.REWARD_ARRAY_MISMATCH,
            "error",
            `rewardNames (length ${input.rewardNames.length}) and rewards (length ${input.rewards.length}) must have the same length.`,
            { fieldPath: "rewardNames", suggestion: "Ensure both arrays have equal length." },
          ),
        ];
      }
      return [];
    },

    // Zero reward names
    (input) => {
      const issues: PreflightIssue[] = [];
      for (let i = 0; i < input.rewardNames.length; i++) {
        if (input.rewardNames[i] === BYTES32_ZERO) {
          issues.push(
            createIssue(codes.REWARD_ZERO_NAME, "error", `rewardNames[${i}] must not be zero bytes32.`, {
              fieldPath: `rewardNames[${i}]`,
              suggestion: "Provide a valid non-zero reward name.",
            }),
          );
        }
      }
      return issues;
    },

    // Zero reward values
    (input) => {
      const issues: PreflightIssue[] = [];
      for (let i = 0; i < input.rewards.length; i++) {
        if (input.rewards[i].rewardValue === 0n) {
          issues.push(
            createIssue(codes.REWARD_ZERO_VALUE, "error", `rewards[${i}].rewardValue must not be zero.`, {
              fieldPath: `rewards[${i}].rewardValue`,
              suggestion: "Provide a non-zero reward value.",
            }),
          );
        }
      }
      return issues;
    },

    // Item array parity within each reward
    (input) => checkRewardItemArrayParity(input.rewards, "rewards"),
  ],

  semantic: [
    // Duplicate reward names — error because the contract will revert on the second
    // occurrence once the first has already been created in the same addRewards call.
    (input) => checkDuplicates(input.rewardNames as Hex[], "rewardNames", codes.REWARD_DUPLICATE_NAME, "error"),
  ],

  stateful: [
    // Reward already exists on-chain
    async (input, ctx) => {
      const issues: PreflightIssue[] = [];
      for (let i = 0; i < input.rewardNames.length; i++) {
        const reward = await ctx.stateReader.getReward(ctx.contractAddress, input.rewardNames[i]);
        if (reward === null) {
          issues.push(
            createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", `Could not verify reward at rewardNames[${i}].`, {
              fieldPath: `rewardNames[${i}]`,
            }),
          );
          continue;
        }
        if (reward.rewardValue !== 0n) {
          issues.push(
            createIssue(codes.REWARD_ALREADY_EXISTS, "error", `Reward ${input.rewardNames[i]} at rewardNames[${i}] already exists.`, {
              fieldPath: `rewardNames[${i}]`,
              suggestion: "Use a reward name that has not already been added.",
            }),
          );
        }
      }
      return issues;
    },
  ],
};

// ─── AON Settlement validators ────────────────────────────────────────────────

/** Input shape for AllOrNothing.withdraw preflight. */
export type AonWithdrawInput = Record<string, never>;

/** Input shape for AllOrNothing.claimRefund preflight. */
export interface AonClaimRefundInput {
  tokenId: bigint;
}

/** Input shape for AllOrNothing.disburseFees preflight. */
export type AonDisburseFeesInput = Record<string, never>;

/**
 * Preflight validator for AllOrNothing.withdraw.
 * Lightweight — checks only publicly readable state.
 */
export const aonWithdrawValidator: MethodValidator<AonWithdrawInput> = {
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
 * Preflight validator for AllOrNothing.claimRefund.
 * Lightweight — tokenId 0 may be valid, so no structural checks.
 */
export const aonClaimRefundValidator: MethodValidator<AonClaimRefundInput> = {
  structural: [],
  semantic: [],
  stateful: [
    async (_input, ctx) => checkTreasuryPaused(ctx.stateReader, ctx.contractAddress, codes.SETTLEMENT_TREASURY_PAUSED),
  ],
};

/**
 * Preflight validator for AllOrNothing.disburseFees.
 * Lightweight — defers most logic to simulation.
 */
export const aonDisburseFeesValidator: MethodValidator<AonDisburseFeesInput> = {
  structural: [],
  semantic: [],
  stateful: [
    async (_input, ctx) => checkTreasuryPaused(ctx.stateReader, ctx.contractAddress, codes.SETTLEMENT_TREASURY_PAUSED),
  ],
};

// ─── Safe descriptors ─────────────────────────────────────────────────────────

/** Safe method descriptor for AllOrNothing.pledgeForAReward. */
export const aonPledgeForARewardDescriptor: SafeMethodDescriptor<AonPledgeForARewardInput> = {
  validator: aonPledgeForARewardValidator,
  abi: ALL_OR_NOTHING_ABI,
  functionName: "pledgeForAReward",
  toArgs: (input) => [input.backer, input.pledgeToken, input.shippingFee, [...input.rewardNames]],
};

/** Safe method descriptor for AllOrNothing.pledgeWithoutAReward. */
export const aonPledgeWithoutARewardDescriptor: SafeMethodDescriptor<AonPledgeWithoutARewardInput> = {
  validator: aonPledgeWithoutARewardValidator,
  abi: ALL_OR_NOTHING_ABI,
  functionName: "pledgeWithoutAReward",
  toArgs: (input) => [input.backer, input.pledgeToken, input.pledgeAmount],
};

/** Safe method descriptor for addRewards (shared between AON and KWR). */
export const addRewardsDescriptor: SafeMethodDescriptor<AddRewardsInput> = {
  validator: addRewardsValidator,
  abi: ALL_OR_NOTHING_ABI,
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

/** Safe method descriptor for AllOrNothing.withdraw. */
export const aonWithdrawDescriptor: SafeMethodDescriptor<AonWithdrawInput> = {
  validator: aonWithdrawValidator,
  abi: ALL_OR_NOTHING_ABI,
  functionName: "withdraw",
  toArgs: () => [],
};

/** Safe method descriptor for AllOrNothing.claimRefund. */
export const aonClaimRefundDescriptor: SafeMethodDescriptor<AonClaimRefundInput> = {
  validator: aonClaimRefundValidator,
  abi: ALL_OR_NOTHING_ABI,
  functionName: "claimRefund",
  toArgs: (input) => [input.tokenId],
};

/** Safe method descriptor for AllOrNothing.disburseFees. */
export const aonDisburseFeesDescriptor: SafeMethodDescriptor<AonDisburseFeesInput> = {
  validator: aonDisburseFeesValidator,
  abi: ALL_OR_NOTHING_ABI,
  functionName: "disburseFees",
  toArgs: () => [],
};

// ─── removeReward (shared between AON and KWR) ────────────────────────────────

/** Input shape for removeReward preflight (shared between AON and KWR). */
export interface RemoveRewardInput {
  rewardName: Hex;
}

/**
 * Preflight validator for removeReward (shared between AON and KWR).
 */
export const removeRewardValidator: MethodValidator<RemoveRewardInput> = {
  structural: [
    (input) => {
      if (input.rewardName === BYTES32_ZERO) {
        return [
          createIssue(codes.REWARD_ZERO_NAME, "error", "rewardName must not be zero bytes32.", {
            fieldPath: "rewardName",
            suggestion: "Provide a valid non-zero reward name.",
          }),
        ];
      }
      return [];
    },
  ],

  semantic: [],

  stateful: [
    async (input, ctx) => {
      const reward = await ctx.stateReader.getReward(ctx.contractAddress, input.rewardName);
      if (reward === null) {
        return [
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not verify reward existence on-chain.", {
            fieldPath: "rewardName",
          }),
        ];
      }
      if (reward.rewardValue === 0n) {
        return [
          createIssue(codes.REWARD_NOT_FOUND, "error", `Reward ${input.rewardName} does not exist.`, {
            fieldPath: "rewardName",
            suggestion: "Provide a reward name that has been added via addRewards.",
          }),
        ];
      }
      return [];
    },
  ],
};

/** Safe method descriptor for AllOrNothing.removeReward. */
export const aonRemoveRewardDescriptor: SafeMethodDescriptor<RemoveRewardInput> = {
  validator: removeRewardValidator,
  abi: ALL_OR_NOTHING_ABI,
  functionName: "removeReward",
  toArgs: (input) => [input.rewardName],
};
