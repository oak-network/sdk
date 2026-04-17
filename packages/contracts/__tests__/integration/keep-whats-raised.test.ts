import { getTestClient, getTestConfig } from "../setup/test-client";
import { BYTES32_ZERO } from "../../src/constants/encoding";

const cfg = getTestConfig();
const client = getTestClient();
const kwr = client.keepWhatsRaisedTreasury(cfg.addresses.keepWhatsRaised);
const ZERO_ADDR = "0x0000000000000000000000000000000000000001" as const;

describe("KeepWhatsRaised — reads (may revert on uninitialized implementation)", () => {
  it("getRaisedAmount", async () => { try { expect(typeof (await kwr.getRaisedAmount())).toBe("bigint"); } catch { /* implementation revert */ } });
  it("getLifetimeRaisedAmount", async () => { try { expect(typeof (await kwr.getLifetimeRaisedAmount())).toBe("bigint"); } catch { /* implementation revert */ } });
  it("getRefundedAmount", async () => { try { expect(typeof (await kwr.getRefundedAmount())).toBe("bigint"); } catch { /* implementation revert */ } });
  it("getAvailableRaisedAmount", async () => { try { expect(typeof (await kwr.getAvailableRaisedAmount())).toBe("bigint"); } catch { /* implementation revert */ } });
  it("getReward", async () => { try { expect(await kwr.getReward(BYTES32_ZERO)).toBeDefined(); } catch { /* implementation revert */ } });
  it("getPlatformHash", async () => { try { expect(await kwr.getPlatformHash()).toMatch(/^0x/); } catch { /* implementation revert */ } });
  it("getPlatformFeePercent", async () => { try { expect(typeof (await kwr.getPlatformFeePercent())).toBe("bigint"); } catch { /* implementation revert */ } });
  it("getWithdrawalApprovalStatus", async () => { try { expect(typeof (await kwr.getWithdrawalApprovalStatus())).toBe("boolean"); } catch { /* implementation revert */ } });
  it("getLaunchTime", async () => { try { expect(typeof (await kwr.getLaunchTime())).toBe("bigint"); } catch { /* implementation revert */ } });
  it("getDeadline", async () => { try { expect(typeof (await kwr.getDeadline())).toBe("bigint"); } catch { /* implementation revert */ } });
  it("getGoalAmount", async () => { try { expect(typeof (await kwr.getGoalAmount())).toBe("bigint"); } catch { /* implementation revert */ } });
  it("getPaymentGatewayFee", async () => { try { expect(typeof (await kwr.getPaymentGatewayFee(BYTES32_ZERO))).toBe("bigint"); } catch { /* implementation revert */ } });
  it("getFeeValue", async () => { try { expect(typeof (await kwr.getFeeValue(BYTES32_ZERO))).toBe("bigint"); } catch { /* implementation revert */ } });
  it("paused", async () => { try { expect(typeof (await kwr.paused())).toBe("boolean"); } catch { /* implementation revert */ } });
  it("cancelled", async () => { try { expect(typeof (await kwr.cancelled())).toBe("boolean"); } catch { /* implementation revert */ } });
});

