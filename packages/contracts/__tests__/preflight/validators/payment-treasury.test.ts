import {
  createPaymentValidator,
  createPaymentBatchValidator,
  confirmPaymentValidator,
  processCryptoPaymentValidator,
  cancelPaymentValidator,
  ptWithdrawValidator,
  ptClaimRefundValidator,
  ptClaimRefundSelfValidator,
  ptClaimExpiredFundsValidator,
  ptDisburseFeesValidator,
  ptClaimNonGoalLineItemsValidator,
} from "../../../src/preflight/validators/payment-treasury";
import { runPreflight } from "../../../src/preflight/pipeline";
import type { PreflightContext, StateReader } from "../../../src/preflight/types";
import type { Address, Hex, PublicClient } from "viem";
import { BYTES32_ZERO } from "../../../src/constants";
import * as codes from "../../../src/preflight/issue-codes";
import type {
  CreatePaymentInput,
  ConfirmPaymentInput,
  ProcessCryptoPaymentInput,
  CancelPaymentInput,
  PtClaimRefundInput,
  PtClaimRefundSelfInput,
  PtClaimNonGoalLineItemsInput,
} from "../../../src/preflight/validators/payment-treasury";

const VALID_ADDR = "0x1234567890abcdef1234567890abcdef12345678" as Address;
const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as Address;
const VALID_HASH = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as Hex;

function createCtx(): PreflightContext {
  return {
    publicClient: {} as PublicClient,
    contractAddress: "0x0000000000000000000000000000000000000001" as Address,
    options: { mode: "warn", stateful: "local-only", collect: true, blockTag: "latest" },
    stateReader: {} as StateReader,
    addresses: {},
  };
}

function validCreatePaymentInput(): CreatePaymentInput {
  return {
    paymentId: VALID_HASH,
    buyerId: VALID_HASH,
    itemId: VALID_HASH,
    paymentToken: VALID_ADDR,
    amount: 1000n,
    expiration: 9999999999n,
    lineItems: [{ typeId: VALID_HASH, amount: 500n }],
    externalFees: [],
  };
}

describe("createPaymentValidator - structural", () => {
  it("should fail on zero paymentId", async () => {
    const input = validCreatePaymentInput();
    input.paymentId = BYTES32_ZERO as Hex;
    const result = await runPreflight(input, createPaymentValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.PAYMENT_ZERO_PAYMENT_ID)).toBe(true);
    }
  });

  it("should fail on zero paymentToken", async () => {
    const input = validCreatePaymentInput();
    input.paymentToken = ZERO_ADDR;
    const result = await runPreflight(input, createPaymentValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.PAYMENT_ZERO_TOKEN)).toBe(true);
    }
  });

  it("should fail on zero amount", async () => {
    const input = validCreatePaymentInput();
    input.amount = 0n;
    const result = await runPreflight(input, createPaymentValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.PAYMENT_ZERO_AMOUNT)).toBe(true);
    }
  });

  it("should fail on zero line item amount", async () => {
    const input = validCreatePaymentInput();
    input.lineItems = [{ typeId: VALID_HASH, amount: 0n }];
    const result = await runPreflight(input, createPaymentValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.PAYMENT_ZERO_LINE_ITEM_AMOUNT)).toBe(true);
    }
  });

  it("should pass with valid input", async () => {
    const result = await runPreflight(validCreatePaymentInput(), createPaymentValidator, createCtx());
    expect(result.ok).toBe(true);
  });
});

