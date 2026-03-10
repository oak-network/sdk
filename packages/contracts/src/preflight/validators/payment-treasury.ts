import type { Address, Hex } from "viem";
import { PAYMENT_TREASURY_ABI } from "../../abis/payment-treasury.js";
import { DATA_REGISTRY_KEYS } from "../../constants/index.js";
import type { LineItem, ExternalFees } from "../../types/index.js";
import { createIssue } from "../issue.js";
import * as codes from "../issue-codes.js";
import {
  checkZeroAddress,
  checkZeroBytes32,
  checkArrayLengthParity,
  checkDuplicates,
  checkAddressChecksum,
  checkTokenAccepted,
  checkErc20BalanceAndAllowance,
  checkLineItemTypes,
  checkCampaignEnded,
} from "../common/checks.js";
import { normalizeAddresses } from "../normalizers.js";
import type { MethodValidator, SafeMethodDescriptor, PreflightContext, PreflightIssue } from "../types.js";

const BATCH_WARN_THRESHOLD = 50;

// ─── Input shapes ──────────────────────────────────────────────────────────────

/** Input shape for PaymentTreasury.createPayment preflight. */
export interface CreatePaymentInput {
  paymentId: Hex;
  buyerId: Hex;
  itemId: Hex;
  paymentToken: Address;
  amount: bigint;
  expiration: bigint;
  lineItems: readonly LineItem[];
  externalFees: readonly ExternalFees[];
}

/** Input shape for PaymentTreasury.createPaymentBatch preflight. */
export interface CreatePaymentBatchInput {
  paymentIds: readonly Hex[];
  buyerIds: readonly Hex[];
  itemIds: readonly Hex[];
  paymentTokens: readonly Address[];
  amounts: readonly bigint[];
  expirations: readonly bigint[];
  lineItemsArray: readonly (readonly LineItem[])[];
  externalFeesArray: readonly (readonly ExternalFees[])[];
}

/** Input shape for PaymentTreasury.confirmPayment preflight. */
export interface ConfirmPaymentInput {
  paymentId: Hex;
  buyerAddress: Address;
}

/** Input shape for PaymentTreasury.confirmPaymentBatch preflight. */
export interface ConfirmPaymentBatchInput {
  paymentIds: readonly Hex[];
  buyerAddresses: readonly Address[];
}

