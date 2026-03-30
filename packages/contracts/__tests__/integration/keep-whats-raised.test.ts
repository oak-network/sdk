import { getTestClient, getTestConfig } from "../setup/test-client";
import { BYTES32_ZERO } from "../../src/constants/encoding";

const cfg = getTestConfig();
const client = getTestClient();
const kwr = client.keepWhatsRaisedTreasury(cfg.addresses.keepWhatsRaised);
const ZERO_ADDR = "0x0000000000000000000000000000000000000001" as const;

describe("KeepWhatsRaised — reads", () => {
  it("getRaisedAmount", async () => {
    expect(typeof (await kwr.getRaisedAmount())).toBe("bigint");
  });
  it("getLifetimeRaisedAmount", async () => {
    expect(typeof (await kwr.getLifetimeRaisedAmount())).toBe("bigint");
  });
  it("getRefundedAmount", async () => {
    expect(typeof (await kwr.getRefundedAmount())).toBe("bigint");
  });
  it("getAvailableRaisedAmount", async () => {
    expect(typeof (await kwr.getAvailableRaisedAmount())).toBe("bigint");
  });
  it("getReward", async () => {
    expect(await kwr.getReward(BYTES32_ZERO)).toBeDefined();
  });
  it("getPlatformHash", async () => {
    expect(await kwr.getPlatformHash()).toMatch(/^0x/);
  });
  it("getPlatformFeePercent", async () => {
    expect(typeof (await kwr.getPlatformFeePercent())).toBe("bigint");
  });
  it("getWithdrawalApprovalStatus", async () => {
    expect(typeof (await kwr.getWithdrawalApprovalStatus())).toBe("boolean");
  });
  it("getLaunchTime", async () => {
    expect(typeof (await kwr.getLaunchTime())).toBe("bigint");
  });
  it("getDeadline", async () => {
    expect(typeof (await kwr.getDeadline())).toBe("bigint");
  });
  it("getGoalAmount", async () => {
    expect(typeof (await kwr.getGoalAmount())).toBe("bigint");
  });
  it("getPaymentGatewayFee", async () => {
    expect(typeof (await kwr.getPaymentGatewayFee(BYTES32_ZERO))).toBe(
      "bigint",
    );
  });
  it("getFeeValue", async () => {
    expect(typeof (await kwr.getFeeValue(BYTES32_ZERO))).toBe("bigint");
  });
  it("paused", async () => {
    expect(typeof (await kwr.paused())).toBe("boolean");
  });
  it("cancelled", async () => {
    expect(typeof (await kwr.cancelled())).toBe("boolean");
  });
  it("balanceOf", async () => {
    expect(typeof (await kwr.balanceOf(ZERO_ADDR))).toBe("bigint");
  });
  it("ownerOf (may revert)", async () => {
    try {
      await kwr.ownerOf(0n);
    } catch {
      /* expected */
    }
  });
  it("tokenURI (may revert)", async () => {
    try {
      await kwr.tokenURI(0n);
    } catch {
      /* expected */
    }
  });
  it("name", async () => {
    expect(typeof (await kwr.name())).toBe("string");
  });
  it("symbol", async () => {
    expect(typeof (await kwr.symbol())).toBe("string");
  });
  it("getApproved (may revert)", async () => {
    try {
      await kwr.getApproved(0n);
    } catch {
      /* expected */
    }
  });
  it("isApprovedForAll", async () => {
    expect(typeof (await kwr.isApprovedForAll(ZERO_ADDR, ZERO_ADDR))).toBe(
      "boolean",
    );
  });
  it("supportsInterface", async () => {
    expect(typeof (await kwr.supportsInterface("0x80ac58cd"))).toBe("boolean");
  });
});

