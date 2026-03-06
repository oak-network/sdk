import type { Address, Hex } from "viem";
import { BYTES32_ZERO, DATA_REGISTRY_KEYS } from "../../constants/index.js";
import type { LineItem, ExternalFees } from "../../types/index.js";
import { createIssue } from "../issue.js";
import * as codes from "../issue-codes.js";
import {
  checkZeroAddress,
  checkZeroBytes32,
  checkArrayLengthParity,
  checkTokenAccepted,
  checkErc20BalanceAndAllowance,
  checkLineItemTypes,
} from "../common/checks.js";
import { normalizeAddresses } from "../normalizers.js";
import type { MethodValidator, PreflightContext, PreflightIssue } from "../types.js";

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

  if (input.amount === 0n) {
    issues.push(
      createIssue(codes.PAYMENT_ZERO_AMOUNT, "error", `${p}amount must not be zero.`, {
        fieldPath: `${p}amount`,
        suggestion: "Provide a non-zero payment amount.",
      }),
    );
  }

  for (let i = 0; i < input.lineItems.length; i++) {
    if (input.lineItems[i].amount === 0n) {
      issues.push(
        createIssue(
          codes.PAYMENT_ZERO_LINE_ITEM_AMOUNT,
          "error",
          `${p}lineItems[${i}].amount must not be zero.`,
          { fieldPath: `${p}lineItems[${i}].amount`, suggestion: "Set a non-zero amount for each line item." },
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
  structural: [(input) => checkCreatePaymentStructural(input)],
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
      if (input.paymentIds.length > BATCH_WARN_THRESHOLD) {
        return [
          createIssue(
            codes.PAYMENT_BATCH_TOO_LARGE,
            "warn",
            `Batch size (${input.paymentIds.length}) exceeds recommended limit of ${BATCH_WARN_THRESHOLD}.`,
            { suggestion: "Consider splitting into smaller batches to avoid gas limits." },
          ),
        ];
      }
      return [];
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
    (input) => [
      ...checkZeroBytes32(input.paymentId, "paymentId", codes.PAYMENT_ZERO_PAYMENT_ID),
      ...checkZeroAddress(input.buyerAddress, "buyerAddress", codes.PAYMENT_ZERO_BUYER_ADDRESS),
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
    (input) => {
      const issues: PreflightIssue[] = [];
      issues.push(...checkZeroBytes32(input.paymentId, "paymentId", codes.PAYMENT_ZERO_PAYMENT_ID));
      issues.push(...checkZeroBytes32(input.itemId, "itemId", codes.PAYMENT_ZERO_ITEM_ID));
      issues.push(...checkZeroAddress(input.buyerAddress, "buyerAddress", codes.PAYMENT_ZERO_BUYER_ADDRESS));
      issues.push(...checkZeroAddress(input.paymentToken, "paymentToken", codes.PAYMENT_ZERO_TOKEN));

      if (input.amount === 0n) {
        issues.push(
          createIssue(codes.PAYMENT_ZERO_AMOUNT, "error", "amount must not be zero.", {
            fieldPath: "amount",
            suggestion: "Provide a non-zero payment amount.",
          }),
        );
      }

      for (let i = 0; i < input.lineItems.length; i++) {
        if (input.lineItems[i].amount === 0n) {
          issues.push(
            createIssue(
              codes.PAYMENT_ZERO_LINE_ITEM_AMOUNT,
              "error",
              `lineItems[${i}].amount must not be zero.`,
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