/** Input shape for PaymentTreasury.processCryptoPayment preflight. */
export interface ProcessCryptoPaymentInput {
  paymentId: Hex;
  itemId: Hex;
  buyerAddress: Address;
  paymentToken: Address;
  amount: bigint;
  lineItems: readonly LineItem[];
  externalFees: readonly ExternalFees[];
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

function checkCreatePaymentStructural(input: CreatePaymentInput, prefix: string = ""): PreflightIssue[] {
  const p = prefix ? `${prefix}.` : "";
  const issues: PreflightIssue[] = [];

  issues.push(...checkZeroBytes32(input.paymentId, `${p}paymentId`, codes.PAYMENT_ZERO_PAYMENT_ID));
  issues.push(...checkZeroBytes32(input.buyerId, `${p}buyerId`, codes.PAYMENT_ZERO_BUYER_ID));
  issues.push(...checkZeroBytes32(input.itemId, `${p}itemId`, codes.PAYMENT_ZERO_ITEM_ID));
  issues.push(...checkZeroAddress(input.paymentToken, `${p}paymentToken`, codes.PAYMENT_ZERO_TOKEN));

  if (input.amount <= 0n) {
    issues.push(
      createIssue(codes.PAYMENT_ZERO_AMOUNT, "error", `${p}amount must be a positive uint256 value.`, {
        fieldPath: `${p}amount`,
        suggestion: "Provide a positive payment amount.",
      }),
    );
  }

  for (let i = 0; i < input.lineItems.length; i++) {
    if (input.lineItems[i].amount <= 0n) {
      issues.push(
        createIssue(
          codes.PAYMENT_ZERO_LINE_ITEM_AMOUNT,
          "error",
          `${p}lineItems[${i}].amount must be a positive uint256 value.`,
          { fieldPath: `${p}lineItems[${i}].amount`, suggestion: "Set a positive amount for each line item." },
        ),
      );
    }
  }

  return issues;
}

async function checkCreatePaymentStateful(
  input: CreatePaymentInput,
  ctx: PreflightContext,
  prefix: string = "",
): Promise<PreflightIssue[]> {
  const p = prefix ? `${prefix}.` : "";
  const issues: PreflightIssue[] = [];
  const infoAddress = ctx.addresses.infoAddress;
  const gpAddress = ctx.addresses.globalParams;

  // Check token acceptance
  if (infoAddress) {
    issues.push(
      ...(await checkTokenAccepted(ctx.stateReader, infoAddress, input.paymentToken, `${p}paymentToken`, codes.PAYMENT_UNACCEPTED_TOKEN)),
    );
  }

  // Check line item types exist
  if (infoAddress && input.lineItems.length > 0) {
    const platformHash = await ctx.stateReader.getPlatformHash(ctx.contractAddress);
    if (platformHash === null) {
      issues.push(
        createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read platform hash for line item type validation.", {
          fieldPath: `${p}lineItems`,
        }),
      );
    } else {
      issues.push(
        ...(await checkLineItemTypes(ctx.stateReader, infoAddress, platformHash, input.lineItems, codes.PAYMENT_UNKNOWN_LINE_ITEM_TYPE, `${p}lineItems`)),
      );
    }
  }

  // Check expiration not in the past
  const now = await ctx.stateReader.getBlockTimestamp();
  if (now === null) {
    issues.push(
      createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read block timestamp for expiration checks.", {
        fieldPath: `${p}expiration`,
      }),
    );
  } else if (input.expiration > 0n && input.expiration <= now) {
    issues.push(
      createIssue(codes.PAYMENT_EXPIRED, "error", `${p}expiration (${input.expiration}) is in the past.`, {
        fieldPath: `${p}expiration`,
        suggestion: "Set a future expiration timestamp.",
      }),
    );
  }

  // Check expiration not too long
  if (gpAddress && now !== null && input.expiration > 0n) {
    const maxHex = await ctx.stateReader.getFromRegistry(gpAddress, DATA_REGISTRY_KEYS.MAX_PAYMENT_EXPIRATION);
    if (maxHex === null) {
      issues.push(
        createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read max payment expiration from registry.", {
          fieldPath: `${p}expiration`,
        }),
      );
    } else {
      const max = BigInt(maxHex);
      if (max > 0n && input.expiration > now + max) {
        issues.push(
          createIssue(
            codes.PAYMENT_EXPIRATION_TOO_LONG,
            "error",
            `${p}expiration exceeds maximum allowed. Max: ${now + max}, provided: ${input.expiration}.`,
            { fieldPath: `${p}expiration`, suggestion: `Set expiration to at most ${now + max}.` },
          ),
        );
      }
    }
  }

  // Check duplicate paymentId
  const paymentData = await ctx.stateReader.getPaymentData(ctx.contractAddress, input.paymentId);
  if (paymentData === null) {
    issues.push(
      createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read payment data for duplicate check.", {
        fieldPath: `${p}paymentId`,
      }),
    );
  } else if (paymentData.amount > 0n) {
    issues.push(
      createIssue(
        codes.PAYMENT_DUPLICATE_PAYMENT_ID,
        "error",
        `Payment with id ${input.paymentId} already exists.`,
        { fieldPath: `${p}paymentId`, suggestion: "Use a unique payment ID." },
      ),
    );
  }

  return issues;
}

// ─── Validators ────────────────────────────────────────────────────────────────

/**
 * Preflight validator for PaymentTreasury.createPayment.
 */
export const createPaymentValidator: MethodValidator<CreatePaymentInput> = {
  structural: [
    (input, ctx) => [
      ...checkCreatePaymentStructural(input),
      ...checkAddressChecksum(input, ["paymentToken"], ctx.options.mode === "normalize"),
    ],
  ],
  semantic: [],
  stateful: [(input, ctx) => checkCreatePaymentStateful(input, ctx)],
  normalize: (input) => normalizeAddresses({ ...input }, ["paymentToken"]),
};

/**
 * Preflight validator for PaymentTreasury.createPaymentBatch.
 */
