import {
  createPaymentValidator,
  createPaymentBatchValidator,
  confirmPaymentValidator,
  processCryptoPaymentValidator,
} from "../../../src/preflight/validators/payment-treasury";
import { runPreflight } from "../../../src/preflight/pipeline";
import type { PreflightContext, StateReader } from "../../../src/preflight/types";
import type { Address, Hex, PublicClient } from "viem";
import { BYTES32_ZERO } from "../../../src/constants";
import type { CreatePaymentInput, ConfirmPaymentInput, ProcessCryptoPaymentInput } from "../../../src/preflight/validators/payment-treasury";

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
      expect(result.issues.some((i) => i.code === "OAK-PF-PAYMENT-ZERO_PAYMENT_ID")).toBe(true);
    }
  });

  it("should fail on zero paymentToken", async () => {
    const input = validCreatePaymentInput();
    input.paymentToken = ZERO_ADDR;
    const result = await runPreflight(input, createPaymentValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === "OAK-PF-PAYMENT-ZERO_TOKEN")).toBe(true);
    }
  });

  it("should fail on zero amount", async () => {
    const input = validCreatePaymentInput();
    input.amount = 0n;
    const result = await runPreflight(input, createPaymentValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === "OAK-PF-PAYMENT-ZERO_AMOUNT")).toBe(true);
    }
  });

  it("should fail on zero line item amount", async () => {
    const input = validCreatePaymentInput();
    input.lineItems = [{ typeId: VALID_HASH, amount: 0n }];
    const result = await runPreflight(input, createPaymentValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === "OAK-PF-PAYMENT-ZERO_LINE_ITEM_AMOUNT")).toBe(true);
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
      expect(result.issues.some((i) => i.code === "OAK-PF-COMMON-ARRAY_LENGTH_MISMATCH")).toBe(true);
    }
  });

  it("should warn on large batch", async () => {
    const n = 51;
    const result = await runPreflight(
      {
        paymentIds: Array(n).fill(VALID_HASH),
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
      expect(result.warnings.some((w) => w.code === "OAK-PF-PAYMENT-BATCH_TOO_LARGE")).toBe(true);
    }
  });
});

describe("confirmPaymentValidator - structural", () => {
  it("should fail on zero paymentId", async () => {
    const input: ConfirmPaymentInput = { paymentId: BYTES32_ZERO as Hex, buyerAddress: VALID_ADDR };
    const result = await runPreflight(input, confirmPaymentValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === "OAK-PF-PAYMENT-ZERO_PAYMENT_ID")).toBe(true);
    }
  });

  it("should fail on zero buyerAddress", async () => {
    const input: ConfirmPaymentInput = { paymentId: VALID_HASH, buyerAddress: ZERO_ADDR };
    const result = await runPreflight(input, confirmPaymentValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === "OAK-PF-PAYMENT-ZERO_BUYER_ADDRESS")).toBe(true);
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
      expect(result.issues.some((i) => i.code === "OAK-PF-PAYMENT-ZERO_BUYER_ADDRESS")).toBe(true);
    }
  });
});
