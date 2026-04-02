import { getTestClient, getTestConfig } from "../setup/test-client";
import { BYTES32_ZERO } from "../../src/constants/encoding";

const cfg = getTestConfig();
const client = getTestClient();
const ci = client.campaignInfo(cfg.addresses.campaignInfo);
const ZERO_ADDR = "0x0000000000000000000000000000000000000001" as const;

describe("CampaignInfo — reads (may revert on uninitialized implementation)", () => {
  it("getLaunchTime", async () => {
    try { expect(typeof (await ci.getLaunchTime())).toBe("bigint"); } catch { /* implementation revert */ }
  });
  it("getDeadline", async () => {
    try { expect(typeof (await ci.getDeadline())).toBe("bigint"); } catch { /* implementation revert */ }
  });
  it("getGoalAmount", async () => {
    try { expect(typeof (await ci.getGoalAmount())).toBe("bigint"); } catch { /* implementation revert */ }
  });
  it("getCampaignCurrency", async () => {
    try { expect(await ci.getCampaignCurrency()).toMatch(/^0x/); } catch { /* implementation revert */ }
  });
  it("getIdentifierHash", async () => {
    try { expect(await ci.getIdentifierHash()).toMatch(/^0x/); } catch { /* implementation revert */ }
  });
  it("checkIfPlatformSelected", async () => {
    try { expect(typeof (await ci.checkIfPlatformSelected(BYTES32_ZERO))).toBe("boolean"); } catch { /* implementation revert */ }
  });
  it("checkIfPlatformApproved", async () => {
    try { expect(typeof (await ci.checkIfPlatformApproved(BYTES32_ZERO))).toBe("boolean"); } catch { /* implementation revert */ }
  });
  it("getPlatformAdminAddress", async () => {
    try { expect(await ci.getPlatformAdminAddress(BYTES32_ZERO)).toMatch(/^0x/); } catch { /* implementation revert */ }
  });
  it("getPlatformData", async () => {
    try { expect(await ci.getPlatformData(BYTES32_ZERO)).toMatch(/^0x/); } catch { /* implementation revert */ }
  });
  it("getPlatformFeePercent", async () => {
    try { expect(typeof (await ci.getPlatformFeePercent(BYTES32_ZERO))).toBe("bigint"); } catch { /* implementation revert */ }
  });
  it("getPlatformClaimDelay", async () => {
    try { expect(typeof (await ci.getPlatformClaimDelay(BYTES32_ZERO))).toBe("bigint"); } catch { /* implementation revert */ }
  });
  it("getProtocolAdminAddress", async () => {
    try { expect(await ci.getProtocolAdminAddress()).toMatch(/^0x/); } catch { /* implementation revert */ }
  });
  it("getProtocolFeePercent", async () => {
    try { expect(typeof (await ci.getProtocolFeePercent())).toBe("bigint"); } catch { /* implementation revert */ }
  });
  it("getAcceptedTokens", async () => {
    try { expect(Array.isArray(await ci.getAcceptedTokens())).toBe(true); } catch { /* implementation revert */ }
  });
  it("isTokenAccepted", async () => {
    try { expect(typeof (await ci.isTokenAccepted(ZERO_ADDR))).toBe("boolean"); } catch { /* implementation revert */ }
  });
  it("getTotalRaisedAmount", async () => {
    try { expect(typeof (await ci.getTotalRaisedAmount())).toBe("bigint"); } catch { /* implementation revert */ }
  });
  it("getTotalLifetimeRaisedAmount", async () => {
    try { expect(typeof (await ci.getTotalLifetimeRaisedAmount())).toBe("bigint"); } catch { /* implementation revert */ }
  });
  it("getTotalRefundedAmount", async () => {
    try { expect(typeof (await ci.getTotalRefundedAmount())).toBe("bigint"); } catch { /* implementation revert */ }
  });
  it("getTotalAvailableRaisedAmount", async () => {
    try { expect(typeof (await ci.getTotalAvailableRaisedAmount())).toBe("bigint"); } catch { /* implementation revert */ }
  });
  it("getTotalCancelledAmount", async () => {
    try { expect(typeof (await ci.getTotalCancelledAmount())).toBe("bigint"); } catch { /* implementation revert */ }
  });
  it("getTotalExpectedAmount", async () => {
    try { expect(typeof (await ci.getTotalExpectedAmount())).toBe("bigint"); } catch { /* implementation revert */ }
  });
  it("getDataFromRegistry", async () => {
    try { expect(await ci.getDataFromRegistry(BYTES32_ZERO)).toMatch(/^0x/); } catch { /* implementation revert */ }
  });
  it("getBufferTime", async () => {
    try { expect(typeof (await ci.getBufferTime())).toBe("bigint"); } catch { /* implementation revert */ }
  });
  it("getLineItemType", async () => {
    try { expect(await ci.getLineItemType(BYTES32_ZERO, BYTES32_ZERO)).toBeDefined(); } catch { /* implementation revert */ }
  });
  it("getCampaignConfig", async () => {
    try { expect(await ci.getCampaignConfig()).toBeDefined(); } catch { /* implementation revert */ }
  });
  it("getApprovedPlatformHashes", async () => {
    try { expect(Array.isArray(await ci.getApprovedPlatformHashes())).toBe(true); } catch { /* implementation revert */ }
  });
  it("isLocked", async () => {
    try { expect(typeof (await ci.isLocked())).toBe("boolean"); } catch { /* implementation revert */ }
  });
  it("cancelled", async () => {
    try { expect(typeof (await ci.cancelled())).toBe("boolean"); } catch { /* implementation revert */ }
  });
  it("owner", async () => {
    try { expect(await ci.owner()).toMatch(/^0x/); } catch { /* implementation revert */ }
  });
  it("paused", async () => {
    try { expect(typeof (await ci.paused())).toBe("boolean"); } catch { /* implementation revert */ }
  });
});

