import {
  kwrPledgeForARewardValidator,
  kwrPledgeWithoutARewardValidator,
  setFeeAndPledgeValidator,
  kwrClaimRefundValidator,
  kwrClaimTipValidator,
  kwrClaimFundValidator,
  kwrDisburseFeesValidator,
} from "../../../src/preflight/validators/keep-whats-raised";
import { runPreflight } from "../../../src/preflight/pipeline";
import type { PreflightContext, StateReader } from "../../../src/preflight/types";
import type { Address, Hex, PublicClient } from "viem";
import { BYTES32_ZERO } from "../../../src/constants";
import * as codes from "../../../src/preflight/issue-codes";
import type {
  SetFeeAndPledgeInput,
  KwrPledgeForARewardInput,
  KwrPledgeWithoutARewardInput,
} from "../../../src/preflight/validators/keep-whats-raised";

const VALID_ADDR = "0x1234567890abcdef1234567890abcdef12345678" as Address;
const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as Address;
const VALID_HASH = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as Hex;
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
      getWithdrawalApprovalStatus: jest.fn().mockResolvedValue(true),
      ...stateReaderOverrides,
    } as unknown as StateReader,
  });
}

// ─── setFeeAndPledgeValidator ────────────────────────────────────────────────

function validSetFeeAndPledge(): SetFeeAndPledgeInput {
  return {
    pledgeId: VALID_HASH,
    backer: VALID_ADDR,
    pledgeToken: VALID_ADDR,
    pledgeAmount: 1000n,
    tip: 100n,
    fee: 50n,
    reward: [VALID_HASH],
    isPledgeForAReward: true,
  };
}

describe("setFeeAndPledgeValidator - structural", () => {
  it("should pass with valid input", async () => {
    const result = await runPreflight(validSetFeeAndPledge(), setFeeAndPledgeValidator, createCtx());
    expect(result.ok).toBe(true);
  });

  it("should fail on zero pledgeId", async () => {
    const input = validSetFeeAndPledge();
    input.pledgeId = BYTES32_ZERO as Hex;
    const result = await runPreflight(input, setFeeAndPledgeValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.KWR_ZERO_PLEDGE_ID)).toBe(true);
    }
  });

  it("should fail on zero backer", async () => {
    const input = validSetFeeAndPledge();
    input.backer = ZERO_ADDR;
    const result = await runPreflight(input, setFeeAndPledgeValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.KWR_ZERO_BACKER)).toBe(true);
    }
  });

  it("should fail when isPledgeForAReward is true but reward is empty", async () => {
    const input = validSetFeeAndPledge();
    input.reward = [];
    const result = await runPreflight(input, setFeeAndPledgeValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.KWR_EMPTY_REWARD_NAMES)).toBe(true);
    }
  });

  it("should pass when isPledgeForAReward is false with empty reward", async () => {
    const input = validSetFeeAndPledge();
    input.isPledgeForAReward = false;
    input.reward = [];
    const result = await runPreflight(input, setFeeAndPledgeValidator, createCtx());
    expect(result.ok).toBe(true);
  });
});

describe("setFeeAndPledgeValidator - semantic", () => {
  it("should warn when all amounts are zero", async () => {
    const input = validSetFeeAndPledge();
    input.pledgeAmount = 0n;
    input.tip = 0n;
    input.fee = 0n;
    const result = await runPreflight(input, setFeeAndPledgeValidator, createCtx());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === codes.KWR_ZERO_PLEDGE_AMOUNT_AND_FEE)).toBe(true);
    }
  });

  it("should not warn when at least one amount is non-zero", async () => {
    const input = validSetFeeAndPledge();
    input.pledgeAmount = 0n;
    input.tip = 0n;
    input.fee = 50n;
    const result = await runPreflight(input, setFeeAndPledgeValidator, createCtx());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === codes.KWR_ZERO_PLEDGE_AMOUNT_AND_FEE)).toBe(false);
    }
  });
});