export const createPaymentBatchValidator: MethodValidator<CreatePaymentBatchInput> = {
  structural: [
    (input) => {
      const issues: PreflightIssue[] = [];
      const len = input.paymentIds.length;

      // Check all 8 arrays match length
      const arrays: [readonly unknown[], string][] = [
        [input.buyerIds, "buyerIds"],
        [input.itemIds, "itemIds"],
        [input.paymentTokens, "paymentTokens"],
        [input.amounts, "amounts"],
        [input.expirations, "expirations"],
        [input.lineItemsArray, "lineItemsArray"],
        [input.externalFeesArray, "externalFeesArray"],
      ];

      for (const [arr, name] of arrays) {
        issues.push(...checkArrayLengthParity(input.paymentIds, arr, "paymentIds", name));
      }

      // If any parity error, skip per-item checks to avoid out-of-bounds access
      if (issues.length > 0) return issues;

      // Per-item structural checks
      for (let i = 0; i < len; i++) {
        const item: CreatePaymentInput = {
          paymentId: input.paymentIds[i],
          buyerId: input.buyerIds[i],
          itemId: input.itemIds[i],
          paymentToken: input.paymentTokens[i],
          amount: input.amounts[i],
          expiration: input.expirations[i],
          lineItems: input.lineItemsArray[i],
          externalFees: input.externalFeesArray[i],
        };
        issues.push(...checkCreatePaymentStructural(item, `batch[${i}]`));
      }

      return issues;
    },
  ],

  semantic: [
    (input) => {
      const issues: PreflightIssue[] = [];

      issues.push(
        ...checkDuplicates(input.paymentIds, "paymentIds", codes.PAYMENT_BATCH_DUPLICATE_PAYMENT_ID, "error"),
      );

      if (input.paymentIds.length > BATCH_WARN_THRESHOLD) {
        issues.push(
          createIssue(
            codes.PAYMENT_BATCH_TOO_LARGE,
            "warn",
            `Batch size (${input.paymentIds.length}) exceeds recommended limit of ${BATCH_WARN_THRESHOLD}.`,
            { suggestion: "Consider splitting into smaller batches to avoid gas limits." },
          ),
        );
      }
      return issues;
    },
  ],

  stateful: [
    async (input, ctx) => {
      // Skip if arrays are mismatched (structural already reported this)
      const len = input.paymentIds.length;
      if (
        input.buyerIds.length !== len ||
        input.itemIds.length !== len ||
        input.paymentTokens.length !== len ||
        input.amounts.length !== len ||
        input.expirations.length !== len ||
        input.lineItemsArray.length !== len ||
        input.externalFeesArray.length !== len
      ) {
        return [];
      }

      const issues: PreflightIssue[] = [];
      for (let i = 0; i < len; i++) {
        const item: CreatePaymentInput = {
          paymentId: input.paymentIds[i],
          buyerId: input.buyerIds[i],
          itemId: input.itemIds[i],
          paymentToken: input.paymentTokens[i],
          amount: input.amounts[i],
          expiration: input.expirations[i],
          lineItems: input.lineItemsArray[i],
          externalFees: input.externalFeesArray[i],
        };
        issues.push(...(await checkCreatePaymentStateful(item, ctx, `batch[${i}]`)));
      }
      return issues;
    },
  ],
};

/**
 * Preflight validator for PaymentTreasury.confirmPayment.
 */
export const confirmPaymentValidator: MethodValidator<ConfirmPaymentInput> = {
  structural: [
    (input, ctx) => [
      ...checkZeroBytes32(input.paymentId, "paymentId", codes.PAYMENT_ZERO_PAYMENT_ID),
      ...checkZeroAddress(input.buyerAddress, "buyerAddress", codes.PAYMENT_ZERO_BUYER_ADDRESS),
      ...checkAddressChecksum(input, ["buyerAddress"], ctx.options.mode === "normalize"),
    ],
  ],

  semantic: [],

  stateful: [
    async (input, ctx) => {
      const issues: PreflightIssue[] = [];
      const paymentData = await ctx.stateReader.getPaymentData(ctx.contractAddress, input.paymentId);

      if (paymentData === null) {
        issues.push(
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read payment data from on-chain state.", {
            fieldPath: "paymentId",
          }),
        );
        return issues;
      }

      if (paymentData.amount === 0n) {
        issues.push(
          createIssue(codes.PAYMENT_NOT_FOUND, "error", `Payment ${input.paymentId} does not exist.`, {
            fieldPath: "paymentId",
            suggestion: "Ensure the payment has been created before confirming.",
          }),
        );
        return issues;
      }

      if (paymentData.buyerAddress.toLowerCase() !== input.buyerAddress.toLowerCase()) {
        issues.push(
          createIssue(
            codes.PAYMENT_BUYER_MISMATCH,
            "error",
            `Supplied buyerAddress ${input.buyerAddress} does not match on-chain buyer ${paymentData.buyerAddress}.`,
            { fieldPath: "buyerAddress", suggestion: "Use the buyer address that was set when the payment was created." },
          ),
        );
      }

      if (paymentData.isConfirmed) {
        issues.push(
          createIssue(
            codes.PAYMENT_ALREADY_CONFIRMED,
            "error",
            `Payment ${input.paymentId} is already confirmed.`,
            { fieldPath: "paymentId" },
          ),
        );
      }

      const now = await ctx.stateReader.getBlockTimestamp();
      if (now === null) {
        issues.push(
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read block timestamp for expiration check.", {
            fieldPath: "paymentId",
          }),
        );
      } else if (paymentData.expiration > 0n && paymentData.expiration <= now) {
        issues.push(
          createIssue(codes.PAYMENT_ALREADY_EXPIRED, "error", `Payment ${input.paymentId} has expired.`, {
            fieldPath: "paymentId",
            suggestion: "This payment can no longer be confirmed.",
          }),
        );
      }

      return issues;
    },
  ],

  normalize: (input) => normalizeAddresses({ ...input }, ["buyerAddress"]),
};