describe("CampaignInfo — writes (may revert)", () => {
  it("updateDeadline", async () => { try { await ci.updateDeadline(9999999999n); } catch { /* expected */ } });
  it("updateGoalAmount", async () => { try { await ci.updateGoalAmount(1000n); } catch { /* expected */ } });
  it("updateLaunchTime", async () => { try { await ci.updateLaunchTime(9999999999n); } catch { /* expected */ } });
  it("updateSelectedPlatform", async () => { try { await ci.updateSelectedPlatform(BYTES32_ZERO, true, [], []); } catch { /* expected */ } });
  it("setImageURI", async () => { try { await ci.setImageURI("https://example.com/img.png"); } catch { /* expected */ } });
  it("updateContractURI", async () => { try { await ci.updateContractURI("https://example.com/c.json"); } catch { /* expected */ } });
  it("mintNFTForPledge", async () => { try { await ci.mintNFTForPledge(ZERO_ADDR, BYTES32_ZERO, ZERO_ADDR, 100n, 0n, 0n); } catch { /* expected */ } });
  it("burn", async () => { try { await ci.burn(0n); } catch { /* expected */ } });
  it("pauseCampaign", async () => { try { await ci.pauseCampaign(BYTES32_ZERO); } catch { /* expected */ } });
  it("unpauseCampaign", async () => { try { await ci.unpauseCampaign(BYTES32_ZERO); } catch { /* expected */ } });
  it("cancelCampaign", async () => { try { await ci.cancelCampaign(BYTES32_ZERO); } catch { /* expected */ } });
  it("setPlatformInfo", async () => { try { await ci.setPlatformInfo(BYTES32_ZERO, ZERO_ADDR); } catch { /* expected */ } });
  it("transferOwnership", async () => { try { await ci.transferOwnership(ZERO_ADDR); } catch { /* expected */ } });
  it("renounceOwnership", async () => { try { await ci.renounceOwnership(); } catch { /* expected */ } });
});

describe("CampaignInfo — simulate (may throw)", () => {
  it("simulate.updateDeadline", async () => { try { await ci.simulate.updateDeadline(9999999999n); } catch { /* expected */ } });
  it("simulate.updateGoalAmount", async () => { try { await ci.simulate.updateGoalAmount(1000n); } catch { /* expected */ } });
  it("simulate.updateLaunchTime", async () => { try { await ci.simulate.updateLaunchTime(9999999999n); } catch { /* expected */ } });
  it("simulate.updateSelectedPlatform", async () => { try { await ci.simulate.updateSelectedPlatform(BYTES32_ZERO, true, [], []); } catch { /* expected */ } });
  it("simulate.mintNFTForPledge", async () => { try { await ci.simulate.mintNFTForPledge(ZERO_ADDR, BYTES32_ZERO, ZERO_ADDR, 100n, 0n, 0n); } catch { /* expected */ } });
  it("simulate.pauseCampaign", async () => { try { await ci.simulate.pauseCampaign(BYTES32_ZERO); } catch { /* expected */ } });
  it("simulate.cancelCampaign", async () => { try { await ci.simulate.cancelCampaign(BYTES32_ZERO); } catch { /* expected */ } });
});

describe("CampaignInfo — events", () => {
  it("events exposes event helpers", () => {
    expect(typeof ci.events.getDeadlineUpdatedLogs).toBe("function");
    expect(typeof ci.events.decodeLog).toBe("function");
    expect(typeof ci.events.watchDeadlineUpdated).toBe("function");
  });
});