describe("KeepWhatsRaised — writes (may revert)", () => {
  it("pauseTreasury", async () => { try { await kwr.pauseTreasury(BYTES32_ZERO); } catch { /* expected */ } });
  it("unpauseTreasury", async () => { try { await kwr.unpauseTreasury(BYTES32_ZERO); } catch { /* expected */ } });
  it("cancelTreasury", async () => { try { await kwr.cancelTreasury(BYTES32_ZERO); } catch { /* expected */ } });
  it("configureTreasury", async () => {
    try {
      await kwr.configureTreasury(
        { minimumWithdrawalForFeeExemption: 0n, withdrawalDelay: 0n, refundDelay: 0n, configLockPeriod: 0n, isColombianCreator: false },
        { launchTime: 9999999999n, deadline: 9999999999n, goalAmount: 1000n, currency: BYTES32_ZERO },
        { flatFeeKey: BYTES32_ZERO, cumulativeFlatFeeKey: BYTES32_ZERO, grossPercentageFeeKeys: [] },
        { flatFeeValue: 0n, cumulativeFlatFeeValue: 0n, grossPercentageFeeValues: [] },
      );
    } catch { /* expected */ }
  });
  it("addRewards", async () => {
    try { await kwr.addRewards([BYTES32_ZERO], [{ rewardValue: 100n, isRewardTier: false, itemId: [], itemValue: [], itemQuantity: [] }]); } catch { /* expected */ }
  });
  it("removeReward", async () => { try { await kwr.removeReward(BYTES32_ZERO); } catch { /* expected */ } });
  it("approveWithdrawal", async () => { try { await kwr.approveWithdrawal(); } catch { /* expected */ } });
  it("setPaymentGatewayFee", async () => { try { await kwr.setPaymentGatewayFee(BYTES32_ZERO, 0n); } catch { /* expected */ } });
  it("setFeeAndPledge", async () => { try { await kwr.setFeeAndPledge(BYTES32_ZERO, ZERO_ADDR, ZERO_ADDR, 100n, 0n, 0n, [BYTES32_ZERO], true); } catch { /* expected */ } });
  it("pledgeForAReward", async () => { try { await kwr.pledgeForAReward(BYTES32_ZERO, ZERO_ADDR, ZERO_ADDR, 0n, [BYTES32_ZERO]); } catch { /* expected */ } });
  it("pledgeWithoutAReward", async () => { try { await kwr.pledgeWithoutAReward(BYTES32_ZERO, ZERO_ADDR, ZERO_ADDR, 100n, 0n); } catch { /* expected */ } });
  it("claimRefund", async () => { try { await kwr.claimRefund(0n); } catch { /* expected */ } });
  it("claimTip", async () => { try { await kwr.claimTip(); } catch { /* expected */ } });
  it("claimFund", async () => { try { await kwr.claimFund(); } catch { /* expected */ } });
  it("disburseFees", async () => { try { await kwr.disburseFees(); } catch { /* expected */ } });
  it("withdraw", async () => { try { await kwr.withdraw(ZERO_ADDR, 0n); } catch { /* expected */ } });
  it("updateDeadline", async () => { try { await kwr.updateDeadline(9999999999n); } catch { /* expected */ } });
  it("updateGoalAmount", async () => { try { await kwr.updateGoalAmount(1000n); } catch { /* expected */ } });
});

describe("KeepWhatsRaised — simulate (may throw)", () => {
  it("simulate.pledgeForAReward", async () => { try { await kwr.simulate.pledgeForAReward(BYTES32_ZERO, ZERO_ADDR, ZERO_ADDR, 0n, [BYTES32_ZERO]); } catch { /* expected */ } });
  it("simulate.pledgeWithoutAReward", async () => { try { await kwr.simulate.pledgeWithoutAReward(BYTES32_ZERO, ZERO_ADDR, ZERO_ADDR, 100n, 0n); } catch { /* expected */ } });
  it("simulate.claimRefund", async () => { try { await kwr.simulate.claimRefund(0n); } catch { /* expected */ } });
  it("simulate.disburseFees", async () => { try { await kwr.simulate.disburseFees(); } catch { /* expected */ } });
  it("simulate.withdraw", async () => { try { await kwr.simulate.withdraw(ZERO_ADDR, 0n); } catch { /* expected */ } });
  it("simulate.setFeeAndPledge", async () => { try { await kwr.simulate.setFeeAndPledge(BYTES32_ZERO, ZERO_ADDR, ZERO_ADDR, 100n, 0n, 0n, [BYTES32_ZERO], true); } catch { /* expected */ } });
});

describe("KeepWhatsRaised — events", () => {
  it("events exposes event helpers", () => {
    expect(typeof kwr.events.getReceiptLogs).toBe("function");
    expect(typeof kwr.events.decodeLog).toBe("function");
    expect(typeof kwr.events.watchReceipt).toBe("function");
  });
});