/**
 * Preflight validator for PaymentTreasury.confirmPaymentBatch.
 */
export const confirmPaymentBatchValidator: MethodValidator<ConfirmPaymentBatchInput> = {
  structural: [
    (input) => {
      const issues: PreflightIssue[] = [];
      issues.push(...checkArrayLengthParity(input.paymentIds, input.buyerAddresses, "paymentIds", "buyerAddresses"));

      // If parity error, skip per-item checks to avoid out-of-bounds access
      if (issues.length > 0) return issues;

      for (let i = 0; i < input.paymentIds.length; i++) {
        issues.push(...checkZeroBytes32(input.paymentIds[i], `paymentIds[${i}]`, codes.PAYMENT_ZERO_PAYMENT_ID));
        issues.push(
          ...checkZeroAddress(input.buyerAddresses[i], `buyerAddresses[${i}]`, codes.PAYMENT_ZERO_BUYER_ADDRESS),
        );
      }
      return issues;
    },
  ],

  semantic: [
    (input) => {
      if (input.paymentIds.length > BATCH_WARN_THRESHOLD) {
        return [
          createIssue(
            codes.PAYMENT_BATCH_TOO_LARGE,
            "warn",
            `Batch size (${input.paymentIds.length}) exceeds recommended limit of ${BATCH_WARN_THRESHOLD}.`,
            { suggestion: "Consider splitting into smaller batches." },
          ),
        ];
      }
      return [];
    },
  ],

  stateful: [
    async (input, ctx) => {
      // Skip if arrays are mismatched (structural already reported this)
      if (input.paymentIds.length !== input.buyerAddresses.length) return [];

      const issues: PreflightIssue[] = [];
      for (let i = 0; i < input.paymentIds.length; i++) {
        const confirmInput: ConfirmPaymentInput = {
          paymentId: input.paymentIds[i],
          buyerAddress: input.buyerAddresses[i],
        };
        // Run the stateful checks from confirmPaymentValidator for each item
        for (const rule of confirmPaymentValidator.stateful) {
          issues.push(...(await rule(confirmInput, ctx)));
        }
      }
      return issues;
    },
  ],
};

/**
 * Preflight validator for PaymentTreasury.processCryptoPayment.
 */