describe("createPaymentBatchValidator - structural", () => {
  it("should fail on array length mismatch", async () => {
    const result = await runPreflight(
      {
        paymentIds: [VALID_HASH, VALID_HASH],
        buyerIds: [VALID_HASH],
        itemIds: [VALID_HASH, VALID_HASH],
        paymentTokens: [VALID_ADDR, VALID_ADDR],
        amounts: [100n, 200n],
        expirations: [9999999999n, 9999999999n],
        lineItemsArray: [[{ typeId: VALID_HASH, amount: 100n }], [{ typeId: VALID_HASH, amount: 200n }]],
        externalFeesArray: [[], []],
      },
      createPaymentBatchValidator,
      createCtx(),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.COMMON_ARRAY_LENGTH_MISMATCH)).toBe(true);
    }
  });

  it("should warn on large batch", async () => {
    const n = 51;
    // Generate unique paymentIds to avoid triggering duplicate detection
    const uniqueIds = Array.from({ length: n }, (_, i) =>
      ("0x" + (i + 1).toString(16).padStart(64, "0")) as Hex,
    );
    const result = await runPreflight(
      {
        paymentIds: uniqueIds,
        buyerIds: Array(n).fill(VALID_HASH),
        itemIds: Array(n).fill(VALID_HASH),
        paymentTokens: Array(n).fill(VALID_ADDR),
        amounts: Array(n).fill(100n),
        expirations: Array(n).fill(9999999999n),
        lineItemsArray: Array(n).fill([{ typeId: VALID_HASH, amount: 100n }]),
        externalFeesArray: Array(n).fill([]),
      },
      createPaymentBatchValidator,
      createCtx(),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === codes.PAYMENT_BATCH_TOO_LARGE)).toBe(true);
    }
  });
});

describe("confirmPaymentValidator - structural", () => {
  it("should fail on zero paymentId", async () => {
    const input: ConfirmPaymentInput = { paymentId: BYTES32_ZERO as Hex, buyerAddress: VALID_ADDR };
    const result = await runPreflight(input, confirmPaymentValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.PAYMENT_ZERO_PAYMENT_ID)).toBe(true);
    }
  });

  it("should fail on zero buyerAddress", async () => {
    const input: ConfirmPaymentInput = { paymentId: VALID_HASH, buyerAddress: ZERO_ADDR };
    const result = await runPreflight(input, confirmPaymentValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.PAYMENT_ZERO_BUYER_ADDRESS)).toBe(true);
    }
  });

  it("should pass with valid input", async () => {
    const input: ConfirmPaymentInput = { paymentId: VALID_HASH, buyerAddress: VALID_ADDR };
    const result = await runPreflight(input, confirmPaymentValidator, createCtx());
    expect(result.ok).toBe(true);
  });
});

describe("processCryptoPaymentValidator - structural", () => {
  it("should fail on zero buyerAddress", async () => {
    const input: ProcessCryptoPaymentInput = {
      paymentId: VALID_HASH,
      itemId: VALID_HASH,
      buyerAddress: ZERO_ADDR,
      paymentToken: VALID_ADDR,
      amount: 1000n,
      lineItems: [],
      externalFees: [],
    };
    const result = await runPreflight(input, processCryptoPaymentValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.PAYMENT_ZERO_BUYER_ADDRESS)).toBe(true);
    }
  });
});

// ─── cancelPaymentValidator ──────────────────────────────────────────────────

const CONTRACT_ADDR = "0x0000000000000000000000000000000000000001" as Address;
const INFO_ADDR = "0x0000000000000000000000000000000000000002" as Address;

function createStatefulCtx(stateReaderOverrides: Partial<StateReader> = {}): PreflightContext {
  return {
    publicClient: {} as PublicClient,
    contractAddress: CONTRACT_ADDR,
    options: { mode: "warn", stateful: "enabled", collect: true, blockTag: "latest" },
    stateReader: {
      getBlockTimestamp: jest.fn().mockResolvedValue(150n),
      getDeadline: jest.fn().mockResolvedValue(200n),
      getPaymentData: jest.fn().mockResolvedValue({
        buyerAddress: VALID_ADDR,
        isConfirmed: false,
        expiration: 9999999999n,
        amount: 1000n,
      }),
      ...stateReaderOverrides,
    } as unknown as StateReader,
    addresses: { infoAddress: INFO_ADDR },
  };
}

describe("cancelPaymentValidator - structural", () => {
  it("should pass with valid input", async () => {
    const input: CancelPaymentInput = { paymentId: VALID_HASH };
    const result = await runPreflight(input, cancelPaymentValidator, createCtx());
    expect(result.ok).toBe(true);
  });

  it("should fail on zero paymentId", async () => {
    const input: CancelPaymentInput = { paymentId: BYTES32_ZERO as Hex };
    const result = await runPreflight(input, cancelPaymentValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.PAYMENT_ZERO_PAYMENT_ID)).toBe(true);
    }
  });
});

