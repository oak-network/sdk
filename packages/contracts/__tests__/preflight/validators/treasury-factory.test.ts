import { runPreflight } from "../../../src/preflight/pipeline";
import * as codes from "../../../src/preflight/issue-codes";
import type { PreflightContext, StateReader } from "../../../src/preflight/types";
import { deployValidator, type DeployInput } from "../../../src/preflight/validators/treasury-factory";
import { BYTES32_ZERO } from "../../../src/constants";
import type { Address, Hex, PublicClient } from "viem";

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

function validDeployInput(): DeployInput {
  return {
    platformHash: VALID_HASH,
    infoAddress: VALID_ADDR,
    implementationId: 1n,
  };
}

describe("deployValidator - structural", () => {
  it("should fail on zero infoAddress", async () => {
    const result = await runPreflight(
      { ...validDeployInput(), infoAddress: ZERO_ADDR },
      deployValidator,
      createCtx(),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.COMMON_ZERO_ADDRESS)).toBe(true);
    }
  });

  it("should fail on zero platformHash", async () => {
    const result = await runPreflight(
      { ...validDeployInput(), platformHash: BYTES32_ZERO as Hex },
      deployValidator,
      createCtx(),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === codes.COMMON_ZERO_BYTES32)).toBe(true);
    }
  });

  it("should pass with valid input", async () => {
    const result = await runPreflight(validDeployInput(), deployValidator, createCtx());
    expect(result.ok).toBe(true);
  });
});