export const processCryptoPaymentValidator: MethodValidator<ProcessCryptoPaymentInput> = {
  structural: [
    (input, ctx) => {
      const issues: PreflightIssue[] = [];
      issues.push(...checkZeroBytes32(input.paymentId, "paymentId", codes.PAYMENT_ZERO_PAYMENT_ID));
      issues.push(...checkZeroBytes32(input.itemId, "itemId", codes.PAYMENT_ZERO_ITEM_ID));
      issues.push(...checkZeroAddress(input.buyerAddress, "buyerAddress", codes.PAYMENT_ZERO_BUYER_ADDRESS));
      issues.push(...checkZeroAddress(input.paymentToken, "paymentToken", codes.PAYMENT_ZERO_TOKEN));
      issues.push(...checkAddressChecksum(input, ["buyerAddress", "paymentToken"], ctx.options.mode === "normalize"));

      if (input.amount <= 0n) {
        issues.push(
          createIssue(codes.PAYMENT_ZERO_AMOUNT, "error", "amount must be a positive uint256 value.", {
            fieldPath: "amount",
            suggestion: "Provide a positive payment amount.",
          }),
        );
      }

      for (let i = 0; i < input.lineItems.length; i++) {
        if (input.lineItems[i].amount <= 0n) {
          issues.push(
            createIssue(
              codes.PAYMENT_ZERO_LINE_ITEM_AMOUNT,
              "error",
              `lineItems[${i}].amount must be a positive uint256 value.`,
              { fieldPath: `lineItems[${i}].amount` },
            ),
          );
        }
      }

      return issues;
    },
  ],

  semantic: [],

  stateful: [
    async (input, ctx) => {
      const issues: PreflightIssue[] = [];
      const infoAddress = ctx.addresses.infoAddress;

      // Check token acceptance
      if (infoAddress) {
        issues.push(
          ...(await checkTokenAccepted(ctx.stateReader, infoAddress, input.paymentToken, "paymentToken", codes.PAYMENT_UNACCEPTED_TOKEN)),
        );
      }

      // Check line item types exist
      if (infoAddress && input.lineItems.length > 0) {
        const platformHash = await ctx.stateReader.getPlatformHash(ctx.contractAddress);
        if (platformHash === null) {
          issues.push(
            createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read platform hash for line item type validation.", {
              fieldPath: "lineItems",
            }),
          );
        } else {
          issues.push(
            ...(await checkLineItemTypes(ctx.stateReader, infoAddress, platformHash, input.lineItems, codes.PAYMENT_UNKNOWN_LINE_ITEM_TYPE, "lineItems")),
          );
        }
      }

      // Check duplicate paymentId
      const paymentData = await ctx.stateReader.getPaymentData(ctx.contractAddress, input.paymentId);
      if (paymentData === null) {
        issues.push(
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read payment data for duplicate check.", {
            fieldPath: "paymentId",
          }),
        );
      } else if (paymentData.amount > 0n) {
        issues.push(
          createIssue(codes.PAYMENT_DUPLICATE_PAYMENT_ID, "error", `Payment with id ${input.paymentId} already exists.`, {
            fieldPath: "paymentId",
            suggestion: "Use a unique payment ID.",
          }),
        );
      }

      // ERC20 balance/allowance check for buyerAddress
      issues.push(
        ...(await checkErc20BalanceAndAllowance(
          ctx.stateReader,
          input.paymentToken,
          input.buyerAddress,
          ctx.contractAddress,
          input.amount,
          "buyerAddress",
        )),
      );

      return issues;
    },
  ],

  normalize: (input) => normalizeAddresses({ ...input }, ["buyerAddress", "paymentToken"]),
};

// ─── cancelPayment ────────────────────────────────────────────────────────────

/** Input shape for PaymentTreasury.cancelPayment preflight. */
export interface CancelPaymentInput {
  paymentId: Hex;
}

/**
 * Preflight validator for PaymentTreasury.cancelPayment.
 */
export const cancelPaymentValidator: MethodValidator<CancelPaymentInput> = {
  structural: [
    (input) => checkZeroBytes32(input.paymentId, "paymentId", codes.PAYMENT_ZERO_PAYMENT_ID),
  ],

  semantic: [],

  stateful: [
    async (input, ctx) => {
      const issues: PreflightIssue[] = [];

      const paymentData = await ctx.stateReader.getPaymentData(ctx.contractAddress, input.paymentId);
      if (paymentData === null) {
        issues.push(
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read payment data from on-chain state.", {
            fieldPath: "paymentId",
          }),
        );
        return issues;
      }

      if (paymentData.amount === 0n) {
        issues.push(
          createIssue(codes.PAYMENT_NOT_FOUND, "error", `Payment ${input.paymentId} does not exist.`, {
            fieldPath: "paymentId",
            suggestion: "Ensure the payment has been created before cancelling.",
          }),
        );
        return issues;
      }

      if (paymentData.isConfirmed) {
        issues.push(
          createIssue(codes.PAYMENT_ALREADY_CONFIRMED, "error", `Payment ${input.paymentId} is already confirmed and cannot be cancelled.`, {
            fieldPath: "paymentId",
          }),
        );
      }

      const now = await ctx.stateReader.getBlockTimestamp();
      if (now === null) {
        issues.push(
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read block timestamp for expiration check.", {
            fieldPath: "paymentId",
          }),
        );
      } else if (paymentData.expiration > 0n && paymentData.expiration <= now) {
        issues.push(
          createIssue(codes.PAYMENT_ALREADY_EXPIRED, "error", `Payment ${input.paymentId} has already expired.`, {
            fieldPath: "paymentId",
            suggestion: "Expired payments cannot be cancelled.",
          }),
        );
      }

      return issues;
    },
  ],
};

