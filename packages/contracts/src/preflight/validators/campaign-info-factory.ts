import type { CreateCampaignParams } from "../../types/index.js";
import { CAMPAIGN_INFO_FACTORY_ABI } from "../../abis/campaign-info-factory.js";
import { BYTES32_ZERO, DATA_REGISTRY_KEYS } from "../../constants/index.js";
import { createIssue } from "../issue.js";
import * as codes from "../issue-codes.js";
import { checkZeroAddress, checkArrayLengthParity, checkDuplicates, checkZeroBytes32 } from "../common/checks.js";
import { normalizeAddresses } from "../normalizers.js";
import type { MethodValidator, SafeMethodDescriptor, PreflightContext, PreflightIssue } from "../types.js";

/**
 * Preflight validator for CampaignInfoFactory.createCampaign.
 */
export const createCampaignValidator: MethodValidator<CreateCampaignParams> = {
  structural: [
    // creator must not be zero address
    (input) => checkZeroAddress(input.creator, "creator"),

    // platformDataKey and platformDataValue must match length
    (input) => {
      const keys = input.platformDataKey ?? [];
      const values = input.platformDataValue ?? [];
      if (keys.length === 0 && values.length === 0) return [];
      return checkArrayLengthParity(
        keys,
        values,
        "platformDataKey",
        "platformDataValue",
        codes.CAMPAIGN_PLATFORM_DATA_LENGTH_MISMATCH,
      );
    },

    // no zero values in platformDataValue
    (input) => {
      const values = input.platformDataValue ?? [];
      const issues: PreflightIssue[] = [];
      for (let i = 0; i < values.length; i++) {
        if (values[i] === BYTES32_ZERO) {
          issues.push(
            createIssue(
              codes.CAMPAIGN_ZERO_PLATFORM_DATA_VALUE,
              "error",
              `platformDataValue[${i}] must not be zero bytes32.`,
              { fieldPath: `platformDataValue[${i}]`, suggestion: "Provide a non-zero value." },
            ),
          );
        }
      }
      return issues;
    },
  ],

  semantic: [
    // warn on duplicate selectedPlatformHash
    (input) =>
      checkDuplicates(
        input.selectedPlatformHash,
        "selectedPlatformHash",
        codes.CAMPAIGN_DUPLICATE_PLATFORM_HASH,
        "warn",
      ),

    // warn on duplicate platformDataKey
    (input) => {
      const keys = input.platformDataKey ?? [];
      if (keys.length === 0) return [];
      return checkDuplicates(keys, "platformDataKey", codes.CAMPAIGN_DUPLICATE_PLATFORM_DATA_KEY, "warn");
    },

    // warn on zero goalAmount
    (input) => {
      if (input.campaignData.goalAmount === 0n) {
        return [
          createIssue(codes.CAMPAIGN_ZERO_GOAL_AMOUNT, "warn", "Campaign goalAmount is zero.", {
            fieldPath: "campaignData.goalAmount",
            suggestion: "Consider setting a goal amount for the campaign.",
          }),
        ];
      }
      return [];
    },
  ],

  stateful: [
    // each selectedPlatformHash must be listed
    async (input, ctx) => {
      const gpAddress = ctx.addresses.globalParams;
      if (!gpAddress) return [];
      const issues: PreflightIssue[] = [];
      for (let i = 0; i < input.selectedPlatformHash.length; i++) {
        const listed = await ctx.stateReader.checkIfPlatformIsListed(gpAddress, input.selectedPlatformHash[i]);
        if (listed === null) {
          issues.push(
            createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not verify platform listing on-chain.", {
              fieldPath: `selectedPlatformHash[${i}]`,
            }),
          );
        } else if (!listed) {
          issues.push(
            createIssue(
              codes.CAMPAIGN_PLATFORM_NOT_LISTED,
              "error",
              `Platform ${input.selectedPlatformHash[i]} is not listed in GlobalParams.`,
              {
                fieldPath: `selectedPlatformHash[${i}]`,
                suggestion: "Use a platform that has been enlisted in GlobalParams.",
              },
            ),
          );
        }
      }
      return issues;
    },

    // each platformDataKey must be valid
    async (input, ctx) => {
      const gpAddress = ctx.addresses.globalParams;
      if (!gpAddress) return [];
      const keys = input.platformDataKey ?? [];
      const issues: PreflightIssue[] = [];
      for (let i = 0; i < keys.length; i++) {
        const valid = await ctx.stateReader.checkIfPlatformDataKeyValid(gpAddress, keys[i]);
        if (valid === null) {
          issues.push(
            createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not verify platform data key on-chain.", {
              fieldPath: `platformDataKey[${i}]`,
            }),
          );
        } else if (!valid) {
          issues.push(
            createIssue(
              codes.CAMPAIGN_INVALID_PLATFORM_DATA_KEY,
              "error",
              `Platform data key ${keys[i]} is not valid in GlobalParams.`,
              {
                fieldPath: `platformDataKey[${i}]`,
                suggestion: "Use a valid platform data key registered in GlobalParams.",
              },
            ),
          );
        }
      }
      return issues;
    },

    // identifierHash must not already be used
    async (input, ctx) => {
      const existing = await ctx.stateReader.identifierToCampaignInfo(ctx.contractAddress, input.identifierHash);
      if (existing === null) {
        return [
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not verify identifier uniqueness on-chain.", {
            fieldPath: "identifierHash",
          }),
        ];
      }
      const ZERO = "0x0000000000000000000000000000000000000000";
      if (existing.toLowerCase() !== ZERO) {
        return [
          createIssue(
            codes.CAMPAIGN_DUPLICATE_IDENTIFIER,
            "error",
            `A campaign with identifierHash ${input.identifierHash} already exists at ${existing}.`,
            { fieldPath: "identifierHash", suggestion: "Use a unique identifier hash." },
          ),
        ];
      }
      return [];
    },

    // currency must have accepted tokens
    async (input, ctx) => {
      const gpAddress = ctx.addresses.globalParams;
      if (!gpAddress) return [];
      const tokens = await ctx.stateReader.getTokensForCurrency(gpAddress, input.campaignData.currency);
      if (tokens === null) {
        return [
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not verify currency tokens on-chain.", {
            fieldPath: "campaignData.currency",
          }),
        ];
      }
      if (tokens.length === 0) {
        return [
          createIssue(
            codes.CAMPAIGN_CURRENCY_NO_TOKENS,
            "error",
            `Currency ${input.campaignData.currency} has no accepted tokens.`,
            {
              fieldPath: "campaignData.currency",
              suggestion: "Use a currency that has at least one accepted token registered in GlobalParams.",
            },
          ),
        ];
      }
      return [];
    },

    // launch buffer check
    async (input, ctx) => {
      const gpAddress = ctx.addresses.globalParams;
      if (!gpAddress) return [];

      const [bufferHex, now] = await Promise.all([
        ctx.stateReader.getFromRegistry(gpAddress, DATA_REGISTRY_KEYS.CAMPAIGN_LAUNCH_BUFFER),
        ctx.stateReader.getBlockTimestamp(),
      ]);

      if (bufferHex === null || now === null) {
        return [
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read launch buffer from on-chain state."),
        ];
      }

      const buffer = BigInt(bufferHex);
      if (buffer > 0n && input.campaignData.launchTime < now + buffer) {
        return [
          createIssue(
            codes.CAMPAIGN_LAUNCH_BUFFER_VIOLATION,
            "error",
            `Launch time must be at least ${buffer} seconds from now. Current: ${input.campaignData.launchTime}, minimum: ${now + buffer}.`,
            {
              fieldPath: "campaignData.launchTime",
              suggestion: `Set launchTime to at least ${now + buffer}.`,
            },
          ),
        ];
      }
      return [];
    },

    // minimum campaign duration check
    async (input, ctx) => {
      const gpAddress = ctx.addresses.globalParams;
      if (!gpAddress) return [];

      const minDurationHex = await ctx.stateReader.getFromRegistry(
        gpAddress,
        DATA_REGISTRY_KEYS.MINIMUM_CAMPAIGN_DURATION,
      );

      if (minDurationHex === null) {
        return [
          createIssue(
            codes.COMMON_STATE_UNAVAILABLE,
            "warn",
            "Could not read minimum campaign duration from on-chain state.",
          ),
        ];
      }

      const minDuration = BigInt(minDurationHex);
      const actualDuration = input.campaignData.deadline - input.campaignData.launchTime;
      if (minDuration > 0n && actualDuration < minDuration) {
        return [
          createIssue(
            codes.CAMPAIGN_MIN_DURATION_VIOLATION,
            "error",
            `Campaign duration (${actualDuration}s) is less than minimum required (${minDuration}s).`,
            {
              fieldPath: "campaignData.deadline",
              suggestion: `Extend the deadline so that (deadline - launchTime) >= ${minDuration}.`,
            },
          ),
        ];
      }
      return [];
    },
  ],

  normalize: (input) => normalizeAddresses({ ...input }, ["creator"]),
};

// ─── Safe descriptor ──────────────────────────────────────────────────────────

/**
 * Safe method descriptor for CampaignInfoFactory.createCampaign.
 */
export const createCampaignDescriptor: SafeMethodDescriptor<CreateCampaignParams> = {
  validator: createCampaignValidator,
  abi: CAMPAIGN_INFO_FACTORY_ABI,
  functionName: "createCampaign",
  toArgs: (input) => [
    input.creator,
    input.identifierHash,
    [...input.selectedPlatformHash],
    [...(input.platformDataKey ?? [])],
    [...(input.platformDataValue ?? [])],
    {
      launchTime: input.campaignData.launchTime,
      deadline: input.campaignData.deadline,
      goalAmount: input.campaignData.goalAmount,
      currency: input.campaignData.currency,
    },
    input.nftName,
    input.nftSymbol,
    input.nftImageURI,
    input.contractURI,
  ],
};
