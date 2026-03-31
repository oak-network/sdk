import { requireAccount, requireSigner } from "../../src/utils/account";
import { getChainFromId } from "../../src/utils/chain";
import { keccak256, id } from "../../src/utils/hash";
import { isHex, toHex } from "../../src/utils/hex";
import { getCurrentTimestamp, addDays } from "../../src/utils/time";
import type { WalletClient } from "../../src/lib";

describe("requireSigner", () => {
  it("returns the walletClient when non-null", () => {
    const wallet = { account: { address: "0x1234" } } as unknown as WalletClient;
    expect(requireSigner(wallet)).toBe(wallet);
  });

  it("throws when walletClient is null", () => {
    expect(() => requireSigner(null)).toThrow("No signer configured");
  });
});

describe("requireAccount", () => {
  it("returns the account when present", () => {
    const account = { address: "0x1234" };
    const walletClient = { account } as unknown as WalletClient;
    expect(requireAccount(walletClient)).toBe(account);
  });

  it("throws when account is undefined", () => {
    const walletClient = {} as unknown as WalletClient;
    expect(() => requireAccount(walletClient)).toThrow(
      "WalletClient has no account attached",
    );
  });
});

describe("getChainFromId", () => {
  it.each([
    [1, "Ethereum"],
    [42220, "Celo"],
    [11155111, "Sepolia"],
    [5, "Goerli"],
    [11142220, "Celo Sepolia"],
  ])("returns predefined chain for id %d", (chainId, expectedName) => {
    const chain = getChainFromId(chainId);
    expect(chain.id).toBe(chainId);
    expect(chain.name).toContain(expectedName);
  });

  it("returns a fallback chain for unknown ids", () => {
    const chain = getChainFromId(999999);
    expect(chain.id).toBe(999999);
    expect(chain.name).toBe("Chain 999999");
  });
});

describe("keccak256", () => {
  it("hashes a plain string via stringToHex", () => {
    const hash = keccak256("hello");
    expect(hash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("hashes a 0x-prefixed hex string directly", () => {
    const hash = keccak256("0xdeadbeef");
    expect(hash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("hashes a Uint8Array", () => {
    const hash = keccak256(new Uint8Array([1, 2, 3]));
    expect(hash).toMatch(/^0x[0-9a-f]{64}$/);
  });
});

describe("id", () => {
  it("returns a keccak256 hash of a UTF-8 string", () => {
    const hash = id("bufferTime");
    expect(hash).toMatch(/^0x[0-9a-f]{64}$/);
  });
});

describe("isHex", () => {
  it("returns true for valid hex strings", () => {
    expect(isHex("0x")).toBe(true);
    expect(isHex("0xabcdef0123456789")).toBe(true);
    expect(isHex("0xABCDEF")).toBe(true);
  });

  it("returns false for strings without 0x prefix", () => {
    expect(isHex("abcdef")).toBe(false);
  });

  it("returns false for strings with invalid hex chars", () => {
    expect(isHex("0xZZZZ")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isHex("")).toBe(false);
  });
});

describe("toHex", () => {
  it("encodes a number", () => {
    expect(toHex(255)).toMatch(/^0x/);
  });

  it("encodes a bigint", () => {
    expect(toHex(123n)).toMatch(/^0x/);
  });

  it("encodes a boolean", () => {
    expect(toHex(true)).toMatch(/^0x/);
  });

  it("encodes a Uint8Array", () => {
    expect(toHex(new Uint8Array([0xab, 0xcd]))).toBe("0xabcd");
  });

  it("encodes a string", () => {
    expect(toHex("hi")).toMatch(/^0x/);
  });

  it("accepts size option", () => {
    const hex = toHex(1, { size: 32 });
    expect(hex.length).toBe(66); // 0x + 64 hex chars
  });
});

describe("getCurrentTimestamp", () => {
  it("returns a bigint close to current time in seconds", () => {
    const ts = getCurrentTimestamp();
    const now = BigInt(Math.floor(Date.now() / 1000));
    expect(ts).toBeGreaterThanOrEqual(now - 2n);
    expect(ts).toBeLessThanOrEqual(now + 2n);
  });
});

describe("addDays", () => {
  it("adds correct number of seconds", () => {
    const base = 1000000n;
    expect(addDays(base, 1)).toBe(base + 86400n);
    expect(addDays(base, 7)).toBe(base + 604800n);
    expect(addDays(base, 0)).toBe(base);
  });
});
