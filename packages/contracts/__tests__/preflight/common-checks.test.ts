import {
  checkZeroAddress,
  checkZeroBytes32,
  checkArrayLengthParity,
  checkDuplicates,
  checkCampaignWindow,
} from "../../src/preflight/common/checks";
import { BYTES32_ZERO } from "../../src/constants";
import type { Address, Hex } from "viem";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as Address;
const VALID_ADDR = "0x1234567890abcdef1234567890abcdef12345678" as Address;

describe("checkZeroAddress", () => {
  it("should return an error for the zero address", () => {
    const issues = checkZeroAddress(ZERO_ADDR, "creator");
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe("OAK-PF-COMMON-ZERO_ADDRESS");
    expect(issues[0].severity).toBe("error");
    expect(issues[0].fieldPath).toBe("creator");
  });

  it("should return empty for a valid address", () => {
    const issues = checkZeroAddress(VALID_ADDR, "creator");
    expect(issues).toHaveLength(0);
  });

  it("should use custom code when provided", () => {
    const issues = checkZeroAddress(ZERO_ADDR, "backer", "OAK-PF-AON-ZERO_BACKER");
    expect(issues[0].code).toBe("OAK-PF-AON-ZERO_BACKER");
  });
});

describe("checkZeroBytes32", () => {
  it("should return an error for zero bytes32", () => {
    const issues = checkZeroBytes32(BYTES32_ZERO as Hex, "identifierHash");
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe("OAK-PF-COMMON-ZERO_BYTES32");
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
    const issues = checkDuplicates(values, "platforms", "OAK-PF-CAMPAIGN-DUPLICATE_PLATFORM_HASH", "warn");
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