describe("cancelPaymentValidator - stateful", () => {
  it("should fail when payment not found", async () => {
    const ctx = createStatefulCtx({
      getPaymentData: jest.fn().mockResolvedValue({
        buyerAddress: ZERO_ADDR,
        isConfirmed: false,
        expiration: 0n,
        amount: 0n,
      }),
    });
    const input: CancelPaymentInput = { paymentId: VALID_HASH };
    const result = await runPreflight(input, cancelPaymentValidator, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.PAYMENT_NOT_FOUND)).toBe(true);
    }
  });

  it("should fail when payment already confirmed", async () => {
    const ctx = createStatefulCtx({
      getPaymentData: jest.fn().mockResolvedValue({
        buyerAddress: VALID_ADDR,
        isConfirmed: true,
        expiration: 9999999999n,
        amount: 1000n,
      }),
    });
    const input: CancelPaymentInput = { paymentId: VALID_HASH };
    const result = await runPreflight(input, cancelPaymentValidator, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.PAYMENT_ALREADY_CONFIRMED)).toBe(true);
    }
  });

  it("should fail when payment already expired", async () => {
    const ctx = createStatefulCtx({
      getBlockTimestamp: jest.fn().mockResolvedValue(200n),
      getPaymentData: jest.fn().mockResolvedValue({
        buyerAddress: VALID_ADDR,
        isConfirmed: false,
        expiration: 100n,
        amount: 1000n,
      }),
    });
    const input: CancelPaymentInput = { paymentId: VALID_HASH };
    const result = await runPreflight(input, cancelPaymentValidator, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.PAYMENT_ALREADY_EXPIRED)).toBe(true);
    }
  });

  it("should pass when payment is valid and cancellable", async () => {
    const ctx = createStatefulCtx();
    const input: CancelPaymentInput = { paymentId: VALID_HASH };
    const result = await runPreflight(input, cancelPaymentValidator, ctx);
    expect(result.ok).toBe(true);
  });

  it("should warn when payment data is unavailable", async () => {
    const ctx = createStatefulCtx({
      getPaymentData: jest.fn().mockResolvedValue(null),
    });
    const input: CancelPaymentInput = { paymentId: VALID_HASH };
    const result = await runPreflight(input, cancelPaymentValidator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === codes.COMMON_STATE_UNAVAILABLE)).toBe(true);
    }
  });
});

// ─── PT Settlement validators ────────────────────────────────────────────────

describe("ptWithdrawValidator - stateful", () => {
  it("should error when campaign has not ended", async () => {
    const ctx = createStatefulCtx({
      getDeadline: jest.fn().mockResolvedValue(200n),
      getBlockTimestamp: jest.fn().mockResolvedValue(150n),
    });
    const result = await runPreflight({} as Record<string, never>, ptWithdrawValidator, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((w) => w.code === codes.SETTLEMENT_CAMPAIGN_STILL_ACTIVE)).toBe(true);
    }
  });

  it("should pass cleanly when campaign has ended", async () => {
    const ctx = createStatefulCtx({
      getDeadline: jest.fn().mockResolvedValue(100n),
      getBlockTimestamp: jest.fn().mockResolvedValue(200n),
    });
    const result = await runPreflight({} as Record<string, never>, ptWithdrawValidator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings).toHaveLength(0);
    }
  });
});

describe("ptClaimRefundValidator - structural", () => {
  it("should fail on zero paymentId", async () => {
    const input: PtClaimRefundInput = { paymentId: BYTES32_ZERO as Hex, refundAddress: VALID_ADDR };
    const result = await runPreflight(input, ptClaimRefundValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.PAYMENT_ZERO_PAYMENT_ID)).toBe(true);
    }
  });

  it("should fail on zero refundAddress", async () => {
    const input: PtClaimRefundInput = { paymentId: VALID_HASH, refundAddress: ZERO_ADDR };
    const result = await runPreflight(input, ptClaimRefundValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.COMMON_ZERO_ADDRESS)).toBe(true);
    }
  });

  it("should pass with valid input", async () => {
    const input: PtClaimRefundInput = { paymentId: VALID_HASH, refundAddress: VALID_ADDR };
    const result = await runPreflight(input, ptClaimRefundValidator, createCtx());
    expect(result.ok).toBe(true);
  });
});

