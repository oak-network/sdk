import type { Address, Hex } from "viem";
import { createIssue } from "../issue.js";
import * as codes from "../issue-codes.js";
import {
  checkZeroAddress,
  checkTokenAccepted,
  checkCampaignWindowStateful,
  checkErc20BalanceAndAllowance,
} from "../common/checks.js";
import { normalizeAddresses } from "../normalizers.js";
import type { MethodValidator, PreflightIssue } from "../types.js";

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
    (input) => checkZeroAddress(input.backer, "backer", codes.AON_ZERO_BACKER),

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

    // ERC20 balance/allowance for backer
    // Note: For pledgeForAReward, the required amount depends on reward values which
    // would need additional state reads. We skip the amount-based check here since
    // the reward value resolution is complex. Simulation will catch insufficient funds.
  ],

  normalize: (input) => normalizeAddresses({ ...input }, ["backer", "pledgeToken"]),
};

/**
 * Preflight validator for AllOrNothing.pledgeWithoutAReward.
 */
export const aonPledgeWithoutARewardValidator: MethodValidator<AonPledgeWithoutARewardInput> = {
  structural: [
    (input) => checkZeroAddress(input.backer, "backer", codes.AON_ZERO_BACKER),

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
