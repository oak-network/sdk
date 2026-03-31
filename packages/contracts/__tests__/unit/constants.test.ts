import { CHAIN_IDS } from "../../src/constants/chains";
import { BPS_DENOMINATOR } from "../../src/constants/fees";
import { BYTES32_ZERO } from "../../src/constants/encoding";
import { DATA_REGISTRY_KEYS, scopedToPlatform } from "../../src/constants/registry";

describe("CHAIN_IDS", () => {
  it("has correct values", () => {
    expect(CHAIN_IDS.ETHEREUM_MAINNET).toBe(1);
    expect(CHAIN_IDS.CELO_MAINNET).toBe(42220);
    expect(CHAIN_IDS.ETHEREUM_TESTNET_SEPOLIA).toBe(11155111);
    expect(CHAIN_IDS.ETHEREUM_TESTNET_GOERLI).toBe(5);
    expect(CHAIN_IDS.CELO_TESTNET_SEPOLIA).toBe(11142220);
  });
});

describe("BPS_DENOMINATOR", () => {
  it("equals 10_000n", () => {
    expect(BPS_DENOMINATOR).toBe(10_000n);
  });
});

describe("BYTES32_ZERO", () => {
  it("is 66 characters (0x + 64 hex zeros)", () => {
    expect(BYTES32_ZERO).toMatch(/^0x0{64}$/);
    expect(BYTES32_ZERO.length).toBe(66);
  });
});

describe("DATA_REGISTRY_KEYS", () => {
  it("has 4 keys, each a valid keccak256 hash", () => {
    const keys = Object.keys(DATA_REGISTRY_KEYS);
    expect(keys).toEqual([
      "BUFFER_TIME",
      "MAX_PAYMENT_EXPIRATION",
      "CAMPAIGN_LAUNCH_BUFFER",
      "MINIMUM_CAMPAIGN_DURATION",
    ]);
    for (const key of keys) {
      const value = DATA_REGISTRY_KEYS[key as keyof typeof DATA_REGISTRY_KEYS];
      expect(value).toMatch(/^0x[0-9a-f]{64}$/);
    }
  });
});

describe("scopedToPlatform", () => {
  it("returns a deterministic bytes32 hash", () => {
    const baseKey = DATA_REGISTRY_KEYS.BUFFER_TIME;
    const platformHash = BYTES32_ZERO;
    const result = scopedToPlatform(baseKey, platformHash);
    expect(result).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("returns different results for different platform hashes", () => {
    const baseKey = DATA_REGISTRY_KEYS.BUFFER_TIME;
    const a = scopedToPlatform(baseKey, BYTES32_ZERO);
    const b = scopedToPlatform(
      baseKey,
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    );
    expect(a).not.toBe(b);
  });
});
