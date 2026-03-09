import {
  addRewardsValidator,
  aonPledgeForARewardValidator,
  aonPledgeWithoutARewardValidator,
  aonWithdrawValidator,
  aonClaimRefundValidator,
  aonDisburseFeesValidator,
} from "../../../src/preflight/validators/all-or-nothing";
import { runPreflight } from "../../../src/preflight/pipeline";
import type { PreflightContext, StateReader } from "../../../src/preflight/types";
import type { Address, Hex, PublicClient } from "viem";
import { BYTES32_ZERO } from "../../../src/constants";
import * as codes from "../../../src/preflight/issue-codes";
import type { TieredReward } from "../../../src/types";
import type { AddRewardsInput, AonPledgeForARewardInput, AonPledgeWithoutARewardInput } from "../../../src/preflight/validators/all-or-nothing";

const VALID_ADDR = "0x1234567890abcdef1234567890abcdef12345678" as Address;
const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as Address;
const VALID_HASH = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as Hex;
const VALID_HASH_2 = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as Hex;
const CONTRACT_ADDR = "0x0000000000000000000000000000000000000001" as Address;
const INFO_ADDR = "0x0000000000000000000000000000000000000002" as Address;

function createCtx(overrides?: Partial<PreflightContext>): PreflightContext {
  return {
    publicClient: {} as PublicClient,
    contractAddress: CONTRACT_ADDR,
    options: { mode: "warn", stateful: "local-only", collect: true, blockTag: "latest" },
    stateReader: {} as StateReader,
    addresses: {},
    ...overrides,
  };
}

function createStatefulCtx(stateReaderOverrides: Partial<StateReader> = {}): PreflightContext {
  return createCtx({
    options: { mode: "warn", stateful: "enabled", collect: true, blockTag: "latest" },
    addresses: { infoAddress: INFO_ADDR },
    stateReader: {
      getBlockTimestamp: jest.fn().mockResolvedValue(150n),
      getLaunchTime: jest.fn().mockResolvedValue(100n),
      getDeadline: jest.fn().mockResolvedValue(200n),
      isTokenAccepted: jest.fn().mockResolvedValue(true),
      getReward: jest.fn().mockResolvedValue({ rewardValue: 100n, isRewardTier: true }),
      erc20BalanceOf: jest.fn().mockResolvedValue(10000n),
      erc20Allowance: jest.fn().mockResolvedValue(10000n),
      getPaused: jest.fn().mockResolvedValue(false),
      getCancelled: jest.fn().mockResolvedValue(false),
      ...stateReaderOverrides,
    } as unknown as StateReader,
  });
}

function validReward(): TieredReward {
  return {
    rewardValue: 100n,
    isRewardTier: true,
    itemId: [VALID_HASH],
    itemValue: [50n],
    itemQuantity: [1n],
  };
}

function validAddRewardsInput(): AddRewardsInput {
  return {
    rewardNames: [VALID_HASH],
    rewards: [validReward()],
  };
}

// ─── addRewardsValidator ─────────────────────────────────────────────────────

describe("addRewardsValidator - structural", () => {
  it("should pass with valid input", async () => {
    const result = await runPreflight(validAddRewardsInput(), addRewardsValidator, createCtx());
    expect(result.ok).toBe(true);
  });

  it("should fail on array length mismatch", async () => {
    const input = validAddRewardsInput();
    input.rewardNames = [VALID_HASH, VALID_HASH_2];
    const result = await runPreflight(input, addRewardsValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.REWARD_ARRAY_MISMATCH)).toBe(true);
    }
  });

  it("should fail on zero reward name", async () => {
    const input: AddRewardsInput = {
      rewardNames: [BYTES32_ZERO as Hex],
      rewards: [validReward()],
    };
    const result = await runPreflight(input, addRewardsValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.REWARD_ZERO_NAME)).toBe(true);
    }
  });

  it("should fail on zero reward value", async () => {
    const input: AddRewardsInput = {
      rewardNames: [VALID_HASH],
      rewards: [{ ...validReward(), rewardValue: 0n }],
    };
    const result = await runPreflight(input, addRewardsValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.REWARD_ZERO_VALUE)).toBe(true);
    }
  });

  it("should fail on item array length mismatch within reward", async () => {
    const input: AddRewardsInput = {
      rewardNames: [VALID_HASH],
      rewards: [{
        rewardValue: 100n,
        isRewardTier: true,
        itemId: [VALID_HASH, VALID_HASH_2],
        itemValue: [50n],
        itemQuantity: [1n],
      }],
    };
    const result = await runPreflight(input, addRewardsValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.REWARD_ITEM_ARRAY_MISMATCH)).toBe(true);
    }
  });
});

describe("addRewardsValidator - semantic", () => {
  it("should fail on duplicate reward names", async () => {
    const input: AddRewardsInput = {
      rewardNames: [VALID_HASH, VALID_HASH],
      rewards: [validReward(), validReward()],
    };
    const result = await runPreflight(input, addRewardsValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.REWARD_DUPLICATE_NAME)).toBe(true);
      expect(result.issues.find((i) => i.code === codes.REWARD_DUPLICATE_NAME)!.severity).toBe("error");
    }
  });
});

describe("addRewardsValidator - stateful", () => {
  it("should fail when reward already exists on-chain", async () => {
    const ctx = createStatefulCtx({
      getReward: jest.fn().mockResolvedValue({ rewardValue: 500n, isRewardTier: true }),
    });
    const result = await runPreflight(validAddRewardsInput(), addRewardsValidator, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.REWARD_ALREADY_EXISTS)).toBe(true);
    }
  });

  it("should pass when reward does not exist on-chain", async () => {
    const ctx = createStatefulCtx({
      getReward: jest.fn().mockResolvedValue({ rewardValue: 0n, isRewardTier: false }),
    });
    const result = await runPreflight(validAddRewardsInput(), addRewardsValidator, ctx);
    expect(result.ok).toBe(true);
  });

  it("should warn when state is unavailable", async () => {
    const ctx = createStatefulCtx({
      getReward: jest.fn().mockResolvedValue(null),
    });
    const result = await runPreflight(validAddRewardsInput(), addRewardsValidator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === codes.COMMON_STATE_UNAVAILABLE)).toBe(true);
    }
  });
});

