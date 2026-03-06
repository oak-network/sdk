import type { Address, Hex } from "viem";
import type { CampaignData, KeepWhatsRaisedConfig, KeepWhatsRaisedFeeKeys, KeepWhatsRaisedFeeValues } from "../../types/index.js";
import { createIssue } from "../issue.js";
import * as codes from "../issue-codes.js";
import {
  checkZeroAddress,
  checkZeroBytes32,
  checkDuplicates,
  checkTokenAccepted,
  checkCampaignWindowStateful,
  checkErc20BalanceAndAllowance,
} from "../common/checks.js";
import { normalizeAddresses } from "../normalizers.js";
import type { MethodValidator, PreflightIssue } from "../types.js";

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
    (input) => checkZeroAddress(input.backer, "backer", codes.KWR_ZERO_BACKER),
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

    // ERC20 balance/allowance for backer
    // Note: For pledgeForAReward, required amount depends on reward values + tip.
    // Reward value resolution requires additional state reads. Defer to simulation.
  ],

  normalize: (input) => normalizeAddresses({ ...input }, ["backer", "pledgeToken"]),
};

/**
 * Preflight validator for KeepWhatsRaised.pledgeWithoutAReward.
 */
export const kwrPledgeWithoutARewardValidator: MethodValidator<KwrPledgeWithoutARewardInput> = {
  structural: [
    (input) => checkZeroBytes32(input.pledgeId, "pledgeId", codes.KWR_ZERO_PLEDGE_ID),
    (input) => checkZeroAddress(input.backer, "backer", codes.KWR_ZERO_BACKER),
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