describe("setFeeAndPledgeValidator - stateful", () => {
  it("should fail when token is not accepted", async () => {
    const ctx = createStatefulCtx({ isTokenAccepted: jest.fn().mockResolvedValue(false) });
    const result = await runPreflight(validSetFeeAndPledge(), setFeeAndPledgeValidator, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.KWR_UNACCEPTED_TOKEN)).toBe(true);
    }
  });

  it("should fail when campaign has not started", async () => {
    const ctx = createStatefulCtx({
      getLaunchTime: jest.fn().mockResolvedValue(200n),
      getBlockTimestamp: jest.fn().mockResolvedValue(100n),
    });
    const result = await runPreflight(validSetFeeAndPledge(), setFeeAndPledgeValidator, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.KWR_CAMPAIGN_NOT_STARTED)).toBe(true);
    }
  });

  it("should check reward validity when isPledgeForAReward", async () => {
    const ctx = createStatefulCtx({
      getReward: jest.fn().mockResolvedValue({ rewardValue: 0n, isRewardTier: false }),
    });
    const result = await runPreflight(validSetFeeAndPledge(), setFeeAndPledgeValidator, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.KWR_UNKNOWN_REWARD)).toBe(true);
    }
  });

  it("should skip reward validity when not isPledgeForAReward", async () => {
    const input = validSetFeeAndPledge();
    input.isPledgeForAReward = false;
    input.reward = [];
    const ctx = createStatefulCtx();
    const result = await runPreflight(input, setFeeAndPledgeValidator, ctx);
    expect(result.ok).toBe(true);
  });

  it("should check ERC20 balance/allowance for total (pledgeAmount + tip + fee)", async () => {
    const ctx = createStatefulCtx({
      erc20BalanceOf: jest.fn().mockResolvedValue(500n),
    });
    const input = validSetFeeAndPledge();
    input.pledgeAmount = 1000n;
    input.tip = 100n;
    input.fee = 50n;
    const result = await runPreflight(input, setFeeAndPledgeValidator, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.COMMON_ERC20_INSUFFICIENT_BALANCE)).toBe(true);
    }
  });
});

describe("setFeeAndPledgeValidator - normalize", () => {
  it("should normalize addresses in normalize mode", async () => {
    const input = validSetFeeAndPledge();
    input.backer = "0x1234567890abcdef1234567890abcdef12345678" as Address;
    const ctx = createCtx({ options: { mode: "normalize", stateful: "local-only", collect: true, blockTag: "latest" } });
    const result = await runPreflight(input, setFeeAndPledgeValidator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.normalized.backer).toBeDefined();
    }
  });
});

// ─── kwrPledgeForARewardValidator ────────────────────────────────────────────

describe("kwrPledgeForARewardValidator - structural", () => {
  function validInput(): KwrPledgeForARewardInput {
    return {
      pledgeId: VALID_HASH,
      backer: VALID_ADDR,
      pledgeToken: VALID_ADDR,
      tip: 100n,
      rewardNames: [VALID_HASH],
    };
  }

  it("should pass with valid input", async () => {
    const result = await runPreflight(validInput(), kwrPledgeForARewardValidator, createCtx());
    expect(result.ok).toBe(true);
  });

  it("should fail on zero pledgeId", async () => {
    const input = validInput();
    input.pledgeId = BYTES32_ZERO as Hex;
    const result = await runPreflight(input, kwrPledgeForARewardValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.KWR_ZERO_PLEDGE_ID)).toBe(true);
    }
  });

  it("should fail on empty rewardNames", async () => {
    const input = validInput();
    input.rewardNames = [];
    const result = await runPreflight(input, kwrPledgeForARewardValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.KWR_EMPTY_REWARD_NAMES)).toBe(true);
    }
  });
});

// ─── kwrPledgeWithoutARewardValidator ────────────────────────────────────────

describe("kwrPledgeWithoutARewardValidator - structural", () => {
  function validInput(): KwrPledgeWithoutARewardInput {
    return {
      pledgeId: VALID_HASH,
      backer: VALID_ADDR,
      pledgeToken: VALID_ADDR,
      pledgeAmount: 1000n,
      tip: 100n,
    };
  }

  it("should pass with valid input", async () => {
    const result = await runPreflight(validInput(), kwrPledgeWithoutARewardValidator, createCtx());
    expect(result.ok).toBe(true);
  });

  it("should fail on zero pledgeAmount", async () => {
    const input = validInput();
    input.pledgeAmount = 0n;
    const result = await runPreflight(input, kwrPledgeWithoutARewardValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.KWR_ZERO_PLEDGE_AMOUNT)).toBe(true);
    }
  });
});

