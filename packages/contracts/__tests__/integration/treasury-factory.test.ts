import { getTestClient, getTestConfig } from "../setup/test-client";
import { BYTES32_ZERO } from "../../src/constants/encoding";

const cfg = getTestConfig();
const client = getTestClient();
const tf = client.treasuryFactory(cfg.addresses.treasuryFactory);

describe("TreasuryFactory — writes (may revert)", () => {
  it("deploy executes", async () => {
    try {
      await tf.deploy(
        BYTES32_ZERO,
        "0x0000000000000000000000000000000000000001",
        0n,
      );
    } catch {
      /* revert expected */
    }
  });

  it("registerTreasuryImplementation executes", async () => {
    try {
      await tf.registerTreasuryImplementation(
        BYTES32_ZERO,
        0n,
        "0x0000000000000000000000000000000000000001",
      );
    } catch {
      /* revert expected */
    }
  });

  it("approveTreasuryImplementation executes", async () => {
    try {
      await tf.approveTreasuryImplementation(BYTES32_ZERO, 0n);
    } catch {
      /* revert expected */
    }
  });

  it("disapproveTreasuryImplementation executes", async () => {
    try {
      await tf.disapproveTreasuryImplementation(
        "0x0000000000000000000000000000000000000001",
      );
    } catch {
      /* revert expected */
    }
  });

  it("removeTreasuryImplementation executes", async () => {
    try {
      await tf.removeTreasuryImplementation(BYTES32_ZERO, 0n);
    } catch {
      /* revert expected */
    }
  });
});

describe("TreasuryFactory — simulate (may throw)", () => {
  it("simulate.deploy", async () => {
    try {
      await tf.simulate.deploy(
        BYTES32_ZERO,
        "0x0000000000000000000000000000000000000001",
        0n,
      );
    } catch {
      /* expected */
    }
  });

  it("simulate.registerTreasuryImplementation", async () => {
    try {
      await tf.simulate.registerTreasuryImplementation(
        BYTES32_ZERO,
        0n,
        "0x0000000000000000000000000000000000000001",
      );
    } catch {
      /* expected */
    }
  });

  it("simulate.approveTreasuryImplementation", async () => {
    try {
      await tf.simulate.approveTreasuryImplementation(BYTES32_ZERO, 0n);
    } catch {
      /* expected */
    }
  });

  it("simulate.disapproveTreasuryImplementation", async () => {
    try {
      await tf.simulate.disapproveTreasuryImplementation(
        "0x0000000000000000000000000000000000000001",
      );
    } catch {
      /* expected */
    }
  });

  it("simulate.removeTreasuryImplementation", async () => {
    try {
      await tf.simulate.removeTreasuryImplementation(BYTES32_ZERO, 0n);
    } catch {
      /* expected */
    }
  });
});

describe("TreasuryFactory — events", () => {
  it("events is an empty object", () => {
    expect(tf.events).toEqual({});
  });
});
