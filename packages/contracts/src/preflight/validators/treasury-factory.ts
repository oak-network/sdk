import type { Address, Hex } from "viem";
import { createIssue } from "../issue.js";
import * as codes from "../issue-codes.js";
import { normalizeAddresses } from "../normalizers.js";
import type { MethodValidator, PreflightIssue } from "../types.js";

/** Input shape for TreasuryFactory.deploy preflight. */
export interface DeployInput {
  platformHash: Hex;
  infoAddress: Address;
  implementationId: bigint;
}

/**
 * Preflight validator for TreasuryFactory.deploy.
 */
export const deployValidator: MethodValidator<DeployInput> = {
  structural: [],

  semantic: [],

  stateful: [
    // sender must match platform admin
    async (input, ctx) => {
      const gpAddress = ctx.addresses.globalParams;
      if (!gpAddress) return [];
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

      const admin = await ctx.stateReader.getPlatformAdminAddress(gpAddress, input.platformHash);
      if (admin === null) {
        return [
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read platform admin from on-chain state.", {
            fieldPath: "platformHash",
          }),
        ];
      }

      if (sender.toLowerCase() !== admin.toLowerCase()) {
        return [
          createIssue(
            codes.FACTORY_SENDER_NOT_PLATFORM_ADMIN,
            "error",
            `Sender ${sender} is not the platform admin (${admin}).`,
            {
              fieldPath: "platformHash",
              suggestion: "Use the platform admin account to deploy.",
            },
          ),
        ];
      }
      return [];
    },

    // campaign must have selected this platform
    async (input, ctx) => {
      const selected = await ctx.stateReader.checkIfPlatformSelected(input.infoAddress, input.platformHash);
      if (selected === null) {
        return [
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not verify platform selection on-chain.", {
            fieldPath: "platformHash",
          }),
        ];
      }
      if (!selected) {
        return [
          createIssue(
            codes.FACTORY_PLATFORM_NOT_SELECTED,
            "error",
            `Campaign at ${input.infoAddress} has not selected platform ${input.platformHash}.`,
            {
              fieldPath: "platformHash",
              suggestion: "Ensure the campaign has selected this platform before deploying a treasury.",
            },
          ),
        ];
      }
      return [];
    },

    // platform must not already be approved
    async (input, ctx) => {
      const approved = await ctx.stateReader.checkIfPlatformApproved(input.infoAddress, input.platformHash);
      if (approved === null) {
        return [
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not verify platform approval on-chain.", {
            fieldPath: "platformHash",
          }),
        ];
      }
      if (approved) {
        return [
          createIssue(
            codes.FACTORY_PLATFORM_ALREADY_APPROVED,
            "error",
            `Platform ${input.platformHash} is already approved/deployed for campaign at ${input.infoAddress}.`,
            {
              fieldPath: "platformHash",
              suggestion: "A treasury has already been deployed for this platform and campaign.",
            },
          ),
        ];
      }
      return [];
    },
  ],

  normalize: (input) => normalizeAddresses({ ...input }, ["infoAddress"]),
};