// ─── KWR Settlement validators ──────────────────────────────────────────────

describe("kwrClaimRefundValidator - stateful", () => {
  it("should warn when treasury is paused", async () => {
    const ctx = createStatefulCtx({ getPaused: jest.fn().mockResolvedValue(true) });
    const result = await runPreflight({ tokenId: 1n }, kwrClaimRefundValidator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === codes.SETTLEMENT_TREASURY_PAUSED)).toBe(true);
    }
  });

  it("should pass when treasury is not paused", async () => {
    const ctx = createStatefulCtx({ getPaused: jest.fn().mockResolvedValue(false) });
    const result = await runPreflight({ tokenId: 1n }, kwrClaimRefundValidator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings).toHaveLength(0);
    }
  });
});

describe("kwrClaimTipValidator - stateful", () => {
  it("should warn when treasury is paused", async () => {
    const ctx = createStatefulCtx({ getPaused: jest.fn().mockResolvedValue(true) });
    const result = await runPreflight({} as Record<string, never>, kwrClaimTipValidator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === codes.SETTLEMENT_TREASURY_PAUSED)).toBe(true);
    }
  });

  it("should warn when campaign has not ended", async () => {
    const ctx = createStatefulCtx({
      getPaused: jest.fn().mockResolvedValue(false),
      getDeadline: jest.fn().mockResolvedValue(200n),
      getBlockTimestamp: jest.fn().mockResolvedValue(150n),
    });
    const result = await runPreflight({} as Record<string, never>, kwrClaimTipValidator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === codes.SETTLEMENT_CAMPAIGN_STILL_ACTIVE)).toBe(true);
    }
  });
});

describe("kwrClaimFundValidator - stateful", () => {
  it("should warn when treasury is paused", async () => {
    const ctx = createStatefulCtx({ getPaused: jest.fn().mockResolvedValue(true) });
    const result = await runPreflight({} as Record<string, never>, kwrClaimFundValidator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === codes.SETTLEMENT_TREASURY_PAUSED)).toBe(true);
    }
  });

  it("should fail when withdrawal is not approved", async () => {
    const ctx = createStatefulCtx({
      getPaused: jest.fn().mockResolvedValue(false),
      getDeadline: jest.fn().mockResolvedValue(100n),
      getBlockTimestamp: jest.fn().mockResolvedValue(200n),
      getWithdrawalApprovalStatus: jest.fn().mockResolvedValue(false),
    });
    const result = await runPreflight({} as Record<string, never>, kwrClaimFundValidator, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.SETTLEMENT_WITHDRAWAL_NOT_APPROVED)).toBe(true);
      expect(result.issues.find((i) => i.code === codes.SETTLEMENT_WITHDRAWAL_NOT_APPROVED)!.severity).toBe("error");
    }
  });

  it("should pass when withdrawal is approved and campaign ended", async () => {
    const ctx = createStatefulCtx({
      getPaused: jest.fn().mockResolvedValue(false),
      getDeadline: jest.fn().mockResolvedValue(100n),
      getBlockTimestamp: jest.fn().mockResolvedValue(200n),
      getWithdrawalApprovalStatus: jest.fn().mockResolvedValue(true),
    });
    const result = await runPreflight({} as Record<string, never>, kwrClaimFundValidator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings).toHaveLength(0);
    }
  });

  it("should warn when withdrawal approval status is unavailable", async () => {
    const ctx = createStatefulCtx({
      getPaused: jest.fn().mockResolvedValue(false),
      getDeadline: jest.fn().mockResolvedValue(100n),
      getBlockTimestamp: jest.fn().mockResolvedValue(200n),
      getWithdrawalApprovalStatus: jest.fn().mockResolvedValue(null),
    });
    const result = await runPreflight({} as Record<string, never>, kwrClaimFundValidator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === codes.COMMON_STATE_UNAVAILABLE)).toBe(true);
    }
  });
});

describe("kwrDisburseFeesValidator - stateful", () => {
  it("should warn when treasury is paused", async () => {
    const ctx = createStatefulCtx({ getPaused: jest.fn().mockResolvedValue(true) });
    const result = await runPreflight({} as Record<string, never>, kwrDisburseFeesValidator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === codes.SETTLEMENT_TREASURY_PAUSED)).toBe(true);
    }
  });
});