// ─── PaymentTreasury Settlement validators ────────────────────────────────────

/** Input shape for PaymentTreasury.withdraw preflight. */
export type PtWithdrawInput = Record<string, never>;

/** Input shape for PaymentTreasury.claimRefund preflight. */
export interface PtClaimRefundInput {
  paymentId: Hex;
  refundAddress: Address;
}

/** Input shape for PaymentTreasury.claimRefundSelf preflight. */
export interface PtClaimRefundSelfInput {
  paymentId: Hex;
}

/** Input shape for PaymentTreasury.claimExpiredFunds preflight. */
export type PtClaimExpiredFundsInput = Record<string, never>;

/** Input shape for PaymentTreasury.disburseFees preflight. */
export type PtDisburseFeesInput = Record<string, never>;

/** Input shape for PaymentTreasury.claimNonGoalLineItems preflight. */
export interface PtClaimNonGoalLineItemsInput {
  token: Address;
}

/**
 * Preflight validator for PaymentTreasury.withdraw.
 * Lightweight — defers most logic to simulation.
 */
export const ptWithdrawValidator: MethodValidator<PtWithdrawInput> = {
  structural: [],
  semantic: [],
  stateful: [
    async (_input, ctx) => {
      const infoAddress = ctx.addresses.infoAddress;
      if (!infoAddress) return [];
      return checkCampaignEnded(ctx.stateReader, infoAddress, codes.SETTLEMENT_CAMPAIGN_STILL_ACTIVE);
    },
  ],
};

/**
 * Preflight validator for PaymentTreasury.claimRefund.
 */
export const ptClaimRefundValidator: MethodValidator<PtClaimRefundInput> = {
  structural: [
    (input, ctx) => [
      ...checkZeroBytes32(input.paymentId, "paymentId", codes.PAYMENT_ZERO_PAYMENT_ID),
      ...checkZeroAddress(input.refundAddress, "refundAddress", codes.COMMON_ZERO_ADDRESS),
      ...checkAddressChecksum(input, ["refundAddress"], ctx.options.mode === "normalize"),
    ],
  ],
  semantic: [],
  stateful: [
    async (input, ctx) => {
      const issues: PreflightIssue[] = [];
      const paymentData = await ctx.stateReader.getPaymentData(ctx.contractAddress, input.paymentId);
      if (paymentData === null) {
        issues.push(
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read payment data from on-chain state.", {
            fieldPath: "paymentId",
          }),
        );
        return issues;
      }
      if (paymentData.amount === 0n) {
        issues.push(
          createIssue(codes.PAYMENT_NOT_FOUND, "error", `Payment ${input.paymentId} does not exist.`, {
            fieldPath: "paymentId",
          }),
        );
        return issues;
      }
      if (!paymentData.isConfirmed) {
        issues.push(
          createIssue(codes.PAYMENT_NOT_CONFIRMED, "error", `Payment ${input.paymentId} has not been confirmed yet.`, {
            fieldPath: "paymentId",
            suggestion: "Only confirmed payments are eligible for refund.",
          }),
        );
      }

      const now = await ctx.stateReader.getBlockTimestamp();
      if (paymentData.expiration > 0n && now === null) {
        issues.push(
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read block timestamp to verify refund claimability window.", {
            fieldPath: "paymentId",
          }),
        );
      }
      if (now !== null && paymentData.expiration > 0n && paymentData.expiration > now) {
        issues.push(
          createIssue(codes.PAYMENT_NOT_CLAIMABLE, "error", `Payment ${input.paymentId} has not reached its claim window yet.`, {
            fieldPath: "paymentId",
            suggestion: "Wait until the payment expiration has passed before claiming a refund.",
          }),
        );
      }

      return issues;
    },
  ],
  normalize: (input) => normalizeAddresses({ ...input }, ["refundAddress"]),
};

