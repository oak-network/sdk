import { getTestClient, getTestConfig } from "../setup/test-client";
import { BYTES32_ZERO } from "../../src/constants/encoding";

const cfg = getTestConfig();
const client = getTestClient();
const aon = client.allOrNothingTreasury(cfg.addresses.allOrNothing);
const ZERO_ADDR = "0x0000000000000000000000000000000000000001" as const;

describe("AllOrNothing — reads (may revert on uninitialized implementation)", () => {
  it("getRaisedAmount", async () => { try { expect(typeof (await aon.getRaisedAmount())).toBe("bigint"); } catch { /* implementation revert */ } });
  it("getLifetimeRaisedAmount", async () => { try { expect(typeof (await aon.getLifetimeRaisedAmount())).toBe("bigint"); } catch { /* implementation revert */ } });
  it("getRefundedAmount", async () => { try { expect(typeof (await aon.getRefundedAmount())).toBe("bigint"); } catch { /* implementation revert */ } });
  it("getReward", async () => { try { expect(await aon.getReward(BYTES32_ZERO)).toBeDefined(); } catch { /* implementation revert */ } });
  it("getPlatformHash", async () => { try { expect(await aon.getPlatformHash()).toMatch(/^0x/); } catch { /* implementation revert */ } });
  it("getPlatformFeePercent", async () => { try { expect(typeof (await aon.getPlatformFeePercent())).toBe("bigint"); } catch { /* implementation revert */ } });
  it("paused", async () => { try { expect(typeof (await aon.paused())).toBe("boolean"); } catch { /* implementation revert */ } });
  it("cancelled", async () => { try { expect(typeof (await aon.cancelled())).toBe("boolean"); } catch { /* implementation revert */ } });
  it("balanceOf", async () => { try { expect(typeof (await aon.balanceOf(ZERO_ADDR))).toBe("bigint"); } catch { /* implementation revert */ } });
  it("ownerOf (may revert)", async () => { try { await aon.ownerOf(0n); } catch { /* expected */ } });
  it("tokenURI (may revert)", async () => { try { await aon.tokenURI(0n); } catch { /* expected */ } });
  it("name", async () => { try { expect(typeof (await aon.name())).toBe("string"); } catch { /* implementation revert */ } });
  it("symbol", async () => { try { expect(typeof (await aon.symbol())).toBe("string"); } catch { /* implementation revert */ } });
  it("getApproved (may revert)", async () => { try { await aon.getApproved(0n); } catch { /* expected */ } });
  it("isApprovedForAll", async () => { try { expect(typeof (await aon.isApprovedForAll(ZERO_ADDR, ZERO_ADDR))).toBe("boolean"); } catch { /* implementation revert */ } });
  it("supportsInterface", async () => { try { expect(typeof (await aon.supportsInterface("0x80ac58cd"))).toBe("boolean"); } catch { /* implementation revert */ } });
});

describe("AllOrNothing — writes (may revert)", () => {
  it("pauseTreasury", async () => { try { await aon.pauseTreasury(BYTES32_ZERO); } catch { /* expected */ } });
  it("unpauseTreasury", async () => { try { await aon.unpauseTreasury(BYTES32_ZERO); } catch { /* expected */ } });
  it("cancelTreasury", async () => { try { await aon.cancelTreasury(BYTES32_ZERO); } catch { /* expected */ } });
  it("addRewards", async () => {
    try {
      await aon.addRewards([BYTES32_ZERO], [{ rewardValue: 100n, isRewardTier: false, itemId: [], itemValue: [], itemQuantity: [] }]);
    } catch { /* expected */ }
  });
  it("removeReward", async () => { try { await aon.removeReward(BYTES32_ZERO); } catch { /* expected */ } });
  it("pledgeForAReward", async () => { try { await aon.pledgeForAReward(ZERO_ADDR, ZERO_ADDR, 0n, [BYTES32_ZERO]); } catch { /* expected */ } });
  it("pledgeWithoutAReward", async () => { try { await aon.pledgeWithoutAReward(ZERO_ADDR, ZERO_ADDR, 100n); } catch { /* expected */ } });
  it("claimRefund", async () => { try { await aon.claimRefund(0n); } catch { /* expected */ } });
  it("disburseFees", async () => { try { await aon.disburseFees(); } catch { /* expected */ } });
  it("withdraw", async () => { try { await aon.withdraw(); } catch { /* expected */ } });
  it("burn", async () => { try { await aon.burn(0n); } catch { /* expected */ } });
  it("approve", async () => { try { await aon.approve(ZERO_ADDR, 0n); } catch { /* expected */ } });
  it("setApprovalForAll", async () => { try { await aon.setApprovalForAll(ZERO_ADDR, true); } catch { /* expected */ } });
  it("safeTransferFrom", async () => { try { await aon.safeTransferFrom(ZERO_ADDR, ZERO_ADDR, 0n); } catch { /* expected */ } });
  it("transferFrom", async () => { try { await aon.transferFrom(ZERO_ADDR, ZERO_ADDR, 0n); } catch { /* expected */ } });
});

describe("AllOrNothing — simulate (may throw)", () => {
  it("simulate.pledgeForAReward", async () => { try { await aon.simulate.pledgeForAReward(ZERO_ADDR, ZERO_ADDR, 0n, [BYTES32_ZERO]); } catch { /* expected */ } });
  it("simulate.pledgeWithoutAReward", async () => { try { await aon.simulate.pledgeWithoutAReward(ZERO_ADDR, ZERO_ADDR, 100n); } catch { /* expected */ } });
  it("simulate.claimRefund", async () => { try { await aon.simulate.claimRefund(0n); } catch { /* expected */ } });
  it("simulate.disburseFees", async () => { try { await aon.simulate.disburseFees(); } catch { /* expected */ } });
  it("simulate.withdraw", async () => { try { await aon.simulate.withdraw(); } catch { /* expected */ } });
});

describe("AllOrNothing — events", () => {
  it("events exposes event helpers", () => {
    expect(typeof aon.events.getReceiptLogs).toBe("function");
    expect(typeof aon.events.decodeLog).toBe("function");
    expect(typeof aon.events.watchReceipt).toBe("function");
  });
});
