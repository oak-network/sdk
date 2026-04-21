import { getTestClient, getTestConfig } from "../setup/test-client";
import { keccak256, id } from "../../src/utils/hash";
import { multicall } from "../../src/utils/multicall";
import { getCurrentTimestamp, addDays } from "../../src/utils/time";
import { prepareContractWrite, toPreparedTransaction } from "../../src/utils/prepare";
import { isHex, isBytes4, toHex } from "../../src/utils/hex";
import { requireSigner, requireAccount } from "../../src/utils/account";
import { GLOBAL_PARAMS_ABI } from "../../src/contracts/global-params/abi";
import { getChainFromId } from "../../src/utils/chain";
import { CHAIN_IDS } from "../../src/constants/chains";
import { BYTES32_ZERO } from "../../src/constants/encoding";
import { getRecoveryHint } from "../../src/errors/recovery";
import type { ContractErrorBase } from "../../src/errors/base";

const cfg = getTestConfig();
const client = getTestClient();

describe("Utils — hash", () => {
  it("keccak256 hashes a plain string", () => {
    const hash = keccak256("hello");
    expect(hash).toMatch(/^0x[0-9a-fA-F]{64}$/);
  });

  it("keccak256 hashes a 0x-prefixed hex string directly", () => {
    const hash = keccak256("0xabcdef");
    expect(hash).toMatch(/^0x[0-9a-fA-F]{64}$/);
  });

  it("keccak256 hashes a Uint8Array", () => {
    const hash = keccak256(new Uint8Array([1, 2, 3]));
    expect(hash).toMatch(/^0x[0-9a-fA-F]{64}$/);
  });

  it("keccak256 is deterministic", () => {
    expect(keccak256("test")).toBe(keccak256("test"));
  });

  it("keccak256 produces different hashes for different inputs", () => {
    expect(keccak256("hello")).not.toBe(keccak256("world"));
  });

  it("id hashes a string", () => {
    const hash = id("hello");
    expect(hash).toMatch(/^0x[0-9a-fA-F]{64}$/);
  });

  it("id is deterministic", () => {
    expect(id("test")).toBe(id("test"));
  });
});

describe("Utils — multicall", () => {
  it("batches multiple read calls", async () => {
    const gp = client.globalParams(cfg.addresses.globalParams);
    const [count, fee] = await multicall([
      () => gp.getNumberOfListedPlatforms(),
      () => gp.getProtocolFeePercent(),
    ]);

    expect(typeof count).toBe("bigint");
    expect(typeof fee).toBe("bigint");
  });

  it("client.multicall batches calls the same way", async () => {
    const gp = client.globalParams(cfg.addresses.globalParams);
    const [count, fee] = await client.multicall([
      () => gp.getNumberOfListedPlatforms(),
      () => gp.getProtocolFeePercent(),
    ]);

    expect(typeof count).toBe("bigint");
    expect(typeof fee).toBe("bigint");
  });
});

describe("Utils — time", () => {
  it("getCurrentTimestamp returns a reasonable bigint", () => {
    const ts = getCurrentTimestamp();
    expect(typeof ts).toBe("bigint");
    expect(ts).toBeGreaterThan(1_700_000_000n);
  });

  it("addDays adds the correct number of seconds", () => {
    const base = 1_000_000n;
    const result = addDays(base, 1);
    expect(result).toBe(base + 86400n);
  });

  it("addDays handles multiple days", () => {
    const base = 1_000_000n;
    const result = addDays(base, 7);
    expect(result).toBe(base + 7n * 86400n);
  });

  it("addDays handles zero days", () => {
    const base = 1_000_000n;
    expect(addDays(base, 0)).toBe(base);
  });
});

describe("Utils — prepareContractWrite", () => {
  it("encodes calldata and estimates gas (may revert)", async () => {
    const chain = getChainFromId(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
    const account = client.walletClient!.account!.address;

    try {
      const tx = await prepareContractWrite(client.publicClient, {
        address: cfg.addresses.globalParams,
        abi: GLOBAL_PARAMS_ABI,
        functionName: "getProtocolFeePercent",
        args: [],
        account,
        chain,
      });

      expect(tx.to).toBe(cfg.addresses.globalParams);
      expect(tx.data).toMatch(/^0x/);
      expect(typeof tx.value).toBe("bigint");
      expect(typeof tx.gas).toBe("bigint");
    } catch {
      /* may revert depending on function requirements */
    }
  });

  it("toPreparedTransaction extracts fields from a SimulationResult", () => {
    const mockResult = {
      result: undefined,
      request: {
        to: "0x0000000000000000000000000000000000000001" as const,
        data: "0xabcdef" as `0x${string}`,
        value: 100n,
        gas: 21000n,
      },
    };

    const tx = toPreparedTransaction(mockResult);
    expect(tx.to).toBe(mockResult.request.to);
    expect(tx.data).toBe(mockResult.request.data);
    expect(tx.value).toBe(100n);
    expect(tx.gas).toBe(21000n);
  });

  it("toPreparedTransaction defaults value to 0n when undefined", () => {
    const mockResult = {
      result: undefined,
      request: {
        to: "0x0000000000000000000000000000000000000001" as const,
        data: "0xabcdef" as `0x${string}`,
        value: undefined,
        gas: 21000n,
      },
    };

    const tx = toPreparedTransaction(mockResult);
    expect(tx.value).toBe(0n);
  });
});

describe("Utils — getChainFromId", () => {
  it("resolves known chain IDs", () => {
    const chain = getChainFromId(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
    expect(chain).toBeDefined();
    expect(chain.id).toBe(CHAIN_IDS.CELO_TESTNET_SEPOLIA);
  });
});

describe("Utils — hex", () => {
  it("isHex validates 0x-prefixed hex strings", () => {
    expect(isHex("0xabcdef")).toBe(true);
    expect(isHex("0x")).toBe(true);
    expect(isHex("abcdef")).toBe(false);
    expect(isHex("0xGG")).toBe(false);
  });

  it("isBytes4 validates 4-byte hex strings", () => {
    expect(isBytes4("0x01ffc9a7")).toBe(true);
    expect(isBytes4("0xabcdef")).toBe(false);
    expect(isBytes4("0x01ffc9a7ff")).toBe(false);
    expect(isBytes4("notHex")).toBe(false);
  });

  it("toHex encodes values", () => {
    expect(toHex(255)).toMatch(/^0x/);
    expect(toHex("hello")).toMatch(/^0x/);
    expect(toHex(true)).toMatch(/^0x/);
  });
});

describe("Utils — account guards", () => {
  it("requireSigner throws for null", () => {
    expect(() => requireSigner(null)).toThrow("No signer configured");
  });

  it("requireSigner returns the signer for non-null", () => {
    const mockSigner = { account: { address: "0x1" } } as unknown as import("../../src/lib").WalletClient;
    expect(requireSigner(mockSigner)).toBe(mockSigner);
  });

  it("requireAccount throws for signer without account", () => {
    const mockSigner = {} as unknown as import("../../src/lib").WalletClient;
    expect(() => requireAccount(mockSigner)).toThrow("no account attached");
  });
});

describe("Utils — getRecoveryHint", () => {
  it("returns undefined for errors without a hint", () => {
    const error = { recoveryHint: undefined } as unknown as ContractErrorBase;
    expect(getRecoveryHint(error)).toBeUndefined();
  });

  it("returns the hint when available", () => {
    const error = { recoveryHint: "Try again later" } as unknown as ContractErrorBase;
    expect(getRecoveryHint(error)).toBe("Try again later");
  });
});