describe("KeepWhatsRaised — writes (may revert)", () => {
  it("pauseTreasury", async () => {
    try {
      await kwr.pauseTreasury(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("unpauseTreasury", async () => {
    try {
      await kwr.unpauseTreasury(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("cancelTreasury", async () => {
    try {
      await kwr.cancelTreasury(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("configureTreasury", async () => {
    try {
      await kwr.configureTreasury(
        {
          minimumWithdrawalForFeeExemption: 0n,
          withdrawalDelay: 0n,
          refundDelay: 0n,
          configLockPeriod: 0n,
          isColombianCreator: false,
        },
        {
          launchTime: 9999999999n,
          deadline: 9999999999n,
          goalAmount: 1000n,
          currency: BYTES32_ZERO,
        },
        {
          flatFeeKey: BYTES32_ZERO,
          cumulativeFlatFeeKey: BYTES32_ZERO,
          grossPercentageFeeKeys: [],
        },
        {
          flatFeeValue: 0n,
          cumulativeFlatFeeValue: 0n,
          grossPercentageFeeValues: [],
        },
      );
    } catch {
      /* expected */
    }
  });
  it("addRewards", async () => {
    try {
      await kwr.addRewards(
        [BYTES32_ZERO],
        [
          {
            rewardValue: 100n,
            isRewardTier: false,
            itemId: [],
            itemValue: [],
            itemQuantity: [],
          },
        ],
      );
    } catch {
      /* expected */
    }
  });
  it("removeReward", async () => {
    try {
      await kwr.removeReward(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("approveWithdrawal", async () => {
    try {
      await kwr.approveWithdrawal();
    } catch {
      /* expected */
    }
  });
  it("setPaymentGatewayFee", async () => {
    try {
      await kwr.setPaymentGatewayFee(BYTES32_ZERO, 0n);
    } catch {
      /* expected */
    }
  });
  it("setFeeAndPledge", async () => {
    try {
      await kwr.setFeeAndPledge(
        BYTES32_ZERO,
        ZERO_ADDR,
        ZERO_ADDR,
        100n,
        0n,
        0n,
        [BYTES32_ZERO],
        true,
      );
    } catch {
      /* expected */
    }
  });
  it("pledgeForAReward", async () => {
    try {
      await kwr.pledgeForAReward(BYTES32_ZERO, ZERO_ADDR, ZERO_ADDR, 0n, [
        BYTES32_ZERO,
      ]);
    } catch {
      /* expected */
    }
  });
  it("pledgeWithoutAReward", async () => {
    try {
      await kwr.pledgeWithoutAReward(
        BYTES32_ZERO,
        ZERO_ADDR,
        ZERO_ADDR,
        100n,
        0n,
      );
    } catch {
      /* expected */
    }
  });
  it("claimRefund", async () => {
    try {
      await kwr.claimRefund(0n);
    } catch {
      /* expected */
    }
  });
  it("claimTip", async () => {
    try {
      await kwr.claimTip();
    } catch {
      /* expected */
    }
  });
  it("claimFund", async () => {
    try {
      await kwr.claimFund();
    } catch {
      /* expected */
    }
  });
  it("disburseFees", async () => {
    try {
      await kwr.disburseFees();
    } catch {
      /* expected */
    }
  });
  it("withdraw", async () => {
    try {
      await kwr.withdraw(ZERO_ADDR, 0n);
    } catch {
      /* expected */
    }
  });
  it("updateDeadline", async () => {
    try {
      await kwr.updateDeadline(9999999999n);
    } catch {
      /* expected */
    }
  });
  it("updateGoalAmount", async () => {
    try {
      await kwr.updateGoalAmount(1000n);
    } catch {
      /* expected */
    }
  });
  it("approve", async () => {
    try {
      await kwr.approve(ZERO_ADDR, 0n);
    } catch {
      /* expected */
    }
  });
  it("setApprovalForAll", async () => {
    try {
      await kwr.setApprovalForAll(ZERO_ADDR, true);
    } catch {
      /* expected */
    }
  });
  it("safeTransferFrom", async () => {
    try {
      await kwr.safeTransferFrom(ZERO_ADDR, ZERO_ADDR, 0n);
    } catch {
      /* expected */
    }
  });
  it("transferFrom", async () => {
    try {
      await kwr.transferFrom(ZERO_ADDR, ZERO_ADDR, 0n);
    } catch {
      /* expected */
    }
  });
});

describe("KeepWhatsRaised — simulate (may throw)", () => {
  it("simulate.pledgeForAReward", async () => {
    try {
      await kwr.simulate.pledgeForAReward(
        BYTES32_ZERO,
        ZERO_ADDR,
        ZERO_ADDR,
        0n,
        [BYTES32_ZERO],
      );
    } catch {
      /* expected */
    }
  });
  it("simulate.pledgeWithoutAReward", async () => {
    try {
      await kwr.simulate.pledgeWithoutAReward(
        BYTES32_ZERO,
        ZERO_ADDR,
        ZERO_ADDR,
        100n,
        0n,
      );
    } catch {
      /* expected */
    }
  });
  it("simulate.claimRefund", async () => {
    try {
      await kwr.simulate.claimRefund(0n);
    } catch {
      /* expected */
    }
  });
  it("simulate.disburseFees", async () => {
    try {
      await kwr.simulate.disburseFees();
    } catch {
      /* expected */
    }
  });
  it("simulate.withdraw", async () => {
    try {
      await kwr.simulate.withdraw(ZERO_ADDR, 0n);
    } catch {
      /* expected */
    }
  });
  it("simulate.setFeeAndPledge", async () => {
    try {
      await kwr.simulate.setFeeAndPledge(
        BYTES32_ZERO,
        ZERO_ADDR,
        ZERO_ADDR,
        100n,
        0n,
        0n,
        [BYTES32_ZERO],
        true,
      );
    } catch {
      /* expected */
    }
  });
});

describe("KeepWhatsRaised — events", () => {
  it("events is an empty object", () => {
    expect(kwr.events).toEqual({});
  });
});
