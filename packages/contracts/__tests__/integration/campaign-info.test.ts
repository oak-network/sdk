import { getTestClient, getTestConfig } from "../setup/test-client";
import { BYTES32_ZERO } from "../../src/constants/encoding";

const cfg = getTestConfig();
const client = getTestClient();
const ci = client.campaignInfo(cfg.addresses.campaignInfo);
const ZERO_ADDR = "0x0000000000000000000000000000000000000001" as const;

describe("CampaignInfo — reads", () => {
  it("getLaunchTime", async () => {
    expect(typeof (await ci.getLaunchTime())).toBe("bigint");
  });
  it("getDeadline", async () => {
    expect(typeof (await ci.getDeadline())).toBe("bigint");
  });
  it("getGoalAmount", async () => {
    expect(typeof (await ci.getGoalAmount())).toBe("bigint");
  });
  it("getCampaignCurrency", async () => {
    expect(await ci.getCampaignCurrency()).toMatch(/^0x/);
  });
  it("getIdentifierHash", async () => {
    expect(await ci.getIdentifierHash()).toMatch(/^0x/);
  });
  it("checkIfPlatformSelected", async () => {
    expect(typeof (await ci.checkIfPlatformSelected(BYTES32_ZERO))).toBe(
      "boolean",
    );
  });
  it("checkIfPlatformApproved", async () => {
    expect(typeof (await ci.checkIfPlatformApproved(BYTES32_ZERO))).toBe(
      "boolean",
    );
  });
  it("getPlatformAdminAddress", async () => {
    expect(await ci.getPlatformAdminAddress(BYTES32_ZERO)).toMatch(/^0x/);
  });
  it("getPlatformData", async () => {
    expect(await ci.getPlatformData(BYTES32_ZERO)).toMatch(/^0x/);
  });
  it("getPlatformFeePercent", async () => {
    expect(typeof (await ci.getPlatformFeePercent(BYTES32_ZERO))).toBe(
      "bigint",
    );
  });
  it("getPlatformClaimDelay", async () => {
    expect(typeof (await ci.getPlatformClaimDelay(BYTES32_ZERO))).toBe(
      "bigint",
    );
  });
  it("getProtocolAdminAddress", async () => {
    expect(await ci.getProtocolAdminAddress()).toMatch(/^0x/);
  });
  it("getProtocolFeePercent", async () => {
    expect(typeof (await ci.getProtocolFeePercent())).toBe("bigint");
  });
  it("getAcceptedTokens", async () => {
    expect(Array.isArray(await ci.getAcceptedTokens())).toBe(true);
  });
  it("isTokenAccepted", async () => {
    expect(typeof (await ci.isTokenAccepted(ZERO_ADDR))).toBe("boolean");
  });
  it("getTotalRaisedAmount", async () => {
    expect(typeof (await ci.getTotalRaisedAmount())).toBe("bigint");
  });
  it("getTotalLifetimeRaisedAmount", async () => {
    expect(typeof (await ci.getTotalLifetimeRaisedAmount())).toBe("bigint");
  });
  it("getTotalRefundedAmount", async () => {
    expect(typeof (await ci.getTotalRefundedAmount())).toBe("bigint");
  });
  it("getTotalAvailableRaisedAmount", async () => {
    expect(typeof (await ci.getTotalAvailableRaisedAmount())).toBe("bigint");
  });
  it("getTotalCancelledAmount", async () => {
    expect(typeof (await ci.getTotalCancelledAmount())).toBe("bigint");
  });
  it("getTotalExpectedAmount", async () => {
    expect(typeof (await ci.getTotalExpectedAmount())).toBe("bigint");
  });
  it("getDataFromRegistry", async () => {
    expect(await ci.getDataFromRegistry(BYTES32_ZERO)).toMatch(/^0x/);
  });
  it("getBufferTime", async () => {
    expect(typeof (await ci.getBufferTime())).toBe("bigint");
  });
  it("getLineItemType", async () => {
    expect(await ci.getLineItemType(BYTES32_ZERO, BYTES32_ZERO)).toBeDefined();
  });
  it("getCampaignConfig", async () => {
    expect(await ci.getCampaignConfig()).toBeDefined();
  });
  it("getApprovedPlatformHashes", async () => {
    expect(Array.isArray(await ci.getApprovedPlatformHashes())).toBe(true);
  });
  it("isLocked", async () => {
    expect(typeof (await ci.isLocked())).toBe("boolean");
  });
  it("cancelled", async () => {
    expect(typeof (await ci.cancelled())).toBe("boolean");
  });
  it("owner", async () => {
    expect(await ci.owner()).toMatch(/^0x/);
  });
  it("paused", async () => {
    expect(typeof (await ci.paused())).toBe("boolean");
  });
});

