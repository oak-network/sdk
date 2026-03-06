import { createCampaignValidator } from "../../../src/preflight/validators/campaign-info-factory";
import { runPreflight } from "../../../src/preflight/pipeline";
import type { CreateCampaignParams } from "../../../src/types";
import type { PreflightContext, StateReader } from "../../../src/preflight/types";
import type { Address, Hex, PublicClient } from "viem";
import { BYTES32_ZERO } from "../../../src/constants";

const VALID_ADDR = "0x1234567890abcdef1234567890abcdef12345678" as Address;
const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as Address;
const VALID_HASH = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as Hex;
const CURRENCY = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Hex;

function validParams(): CreateCampaignParams {
  return {
    creator: VALID_ADDR,
    identifierHash: VALID_HASH,
    selectedPlatformHash: [VALID_HASH],
    campaignData: {
      launchTime: 1000000n,
      deadline: 2000000n,
      goalAmount: 100n,
      currency: CURRENCY,
    },
    nftName: "Test",
    nftSymbol: "TST",
    nftImageURI: "https://example.com/img.png",
    contractURI: "https://example.com/contract",
  };
}

function createCtx(overrides?: Partial<PreflightContext>): PreflightContext {
  return {
    publicClient: {} as PublicClient,
    contractAddress: "0x0000000000000000000000000000000000000001" as Address,
    options: {
      mode: "warn",
      stateful: "local-only",
      collect: true,
      blockTag: "latest",
    },
    stateReader: {} as StateReader,
    addresses: {},
    ...overrides,
  };
}

describe("createCampaignValidator - structural", () => {
  it("should fail on zero creator address", async () => {
    const params = validParams();
    params.creator = ZERO_ADDR;
    const result = await runPreflight(params, createCampaignValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === "OAK-PF-COMMON-ZERO_ADDRESS")).toBe(true);
    }
  });

  it("should fail on platform data key/value length mismatch", async () => {
    const params = validParams();
    params.platformDataKey = [VALID_HASH, VALID_HASH];
    params.platformDataValue = [VALID_HASH];
    const result = await runPreflight(params, createCampaignValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === "OAK-PF-CAMPAIGN-PLATFORM_DATA_LENGTH_MISMATCH")).toBe(true);
    }
  });

  it("should fail on zero platform data value", async () => {
    const params = validParams();
    params.platformDataKey = [VALID_HASH];
    params.platformDataValue = [BYTES32_ZERO as Hex];
    const result = await runPreflight(params, createCampaignValidator, createCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.code === "OAK-PF-CAMPAIGN-ZERO_PLATFORM_DATA_VALUE")).toBe(true);
    }
  });

  it("should pass with valid params", async () => {
    const result = await runPreflight(validParams(), createCampaignValidator, createCtx());
    expect(result.ok).toBe(true);
  });
});

describe("createCampaignValidator - semantic", () => {
  it("should warn on duplicate selectedPlatformHash", async () => {
    const params = validParams();
    params.selectedPlatformHash = [VALID_HASH, VALID_HASH];
    const result = await runPreflight(params, createCampaignValidator, createCtx());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === "OAK-PF-CAMPAIGN-DUPLICATE_PLATFORM_HASH")).toBe(true);
    }
  });

  it("should warn on zero goalAmount", async () => {
    const params = validParams();
    params.campaignData.goalAmount = 0n;
    const result = await runPreflight(params, createCampaignValidator, createCtx());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === "OAK-PF-CAMPAIGN-ZERO_GOAL_AMOUNT")).toBe(true);
    }
  });
});

describe("createCampaignValidator - normalize", () => {
  it("should checksum creator in normalize mode", async () => {
    const params = validParams();
    params.creator = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045" as Address;
    const ctx = createCtx({
      options: { mode: "normalize", stateful: "local-only", collect: true, blockTag: "latest" },
    });
    const result = await runPreflight(params, createCampaignValidator, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.normalized.creator).toBe("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
    }
  });
});
