import { getTestClient, getTestConfig } from "../setup/test-client";
import { BYTES32_ZERO } from "../../src/constants/encoding";

const cfg = getTestConfig();
const client = getTestClient();
const aon = client.allOrNothingTreasury(cfg.addresses.allOrNothing);
const ZERO_ADDR = "0x0000000000000000000000000000000000000001" as const;

describe("AllOrNothing — reads", () => {
  it("getRaisedAmount", async () => {
    expect(typeof (await aon.getRaisedAmount())).toBe("bigint");
  });
  it("getLifetimeRaisedAmount", async () => {
    expect(typeof (await aon.getLifetimeRaisedAmount())).toBe("bigint");
  });
  it("getRefundedAmount", async () => {
    expect(typeof (await aon.getRefundedAmount())).toBe("bigint");
  });
  it("getReward", async () => {
    expect(await aon.getReward(BYTES32_ZERO)).toBeDefined();
  });
  it("getPlatformHash", async () => {
    expect(await aon.getPlatformHash()).toMatch(/^0x/);
  });
  it("getPlatformFeePercent", async () => {
    expect(typeof (await aon.getPlatformFeePercent())).toBe("bigint");
  });
  it("paused", async () => {
    expect(typeof (await aon.paused())).toBe("boolean");
  });
  it("cancelled", async () => {
    expect(typeof (await aon.cancelled())).toBe("boolean");
  });
  it("balanceOf", async () => {
    expect(typeof (await aon.balanceOf(ZERO_ADDR))).toBe("bigint");
  });
  it("ownerOf (may revert for non-existent token)", async () => {
    try {
      await aon.ownerOf(0n);
    } catch {
      /* expected for non-existent token */
    }
  });
  it("tokenURI (may revert)", async () => {
    try {
      await aon.tokenURI(0n);
    } catch {
      /* expected */
    }
  });
  it("name", async () => {
    expect(typeof (await aon.name())).toBe("string");
  });
  it("symbol", async () => {
    expect(typeof (await aon.symbol())).toBe("string");
  });
  it("getApproved (may revert)", async () => {
    try {
      await aon.getApproved(0n);
    } catch {
      /* expected */
    }
  });
  it("isApprovedForAll", async () => {
    expect(typeof (await aon.isApprovedForAll(ZERO_ADDR, ZERO_ADDR))).toBe(
      "boolean",
    );
  });
  it("supportsInterface", async () => {
    expect(typeof (await aon.supportsInterface("0x80ac58cd"))).toBe("boolean");
  });
});

describe("AllOrNothing — writes (may revert)", () => {
  it("pauseTreasury", async () => {
    try {
      await aon.pauseTreasury(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("unpauseTreasury", async () => {
    try {
      await aon.unpauseTreasury(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("cancelTreasury", async () => {
    try {
      await aon.cancelTreasury(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("addRewards", async () => {
    try {
      await aon.addRewards(
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
      await aon.removeReward(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("pledgeForAReward", async () => {
    try {
      await aon.pledgeForAReward(ZERO_ADDR, ZERO_ADDR, 0n, [BYTES32_ZERO]);
    } catch {
      /* expected */
    }
  });
  it("pledgeWithoutAReward", async () => {
    try {
      await aon.pledgeWithoutAReward(ZERO_ADDR, ZERO_ADDR, 100n);
    } catch {
      /* expected */
    }
  });
  it("claimRefund", async () => {
    try {
      await aon.claimRefund(0n);
    } catch {
      /* expected */
    }
  });
  it("disburseFees", async () => {
    try {
      await aon.disburseFees();
    } catch {
      /* expected */
    }
  });
  it("withdraw", async () => {
    try {
      await aon.withdraw();
    } catch {
      /* expected */
    }
  });
  it("burn", async () => {
    try {
      await aon.burn(0n);
    } catch {
      /* expected */
    }
  });
  it("approve", async () => {
    try {
      await aon.approve(ZERO_ADDR, 0n);
    } catch {
      /* expected */
    }
  });
  it("setApprovalForAll", async () => {
    try {
      await aon.setApprovalForAll(ZERO_ADDR, true);
    } catch {
      /* expected */
    }
  });
  it("safeTransferFrom", async () => {
    try {
      await aon.safeTransferFrom(ZERO_ADDR, ZERO_ADDR, 0n);
    } catch {
      /* expected */
    }
  });
  it("transferFrom", async () => {
    try {
      await aon.transferFrom(ZERO_ADDR, ZERO_ADDR, 0n);
    } catch {
      /* expected */
    }
  });
});

describe("AllOrNothing — simulate (may throw)", () => {
  it("simulate.pledgeForAReward", async () => {
    try {
      await aon.simulate.pledgeForAReward(ZERO_ADDR, ZERO_ADDR, 0n, [
        BYTES32_ZERO,
      ]);
    } catch {
      /* expected */
    }
  });
  it("simulate.pledgeWithoutAReward", async () => {
    try {
      await aon.simulate.pledgeWithoutAReward(ZERO_ADDR, ZERO_ADDR, 100n);
    } catch {
      /* expected */
    }
  });
  it("simulate.claimRefund", async () => {
    try {
      await aon.simulate.claimRefund(0n);
    } catch {
      /* expected */
    }
  });
  it("simulate.disburseFees", async () => {
    try {
      await aon.simulate.disburseFees();
    } catch {
      /* expected */
    }
  });
  it("simulate.withdraw", async () => {
    try {
      await aon.simulate.withdraw();
    } catch {
      /* expected */
    }
  });
});

describe("AllOrNothing — events", () => {
  it("events is an empty object", () => {
    expect(aon.events).toEqual({});
  });
});
