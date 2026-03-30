import { getTestClient, getTestConfig } from "../setup/test-client";
import { BYTES32_ZERO } from "../../src/constants/encoding";

const cfg = getTestConfig();
const client = getTestClient();
const pt = client.paymentTreasury(cfg.addresses.paymentTreasury);
const ZERO_ADDR = "0x0000000000000000000000000000000000000001" as const;

describe("PaymentTreasury — reads", () => {
  it("getPlatformHash", async () => {
    expect(await pt.getPlatformHash()).toMatch(/^0x/);
  });
  it("getPlatformFeePercent", async () => {
    expect(typeof (await pt.getPlatformFeePercent())).toBe("bigint");
  });
  it("getRaisedAmount", async () => {
    expect(typeof (await pt.getRaisedAmount())).toBe("bigint");
  });
  it("getAvailableRaisedAmount", async () => {
    expect(typeof (await pt.getAvailableRaisedAmount())).toBe("bigint");
  });
  it("getLifetimeRaisedAmount", async () => {
    expect(typeof (await pt.getLifetimeRaisedAmount())).toBe("bigint");
  });
  it("getRefundedAmount", async () => {
    expect(typeof (await pt.getRefundedAmount())).toBe("bigint");
  });
  it("getExpectedAmount", async () => {
    expect(typeof (await pt.getExpectedAmount())).toBe("bigint");
  });
  it("getPaymentData", async () => {
    expect(await pt.getPaymentData(BYTES32_ZERO)).toBeDefined();
  });
  it("cancelled", async () => {
    expect(typeof (await pt.cancelled())).toBe("boolean");
  });
});

describe("PaymentTreasury — writes (may revert)", () => {
  it("createPayment", async () => {
    try {
      await pt.createPayment(
        BYTES32_ZERO,
        BYTES32_ZERO,
        BYTES32_ZERO,
        ZERO_ADDR,
        100n,
        9999999999n,
        [],
        [],
      );
    } catch {
      /* expected */
    }
  });
  it("createPaymentBatch", async () => {
    try {
      await pt.createPaymentBatch(
        [BYTES32_ZERO],
        [BYTES32_ZERO],
        [BYTES32_ZERO],
        [ZERO_ADDR],
        [100n],
        [9999999999n],
        [[]],
        [[]],
      );
    } catch {
      /* expected */
    }
  });
  it("processCryptoPayment", async () => {
    try {
      await pt.processCryptoPayment(
        BYTES32_ZERO,
        BYTES32_ZERO,
        ZERO_ADDR,
        ZERO_ADDR,
        100n,
        [],
        [],
      );
    } catch {
      /* expected */
    }
  });
  it("cancelPayment", async () => {
    try {
      await pt.cancelPayment(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("confirmPayment", async () => {
    try {
      await pt.confirmPayment(BYTES32_ZERO, ZERO_ADDR);
    } catch {
      /* expected */
    }
  });
  it("confirmPaymentBatch", async () => {
    try {
      await pt.confirmPaymentBatch([BYTES32_ZERO], [ZERO_ADDR]);
    } catch {
      /* expected */
    }
  });
  it("disburseFees", async () => {
    try {
      await pt.disburseFees();
    } catch {
      /* expected */
    }
  });
  it("withdraw", async () => {
    try {
      await pt.withdraw();
    } catch {
      /* expected */
    }
  });
  it("claimRefund", async () => {
    try {
      await pt.claimRefund(BYTES32_ZERO, ZERO_ADDR);
    } catch {
      /* expected */
    }
  });
  it("claimRefundSelf", async () => {
    try {
      await pt.claimRefundSelf(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("claimExpiredFunds", async () => {
    try {
      await pt.claimExpiredFunds();
    } catch {
      /* expected */
    }
  });
  it("claimNonGoalLineItems", async () => {
    try {
      await pt.claimNonGoalLineItems(ZERO_ADDR);
    } catch {
      /* expected */
    }
  });
  it("pauseTreasury", async () => {
    try {
      await pt.pauseTreasury(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("unpauseTreasury", async () => {
    try {
      await pt.unpauseTreasury(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("cancelTreasury", async () => {
    try {
      await pt.cancelTreasury(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
});

describe("PaymentTreasury — simulate (may throw)", () => {
  it("simulate.createPayment", async () => {
    try {
      await pt.simulate.createPayment(
        BYTES32_ZERO,
        BYTES32_ZERO,
        BYTES32_ZERO,
        ZERO_ADDR,
        100n,
        9999999999n,
        [],
        [],
      );
    } catch {
      /* expected */
    }
  });
  it("simulate.createPaymentBatch", async () => {
    try {
      await pt.simulate.createPaymentBatch(
        [BYTES32_ZERO],
        [BYTES32_ZERO],
        [BYTES32_ZERO],
        [ZERO_ADDR],
        [100n],
        [9999999999n],
        [[]],
        [[]],
      );
    } catch {
      /* expected */
    }
  });
  it("simulate.processCryptoPayment", async () => {
    try {
      await pt.simulate.processCryptoPayment(
        BYTES32_ZERO,
        BYTES32_ZERO,
        ZERO_ADDR,
        ZERO_ADDR,
        100n,
        [],
        [],
      );
    } catch {
      /* expected */
    }
  });
  it("simulate.cancelPayment", async () => {
    try {
      await pt.simulate.cancelPayment(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("simulate.confirmPayment", async () => {
    try {
      await pt.simulate.confirmPayment(BYTES32_ZERO, ZERO_ADDR);
    } catch {
      /* expected */
    }
  });
  it("simulate.confirmPaymentBatch", async () => {
    try {
      await pt.simulate.confirmPaymentBatch([BYTES32_ZERO], [ZERO_ADDR]);
    } catch {
      /* expected */
    }
  });
  it("simulate.disburseFees", async () => {
    try {
      await pt.simulate.disburseFees();
    } catch {
      /* expected */
    }
  });
  it("simulate.withdraw", async () => {
    try {
      await pt.simulate.withdraw();
    } catch {
      /* expected */
    }
  });
  it("simulate.claimRefund", async () => {
    try {
      await pt.simulate.claimRefund(BYTES32_ZERO, ZERO_ADDR);
    } catch {
      /* expected */
    }
  });
  it("simulate.claimRefundSelf", async () => {
    try {
      await pt.simulate.claimRefundSelf(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("simulate.claimExpiredFunds", async () => {
    try {
      await pt.simulate.claimExpiredFunds();
    } catch {
      /* expected */
    }
  });
  it("simulate.claimNonGoalLineItems", async () => {
    try {
      await pt.simulate.claimNonGoalLineItems(ZERO_ADDR);
    } catch {
      /* expected */
    }
  });
  it("simulate.pauseTreasury", async () => {
    try {
      await pt.simulate.pauseTreasury(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("simulate.unpauseTreasury", async () => {
    try {
      await pt.simulate.unpauseTreasury(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
  it("simulate.cancelTreasury", async () => {
    try {
      await pt.simulate.cancelTreasury(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
});

describe("PaymentTreasury — events", () => {
  it("events is an empty object", () => {
    expect(pt.events).toEqual({});
  });
});