/**
 * Preflight validator for PaymentTreasury.claimRefundSelf.
 */
export const ptClaimRefundSelfValidator: MethodValidator<PtClaimRefundSelfInput> = {
  structural: [
    (input) => checkZeroBytes32(input.paymentId, "paymentId", codes.PAYMENT_ZERO_PAYMENT_ID),
  ],
  semantic: [],
  stateful: [
    async (input, ctx) => {
      const issues: PreflightIssue[] = [];
      const paymentData = await ctx.stateReader.getPaymentData(ctx.contractAddress, input.paymentId);
      if (paymentData === null) {
        issues.push(
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read payment data from on-chain state.", {
            fieldPath: "paymentId",
          }),
        );
        return issues;
      }
      if (paymentData.amount === 0n) {
        issues.push(
          createIssue(codes.PAYMENT_NOT_FOUND, "error", `Payment ${input.paymentId} does not exist.`, {
            fieldPath: "paymentId",
          }),
        );
        return issues;
      }
      if (!paymentData.isConfirmed) {
        issues.push(
          createIssue(codes.PAYMENT_NOT_CONFIRMED, "error", `Payment ${input.paymentId} has not been confirmed yet.`, {
            fieldPath: "paymentId",
            suggestion: "Only confirmed payments are eligible for refund.",
          }),
        );
      }

      const now = await ctx.stateReader.getBlockTimestamp();
      if (paymentData.expiration > 0n && now === null) {
        issues.push(
          createIssue(codes.COMMON_STATE_UNAVAILABLE, "warn", "Could not read block timestamp to verify refund claimability window.", {
            fieldPath: "paymentId",
          }),
        );
      }
      if (now !== null && paymentData.expiration > 0n && paymentData.expiration > now) {
        issues.push(
          createIssue(codes.PAYMENT_NOT_CLAIMABLE, "error", `Payment ${input.paymentId} has not reached its claim window yet.`, {
            fieldPath: "paymentId",
            suggestion: "Wait until the payment expiration has passed before claiming a refund.",
          }),
        );
      }

      return issues;
    },
  ],
};

/**
 * Preflight validator for PaymentTreasury.claimExpiredFunds.
 * Lightweight — defers to simulation.
 */
export const ptClaimExpiredFundsValidator: MethodValidator<PtClaimExpiredFundsInput> = {
  structural: [],
  semantic: [],
  stateful: [],
};

/**
 * Preflight validator for PaymentTreasury.disburseFees.
 * Lightweight — defers to simulation.
 */
export const ptDisburseFeesValidator: MethodValidator<PtDisburseFeesInput> = {
  structural: [],
  semantic: [],
  stateful: [],
};

/**
 * Preflight validator for PaymentTreasury.claimNonGoalLineItems.
 */
export const ptClaimNonGoalLineItemsValidator: MethodValidator<PtClaimNonGoalLineItemsInput> = {
  structural: [
    (input, ctx) => [
      ...checkZeroAddress(input.token, "token", codes.COMMON_ZERO_ADDRESS),
      ...checkAddressChecksum(input, ["token"], ctx.options.mode === "normalize"),
    ],
  ],
  semantic: [],
  stateful: [],
  normalize: (input) => normalizeAddresses({ ...input }, ["token"]),
};

// ─── Safe descriptors ─────────────────────────────────────────────────────────

/** Safe method descriptor for PaymentTreasury.createPayment. */
export const createPaymentDescriptor: SafeMethodDescriptor<CreatePaymentInput> = {
  validator: createPaymentValidator,
  abi: PAYMENT_TREASURY_ABI,
  functionName: "createPayment",
  toArgs: (input) => [
    input.paymentId, input.buyerId, input.itemId, input.paymentToken,
    input.amount, input.expiration,
    [...input.lineItems] as { typeId: Hex; amount: bigint }[],
    [...input.externalFees] as { feeType: Hex; feeAmount: bigint }[],
  ],
};

/** Safe method descriptor for PaymentTreasury.createPaymentBatch. */
export const createPaymentBatchDescriptor: SafeMethodDescriptor<CreatePaymentBatchInput> = {
  validator: createPaymentBatchValidator,
  abi: PAYMENT_TREASURY_ABI,
  functionName: "createPaymentBatch",
  toArgs: (input) => [
    [...input.paymentIds], [...input.buyerIds], [...input.itemIds],
    [...input.paymentTokens], [...input.amounts], [...input.expirations],
    input.lineItemsArray.map((li) => [...li]) as { typeId: Hex; amount: bigint }[][],
    input.externalFeesArray.map((ef) => [...ef]) as { feeType: Hex; feeAmount: bigint }[][],
  ],
};

