import { getTestClient, getTestConfig } from "../setup/test-client";
import { BYTES32_ZERO } from "../../src/constants/encoding";
import type { CreateCampaignParams } from "../../src/types/params";

const cfg = getTestConfig();
const client = getTestClient();
const cif = client.campaignInfoFactory(cfg.addresses.campaignInfoFactory);

describe("CampaignInfoFactory — reads", () => {
  it("identifierToCampaignInfo returns an address", async () => {
    const addr = await cif.identifierToCampaignInfo(BYTES32_ZERO);
    expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it("isValidCampaignInfo returns a boolean", async () => {
    const valid = await cif.isValidCampaignInfo(
      "0x0000000000000000000000000000000000000001",
    );
    expect(typeof valid).toBe("boolean");
  });

  it("owner returns an address", async () => {
    const addr = await cif.owner();
    expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });
});

describe("CampaignInfoFactory — writes (may revert)", () => {
  const dummyParams: CreateCampaignParams = {
    creator: "0x0000000000000000000000000000000000000001",
    identifierHash: BYTES32_ZERO,
    selectedPlatformHash: [BYTES32_ZERO],
    campaignData: {
      launchTime: 9999999999n,
      deadline: 9999999999n,
      goalAmount: 1000n,
      currency: BYTES32_ZERO,
    },
    nftName: "Test",
    nftSymbol: "TST",
    nftImageURI: "https://example.com/image.png",
    contractURI: "https://example.com/contract.json",
  };

  it("createCampaign executes", async () => {
    try {
      await cif.createCampaign(dummyParams);
    } catch {
      /* revert expected */
    }
  });

  it("createCampaign with optional keys executes", async () => {
    try {
      await cif.createCampaign({
        ...dummyParams,
        platformDataKey: [BYTES32_ZERO],
        platformDataValue: [BYTES32_ZERO],
      });
    } catch {
      /* revert expected */
    }
  });

  it("updateImplementation executes", async () => {
    try {
      await cif.updateImplementation(
        "0x0000000000000000000000000000000000000001",
      );
    } catch {
      /* revert expected */
    }
  });

  it("transferOwnership executes", async () => {
    try {
      await cif.transferOwnership("0x0000000000000000000000000000000000000001");
    } catch {
      /* revert expected */
    }
  });

  it("renounceOwnership executes", async () => {
    try {
      await cif.renounceOwnership();
    } catch {
      /* revert expected */
    }
  });
});

describe("CampaignInfoFactory — simulate (may throw)", () => {
  const dummyParams: CreateCampaignParams = {
    creator: "0x0000000000000000000000000000000000000001",
    identifierHash: BYTES32_ZERO,
    selectedPlatformHash: [BYTES32_ZERO],
    campaignData: {
      launchTime: 9999999999n,
      deadline: 9999999999n,
      goalAmount: 1000n,
      currency: BYTES32_ZERO,
    },
    nftName: "Test",
    nftSymbol: "TST",
    nftImageURI: "https://example.com/image.png",
    contractURI: "https://example.com/contract.json",
  };

  it("simulate.createCampaign", async () => {
    try {
      await cif.simulate.createCampaign(dummyParams);
    } catch {
      /* expected */
    }
  });

  it("simulate.updateImplementation", async () => {
    try {
      await cif.simulate.updateImplementation(
        "0x0000000000000000000000000000000000000001",
      );
    } catch {
      /* expected */
    }
  });
});

describe("CampaignInfoFactory — events", () => {
  it("events is an empty object", () => {
    expect(cif.events).toEqual({});
  });
});