// ─── aonPledgeForARewardValidator ────────────────────────────────────────────

describe("aonPledgeForARewardValidator - structural", () => {
  function validInput(): AonPledgeForARewardInput {
    return {
      backer: VALID_ADDR,
      pledgeToken: VALID_ADDR,
      shippingFee: 10n,
      rewardNames: [VALID_HASH],
    };
  }

  it("should pass with valid input", async () => {
    const result = await runPreflight(validInput(), aonPledgeForARewardValidator, createCtx());
    expect(result.ok).toBe(true);
  });

  it("should fail on zero backer", async () => {
    const input = validInput();
    input.backer = ZERO_ADDR;
    const result = await runPreflight(input, aonPledgeForARewardValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.AON_ZERO_BACKER)).toBe(true);
    }
  });

  it("should fail on zero pledgeToken", async () => {
    const input = validInput();
    input.pledgeToken = ZERO_ADDR;
    const result = await runPreflight(input, aonPledgeForARewardValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.COMMON_ZERO_ADDRESS)).toBe(true);
    }
  });

  it("should fail on empty rewardNames", async () => {
    const input = validInput();
    input.rewardNames = [];
    const result = await runPreflight(input, aonPledgeForARewardValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.AON_EMPTY_REWARD_NAMES)).toBe(true);
    }
  });
});

// ─── aonPledgeWithoutARewardValidator ────────────────────────────────────────

describe("aonPledgeWithoutARewardValidator - structural", () => {
  function validInput(): AonPledgeWithoutARewardInput {
    return {
      backer: VALID_ADDR,
      pledgeToken: VALID_ADDR,
      pledgeAmount: 1000n,
    };
  }

  it("should pass with valid input", async () => {
    const result = await runPreflight(validInput(), aonPledgeWithoutARewardValidator, createCtx());
    expect(result.ok).toBe(true);
  });

  it("should fail on zero backer", async () => {
    const input = validInput();
    input.backer = ZERO_ADDR;
    const result = await runPreflight(input, aonPledgeWithoutARewardValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.AON_ZERO_BACKER)).toBe(true);
    }
  });

  it("should fail on zero pledgeToken", async () => {
    const input = validInput();
    input.pledgeToken = ZERO_ADDR;
    const result = await runPreflight(input, aonPledgeWithoutARewardValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.COMMON_ZERO_ADDRESS)).toBe(true);
    }
  });

  it("should fail on zero pledgeAmount", async () => {
    const input = validInput();
    input.pledgeAmount = 0n;
    const result = await runPreflight(input, aonPledgeWithoutARewardValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.AON_ZERO_PLEDGE_AMOUNT)).toBe(true);
    }
  });
});

// ─── AON Settlement validators ───────────────────────────────────────────────

describe("aonWithdrawValidator - stateful", () => {
  it("should error when treasury is paused", async () => {
    const ctx = createStatefulCtx({ getPaused: jest.fn().mockResolvedValue(true) });
    const result = await runPreflight({} as Record<string, never>, aonWithdrawValidator, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((w) => w.code === codes.SETTLEMENT_TREASURY_PAUSED)).toBe(true);
    }
  });

  it("should error when campaign has not ended", async () => {
    const ctx = createStatefulCtx({
      getPaused: jest.fn().mockResolvedValue(false),
      getDeadline: jest.fn().mockResolvedValue(200n),
      getBlockTimestamp: jest.fn().mockResolvedValue(150n),
    });
    const result = await runPreflight({} as Record<string, never>, aonWithdrawValidator, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((w) => w.code === codes.SETTLEMENT_CAMPAIGN_STILL_ACTIVE)).toBe(true);
    }
  });

  it("should pass cleanly when treasury is not paused and campaign ended", async () => {
    const ctx = createStatefulCtx({
      getPaused: jest.fn().mockResolvedValue(false),
      getDeadline: jest.fn().mockResolvedValue(100n),
      getBlockTimestamp: jest.fn().mockResolvedValue(200n),
    });
    const result = await runPreflight({} as Record<string, never>, aonWithdrawValidator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings).toHaveLength(0);
    }
  });
});

describe("aonClaimRefundValidator - stateful", () => {
  it("should error when treasury is paused", async () => {
    const ctx = createStatefulCtx({ getPaused: jest.fn().mockResolvedValue(true) });
    const result = await runPreflight({ tokenId: 1n }, aonClaimRefundValidator, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((w) => w.code === codes.SETTLEMENT_TREASURY_PAUSED)).toBe(true);
    }
  });

  it("should pass when treasury is not paused", async () => {
    const ctx = createStatefulCtx({ getPaused: jest.fn().mockResolvedValue(false) });
    const result = await runPreflight({ tokenId: 1n }, aonClaimRefundValidator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings).toHaveLength(0);
    }
  });
});

describe("aonDisburseFeesValidator - stateful", () => {
  it("should error when treasury is paused", async () => {
    const ctx = createStatefulCtx({ getPaused: jest.fn().mockResolvedValue(true) });
    const result = await runPreflight({} as Record<string, never>, aonDisburseFeesValidator, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((w) => w.code === codes.SETTLEMENT_TREASURY_PAUSED)).toBe(true);
    }
  });
});