describe("CampaignInfo — writes (may revert)", () => {
  it("updateDeadline", async () => {
    try {
      await ci.updateDeadline(9999999999n);
    } catch {
      /* expected */
    }
  });
  it("updateGoalAmount", async () => {
    try {
      await ci.updateGoalAmount(1000n);
    } catch {
      /* expected */
    }
  });
  it("updateLaunchTime", async () => {
    try {
      await ci.updateLaunchTime(9999999999n);
    } catch {
      /* expected */
    }
  });
  it("updateSelectedPlatform", async () => {
    try {
      await ci.updateSelectedPlatform(BYTES32_ZERO, true, [], []);
    } catch {
      /* expected */
    }
  });
  it("setImageURI", async () => {
    try {
      await ci.setImageURI("https://example.com/img.png");
    } catch {
      /* expected */
    }
  });
  it("updateContractURI", async () => {
    try {
      await ci.updateContractURI("https://example.com/c.json");
    } catch {
      /* expected */
    }
  });
  it("mintNFTForPledge", async () => {
    try {
      await ci.mintNFTForPledge(
        ZERO_ADDR,
        BYTES32_ZERO,
        ZERO_ADDR,
        100n,
        0n,
        0n,
      );
    } catch {
      /* expected */
    }
  });
  it("burn", async () => {
    try {
      await ci.burn(0n);
    } catch {
      /* expected */
    }
  });
  it("pauseCampaign", async () => {
    try {
      await ci.pauseCampaign(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("unpauseCampaign", async () => {
    try {
      await ci.unpauseCampaign(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("cancelCampaign", async () => {
    try {
      await ci.cancelCampaign(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("setPlatformInfo", async () => {
    try {
      await ci.setPlatformInfo(BYTES32_ZERO, ZERO_ADDR);
    } catch {
      /* expected */
    }
  });
  it("transferOwnership", async () => {
    try {
      await ci.transferOwnership(ZERO_ADDR);
    } catch {
      /* expected */
    }
  });
  it("renounceOwnership", async () => {
    try {
      await ci.renounceOwnership();
    } catch {
      /* expected */
    }
  });
});

describe("CampaignInfo — simulate (may throw)", () => {
  it("simulate.updateDeadline", async () => {
    try {
      await ci.simulate.updateDeadline(9999999999n);
    } catch {
      /* expected */
    }
  });
  it("simulate.updateGoalAmount", async () => {
    try {
      await ci.simulate.updateGoalAmount(1000n);
    } catch {
      /* expected */
    }
  });
  it("simulate.updateLaunchTime", async () => {
    try {
      await ci.simulate.updateLaunchTime(9999999999n);
    } catch {
      /* expected */
    }
  });
  it("simulate.updateSelectedPlatform", async () => {
    try {
      await ci.simulate.updateSelectedPlatform(BYTES32_ZERO, true, [], []);
    } catch {
      /* expected */
    }
  });
  it("simulate.mintNFTForPledge", async () => {
    try {
      await ci.simulate.mintNFTForPledge(
        ZERO_ADDR,
        BYTES32_ZERO,
        ZERO_ADDR,
        100n,
        0n,
        0n,
      );
    } catch {
      /* expected */
    }
  });
  it("simulate.pauseCampaign", async () => {
    try {
      await ci.simulate.pauseCampaign(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("simulate.cancelCampaign", async () => {
    try {
      await ci.simulate.cancelCampaign(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
});

describe("CampaignInfo — events", () => {
  it("events is an empty object", () => {
    expect(ci.events).toEqual({});
  });
});
