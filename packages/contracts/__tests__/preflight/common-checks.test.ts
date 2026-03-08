import {
  checkZeroAddress,
  checkZeroBytes32,
  checkArrayLengthParity,
  checkDuplicates,
  checkCampaignWindow,
  checkRewardItemArrayParity,
  checkCampaignEnded,
  checkTreasuryPaused,
} from "../../src/preflight/common/checks";
import { BYTES32_ZERO } from "../../src/constants";
import * as codes from "../../src/preflight/issue-codes";
import type { StateReader } from "../../src/preflight/types";
import type { TieredReward } from "../../src/types";
import type { Address, Hex } from "viem";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as Address;
const VALID_ADDR = "0x1234567890abcdef1234567890abcdef12345678" as Address;

describe("checkZeroAddress", () => {
  it("should return an error for the zero address", () => {
    const issues = checkZeroAddress(ZERO_ADDR, "creator");
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe(codes.COMMON_ZERO_ADDRESS);
    expect(issues[0].severity).toBe("error");
    expect(issues[0].fieldPath).toBe("creator");
  });

  it("should return empty for a valid address", () => {
    const issues = checkZeroAddress(VALID_ADDR, "creator");
    expect(issues).toHaveLength(0);
  });

  it("should use custom code when provided", () => {
    const issues = checkZeroAddress(ZERO_ADDR, "backer", codes.AON_ZERO_BACKER);
    expect(issues[0].code).toBe(codes.AON_ZERO_BACKER);
  });
});

describe("checkZeroBytes32", () => {
  it("should return an error for zero bytes32", () => {
    const issues = checkZeroBytes32(BYTES32_ZERO as Hex, "identifierHash");
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe(codes.COMMON_ZERO_BYTES32);
    expect(issues[0].severity).toBe("error");
  });

  it("should return empty for non-zero bytes32", () => {
    const validHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as Hex;
    const issues = checkZeroBytes32(validHash, "paymentId");
    expect(issues).toHaveLength(0);
  });
});

describe("checkArrayLengthParity", () => {
  it("should return an error when arrays differ in length", () => {
    const issues = checkArrayLengthParity([1, 2, 3], [1, 2], "keys", "values");
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("error");
    expect(issues[0].message).toContain("length 3");
    expect(issues[0].message).toContain("length 2");
  });

  it("should return empty when arrays match", () => {
    const issues = checkArrayLengthParity([1, 2], [3, 4], "keys", "values");
    expect(issues).toHaveLength(0);
  });
});

describe("checkDuplicates", () => {
  it("should detect duplicate hex values (case-insensitive)", () => {
    const values = [
      "0xaabb" as Hex,
      "0xccdd" as Hex,
      "0xAABB" as Hex,
    ];
    const issues = checkDuplicates(values, "platforms", codes.CAMPAIGN_DUPLICATE_PLATFORM_HASH, "warn");
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("warn");
    expect(issues[0].fieldPath).toBe("platforms[2]");
  });

  it("should return empty when no duplicates", () => {
    const values = ["0xaabb" as Hex, "0xccdd" as Hex];
    const issues = checkDuplicates(values, "arr", "CODE");
    expect(issues).toHaveLength(0);
  });
});

describe("checkCampaignWindow", () => {
  it("should return error when campaign not started", () => {
    const issues = checkCampaignWindow(100n, 200n, 50n, "NOT_STARTED", "ENDED");
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe("NOT_STARTED");
    expect(issues[0].severity).toBe("error");
  });

  it("should return error when campaign ended", () => {
    const issues = checkCampaignWindow(100n, 200n, 250n, "NOT_STARTED", "ENDED");
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe("ENDED");
  });

  it("should return empty when within window", () => {
    const issues = checkCampaignWindow(100n, 200n, 150n, "NOT_STARTED", "ENDED");
    expect(issues).toHaveLength(0);
  });

  it("should return empty at exact boundary times", () => {
    const atLaunch = checkCampaignWindow(100n, 200n, 100n, "NOT_STARTED", "ENDED");
    expect(atLaunch).toHaveLength(0);

    const atDeadline = checkCampaignWindow(100n, 200n, 200n, "NOT_STARTED", "ENDED");
    expect(atDeadline).toHaveLength(0);
  });
});

const VALID_HASH = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as Hex;
const VALID_HASH_2 = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as Hex;
const TREASURY_ADDR = "0x0000000000000000000000000000000000000001" as Address;
const INFO_ADDR = "0x0000000000000000000000000000000000000002" as Address;