/** Safe method descriptor for PaymentTreasury.confirmPayment. */
export const confirmPaymentDescriptor: SafeMethodDescriptor<ConfirmPaymentInput> = {
  validator: confirmPaymentValidator,
  abi: PAYMENT_TREASURY_ABI,
  functionName: "confirmPayment",
  toArgs: (input) => [input.paymentId, input.buyerAddress],
};

/** Safe method descriptor for PaymentTreasury.confirmPaymentBatch. */
export const confirmPaymentBatchDescriptor: SafeMethodDescriptor<ConfirmPaymentBatchInput> = {
  validator: confirmPaymentBatchValidator,
  abi: PAYMENT_TREASURY_ABI,
  functionName: "confirmPaymentBatch",
  toArgs: (input) => [[...input.paymentIds], [...input.buyerAddresses]],
};

/** Safe method descriptor for PaymentTreasury.processCryptoPayment. */
export const processCryptoPaymentDescriptor: SafeMethodDescriptor<ProcessCryptoPaymentInput> = {
  validator: processCryptoPaymentValidator,
  abi: PAYMENT_TREASURY_ABI,
  functionName: "processCryptoPayment",
  toArgs: (input) => [
    input.paymentId, input.itemId, input.buyerAddress, input.paymentToken, input.amount,
    [...input.lineItems] as { typeId: Hex; amount: bigint }[],
    [...input.externalFees] as { feeType: Hex; feeAmount: bigint }[],
  ],
};

/** Safe method descriptor for PaymentTreasury.cancelPayment. */
export const cancelPaymentDescriptor: SafeMethodDescriptor<CancelPaymentInput> = {
  validator: cancelPaymentValidator,
  abi: PAYMENT_TREASURY_ABI,
  functionName: "cancelPayment",
  toArgs: (input) => [input.paymentId],
};

/** Safe method descriptor for PaymentTreasury.withdraw. */
export const ptWithdrawDescriptor: SafeMethodDescriptor<PtWithdrawInput> = {
  validator: ptWithdrawValidator,
  abi: PAYMENT_TREASURY_ABI,
  functionName: "withdraw",
  toArgs: () => [],
};

/** Safe method descriptor for PaymentTreasury.claimRefund. */
export const ptClaimRefundDescriptor: SafeMethodDescriptor<PtClaimRefundInput> = {
  validator: ptClaimRefundValidator,
  abi: PAYMENT_TREASURY_ABI,
  functionName: "claimRefund",
  toArgs: (input) => [input.paymentId, input.refundAddress],
};

/** Safe method descriptor for PaymentTreasury.claimRefundSelf. */
export const ptClaimRefundSelfDescriptor: SafeMethodDescriptor<PtClaimRefundSelfInput> = {
  validator: ptClaimRefundSelfValidator,
  abi: PAYMENT_TREASURY_ABI,
  functionName: "claimRefund",
  toArgs: (input) => [input.paymentId],
};

/** Safe method descriptor for PaymentTreasury.claimExpiredFunds. */
export const ptClaimExpiredFundsDescriptor: SafeMethodDescriptor<PtClaimExpiredFundsInput> = {
  validator: ptClaimExpiredFundsValidator,
  abi: PAYMENT_TREASURY_ABI,
  functionName: "claimExpiredFunds",
  toArgs: () => [],
};

/** Safe method descriptor for PaymentTreasury.disburseFees. */
export const ptDisburseFeesDescriptor: SafeMethodDescriptor<PtDisburseFeesInput> = {
  validator: ptDisburseFeesValidator,
  abi: PAYMENT_TREASURY_ABI,
  functionName: "disburseFees",
  toArgs: () => [],
};

/** Safe method descriptor for PaymentTreasury.claimNonGoalLineItems. */
export const ptClaimNonGoalLineItemsDescriptor: SafeMethodDescriptor<PtClaimNonGoalLineItemsInput> = {
  validator: ptClaimNonGoalLineItemsValidator,
  abi: PAYMENT_TREASURY_ABI,
  functionName: "claimNonGoalLineItems",
  toArgs: (input) => [input.token],
};