describe("ptClaimRefundValidator - stateful", () => {
  it("should fail when payment not found", async () => {
    const ctx = createStatefulCtx({
      getPaymentData: jest.fn().mockResolvedValue({
        buyerAddress: ZERO_ADDR,
        isConfirmed: false,
        expiration: 0n,
        amount: 0n,
      }),
    });
    const input: PtClaimRefundInput = { paymentId: VALID_HASH, refundAddress: VALID_ADDR };
    const result = await runPreflight(input, ptClaimRefundValidator, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.PAYMENT_NOT_FOUND)).toBe(true);
    }
  });

  it("should warn when timestamp is unavailable and claimability cannot be verified", async () => {
    const ctx = createStatefulCtx({
      getPaymentData: jest.fn().mockResolvedValue({
        buyerAddress: VALID_ADDR,
        isConfirmed: true,
        expiration: 200n,
        amount: 100n,
      }),
      getBlockTimestamp: jest.fn().mockResolvedValue(null),
    });
    const input: PtClaimRefundInput = { paymentId: VALID_HASH, refundAddress: VALID_ADDR };
    const result = await runPreflight(input, ptClaimRefundValidator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === codes.COMMON_STATE_UNAVAILABLE)).toBe(true);
    }
  });
});

describe("ptClaimRefundSelfValidator - structural", () => {
  it("should fail on zero paymentId", async () => {
    const input: PtClaimRefundSelfInput = { paymentId: BYTES32_ZERO as Hex };
    const result = await runPreflight(input, ptClaimRefundSelfValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.PAYMENT_ZERO_PAYMENT_ID)).toBe(true);
    }
  });

  it("should pass with valid input", async () => {
    const input: PtClaimRefundSelfInput = { paymentId: VALID_HASH };
    const result = await runPreflight(input, ptClaimRefundSelfValidator, createCtx());
    expect(result.ok).toBe(true);
  });
});

describe("ptClaimRefundSelfValidator - stateful", () => {
  it("should warn when timestamp is unavailable and claimability cannot be verified", async () => {
    const ctx = createStatefulCtx({
      getPaymentData: jest.fn().mockResolvedValue({
        buyerAddress: VALID_ADDR,
        isConfirmed: true,
        expiration: 200n,
        amount: 100n,
      }),
      getBlockTimestamp: jest.fn().mockResolvedValue(null),
    });
    const input: PtClaimRefundSelfInput = { paymentId: VALID_HASH };
    const result = await runPreflight(input, ptClaimRefundSelfValidator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === codes.COMMON_STATE_UNAVAILABLE)).toBe(true);
    }
  });
});

describe("ptClaimExpiredFundsValidator", () => {
  it("should pass (defers to simulation)", async () => {
    const result = await runPreflight({} as Record<string, never>, ptClaimExpiredFundsValidator, createCtx());
    expect(result.ok).toBe(true);
  });
});

describe("ptDisburseFeesValidator", () => {
  it("should pass (defers to simulation)", async () => {
    const result = await runPreflight({} as Record<string, never>, ptDisburseFeesValidator, createCtx());
    expect(result.ok).toBe(true);
  });
});

describe("ptClaimNonGoalLineItemsValidator - structural", () => {
  it("should fail on zero token address", async () => {
    const input: PtClaimNonGoalLineItemsInput = { token: ZERO_ADDR };
    const result = await runPreflight(input, ptClaimNonGoalLineItemsValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.COMMON_ZERO_ADDRESS)).toBe(true);
    }
  });

  it("should pass with valid token", async () => {
    const input: PtClaimNonGoalLineItemsInput = { token: VALID_ADDR };
    const result = await runPreflight(input, ptClaimNonGoalLineItemsValidator, createCtx());
    expect(result.ok).toBe(true);
  });
});