describe("checkRewardItemArrayParity", () => {
  it("should return empty when all item arrays match", () => {
    const rewards: TieredReward[] = [{
      rewardValue: 100n,
      isRewardTier: true,
      itemId: [VALID_HASH],
      itemValue: [50n],
      itemQuantity: [1n],
    }];
    const issues = checkRewardItemArrayParity(rewards, "rewards");
    expect(issues).toHaveLength(0);
  });

  it("should return error when itemValue length mismatches itemId", () => {
    const rewards: TieredReward[] = [{
      rewardValue: 100n,
      isRewardTier: true,
      itemId: [VALID_HASH, VALID_HASH_2],
      itemValue: [50n],
      itemQuantity: [1n, 2n],
    }];
    const issues = checkRewardItemArrayParity(rewards, "rewards");
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe(codes.REWARD_ITEM_ARRAY_MISMATCH);
    expect(issues[0].severity).toBe("error");
    expect(issues[0].fieldPath).toBe("rewards[0]");
  });

  it("should return error when itemQuantity length mismatches itemId", () => {
    const rewards: TieredReward[] = [{
      rewardValue: 100n,
      isRewardTier: true,
      itemId: [VALID_HASH],
      itemValue: [50n],
      itemQuantity: [1n, 2n],
    }];
    const issues = checkRewardItemArrayParity(rewards, "rewards");
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe(codes.REWARD_ITEM_ARRAY_MISMATCH);
  });

  it("should return empty when all item arrays are empty", () => {
    const rewards: TieredReward[] = [{
      rewardValue: 100n,
      isRewardTier: true,
      itemId: [],
      itemValue: [],
      itemQuantity: [],
    }];
    const issues = checkRewardItemArrayParity(rewards, "rewards");
    expect(issues).toHaveLength(0);
  });

  it("should report errors for each mismatched reward", () => {
    const rewards: TieredReward[] = [
      { rewardValue: 100n, isRewardTier: true, itemId: [VALID_HASH], itemValue: [], itemQuantity: [1n] },
      { rewardValue: 200n, isRewardTier: false, itemId: [VALID_HASH], itemValue: [50n], itemQuantity: [] },
    ];
    const issues = checkRewardItemArrayParity(rewards, "rewards");
    expect(issues).toHaveLength(2);
    expect(issues[0].fieldPath).toBe("rewards[0]");
    expect(issues[1].fieldPath).toBe("rewards[1]");
  });
});

describe("checkCampaignEnded", () => {
  it("should warn when campaign has not ended", async () => {
    const stateReader = {
      getDeadline: jest.fn().mockResolvedValue(200n),
      getBlockTimestamp: jest.fn().mockResolvedValue(150n),
    } as unknown as StateReader;
    const issues = await checkCampaignEnded(stateReader, INFO_ADDR, "STILL_ACTIVE");
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe("STILL_ACTIVE");
    expect(issues[0].severity).toBe("warn");
  });

  it("should warn at exact deadline (now === deadline)", async () => {
    const stateReader = {
      getDeadline: jest.fn().mockResolvedValue(200n),
      getBlockTimestamp: jest.fn().mockResolvedValue(200n),
    } as unknown as StateReader;
    const issues = await checkCampaignEnded(stateReader, INFO_ADDR, "STILL_ACTIVE");
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe("STILL_ACTIVE");
  });

  it("should return empty when campaign has ended (now > deadline)", async () => {
    const stateReader = {
      getDeadline: jest.fn().mockResolvedValue(200n),
      getBlockTimestamp: jest.fn().mockResolvedValue(201n),
    } as unknown as StateReader;
    const issues = await checkCampaignEnded(stateReader, INFO_ADDR, "STILL_ACTIVE");
    expect(issues).toHaveLength(0);
  });

  it("should warn when state is unavailable", async () => {
    const stateReader = {
      getDeadline: jest.fn().mockResolvedValue(null),
      getBlockTimestamp: jest.fn().mockResolvedValue(150n),
    } as unknown as StateReader;
    const issues = await checkCampaignEnded(stateReader, INFO_ADDR, "STILL_ACTIVE");
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe(codes.COMMON_STATE_UNAVAILABLE);
  });
});

describe("checkTreasuryPaused", () => {
  it("should warn when treasury is paused", async () => {
    const stateReader = {
      getPaused: jest.fn().mockResolvedValue(true),
    } as unknown as StateReader;
    const issues = await checkTreasuryPaused(stateReader, TREASURY_ADDR, "PAUSED");
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe("PAUSED");
    expect(issues[0].severity).toBe("warn");
  });

  it("should return empty when treasury is not paused", async () => {
    const stateReader = {
      getPaused: jest.fn().mockResolvedValue(false),
    } as unknown as StateReader;
    const issues = await checkTreasuryPaused(stateReader, TREASURY_ADDR, "PAUSED");
    expect(issues).toHaveLength(0);
  });

  it("should warn when state is unavailable", async () => {
    const stateReader = {
      getPaused: jest.fn().mockResolvedValue(null),
    } as unknown as StateReader;
    const issues = await checkTreasuryPaused(stateReader, TREASURY_ADDR, "PAUSED");
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe(codes.COMMON_STATE_UNAVAILABLE);
  });
});
