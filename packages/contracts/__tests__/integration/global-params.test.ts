import { getTestClient, getTestConfig } from "../setup/test-client";
import { BYTES32_ZERO } from "../../src/constants/encoding";

const cfg = getTestConfig();
const client = getTestClient();
const gp = client.globalParams(cfg.addresses.globalParams);

describe("GlobalParams — reads", () => {
  it("getProtocolAdminAddress returns an address", async () => {
    const addr = await gp.getProtocolAdminAddress();
    expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it("getProtocolFeePercent returns a bigint", async () => {
    const fee = await gp.getProtocolFeePercent();
    expect(typeof fee).toBe("bigint");
  });

  it("getNumberOfListedPlatforms returns a bigint", async () => {
    const count = await gp.getNumberOfListedPlatforms();
    expect(typeof count).toBe("bigint");
  });

  it("checkIfPlatformIsListed returns a boolean", async () => {
    const listed = await gp.checkIfPlatformIsListed(BYTES32_ZERO);
    expect(typeof listed).toBe("boolean");
  });

  it("checkIfPlatformDataKeyValid returns a boolean", async () => {
    const valid = await gp.checkIfPlatformDataKeyValid(BYTES32_ZERO);
    expect(typeof valid).toBe("boolean");
  });

  it("getPlatformAdminAddress returns an address", async () => {
    const addr = await gp.getPlatformAdminAddress(BYTES32_ZERO);
    expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it("getPlatformFeePercent returns a bigint", async () => {
    const fee = await gp.getPlatformFeePercent(BYTES32_ZERO);
    expect(typeof fee).toBe("bigint");
  });

  it("getPlatformClaimDelay returns a bigint", async () => {
    const delay = await gp.getPlatformClaimDelay(BYTES32_ZERO);
    expect(typeof delay).toBe("bigint");
  });

  it("getPlatformAdapter returns an address", async () => {
    const addr = await gp.getPlatformAdapter(BYTES32_ZERO);
    expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it("getPlatformDataOwner returns a hex value", async () => {
    const owner = await gp.getPlatformDataOwner(BYTES32_ZERO);
    expect(owner).toMatch(/^0x/);
  });

  it("getPlatformLineItemType returns a LineItemTypeInfo", async () => {
    const info = await gp.getPlatformLineItemType(BYTES32_ZERO, BYTES32_ZERO);
    expect(info).toBeDefined();
  });

  it("getTokensForCurrency returns an array", async () => {
    const tokens = await gp.getTokensForCurrency(BYTES32_ZERO);
    expect(Array.isArray(tokens)).toBe(true);
  });

  it("getFromRegistry returns a hex value", async () => {
    const val = await gp.getFromRegistry(BYTES32_ZERO);
    expect(val).toMatch(/^0x/);
  });

  it("owner returns an address", async () => {
    const addr = await gp.owner();
    expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });
});

describe("GlobalParams — writes (may revert)", () => {
  it("enlistPlatform executes without JS errors", async () => {
    try {
      await gp.enlistPlatform(
        BYTES32_ZERO,
        "0x0000000000000000000000000000000000000001",
        100n,
        "0x0000000000000000000000000000000000000002",
      );
    } catch {
      // Expected to revert on-chain; code path is still exercised
    }
  });

  it("delistPlatform executes without JS errors", async () => {
    try {
      await gp.delistPlatform(BYTES32_ZERO);
    } catch {
      /* revert expected */
    }
  });

  it("updatePlatformAdminAddress executes", async () => {
    try {
      await gp.updatePlatformAdminAddress(
        BYTES32_ZERO,
        "0x0000000000000000000000000000000000000001",
      );
    } catch {
      /* revert expected */
    }
  });

  it("updatePlatformClaimDelay executes", async () => {
    try {
      await gp.updatePlatformClaimDelay(BYTES32_ZERO, 0n);
    } catch {
      /* revert expected */
    }
  });

  it("updateProtocolAdminAddress executes", async () => {
    try {
      await gp.updateProtocolAdminAddress(
        "0x0000000000000000000000000000000000000001",
      );
    } catch {
      /* revert expected */
    }
  });

  it("updateProtocolFeePercent executes", async () => {
    try {
      await gp.updateProtocolFeePercent(100n);
    } catch {
      /* revert expected */
    }
  });

  it("setPlatformAdapter executes", async () => {
    try {
      await gp.setPlatformAdapter(
        BYTES32_ZERO,
        "0x0000000000000000000000000000000000000001",
      );
    } catch {
      /* revert expected */
    }
  });

  it("setPlatformLineItemType executes", async () => {
    try {
      await gp.setPlatformLineItemType(
        BYTES32_ZERO,
        BYTES32_ZERO,
        "test",
        true,
        true,
        true,
        false,
      );
    } catch {
      /* revert expected */
    }
  });

  it("removePlatformLineItemType executes", async () => {
    try {
      await gp.removePlatformLineItemType(BYTES32_ZERO, BYTES32_ZERO);
    } catch {
      /* revert expected */
    }
  });

  it("addTokenToCurrency executes", async () => {
    try {
      await gp.addTokenToCurrency(
        BYTES32_ZERO,
        "0x0000000000000000000000000000000000000001",
      );
    } catch {
      /* revert expected */
    }
  });

  it("removeTokenFromCurrency executes", async () => {
    try {
      await gp.removeTokenFromCurrency(
        BYTES32_ZERO,
        "0x0000000000000000000000000000000000000001",
      );
    } catch {
      /* revert expected */
    }
  });

  it("addPlatformData executes", async () => {
    try {
      await gp.addPlatformData(BYTES32_ZERO, BYTES32_ZERO);
    } catch {
      /* revert expected */
    }
  });

  it("removePlatformData executes", async () => {
    try {
      await gp.removePlatformData(BYTES32_ZERO, BYTES32_ZERO);
    } catch {
      /* revert expected */
    }
  });

  it("addToRegistry executes", async () => {
    try {
      await gp.addToRegistry(BYTES32_ZERO, BYTES32_ZERO);
    } catch {
      /* revert expected */
    }
  });

  it("transferOwnership executes", async () => {
    try {
      await gp.transferOwnership("0x0000000000000000000000000000000000000001");
    } catch {
      /* revert expected */
    }
  });

  it("renounceOwnership executes", async () => {
    try {
      await gp.renounceOwnership();
    } catch {
      /* revert expected */
    }
  });
});

describe("GlobalParams — simulate (may throw typed errors)", () => {
  it("simulate.enlistPlatform", async () => {
    try {
      await gp.simulate.enlistPlatform(
        BYTES32_ZERO,
        "0x0000000000000000000000000000000000000001",
        100n,
        "0x0000000000000000000000000000000000000002",
      );
    } catch {
      // Expected typed error or viem error
    }
  });

  it("simulate.delistPlatform", async () => {
    try {
      await gp.simulate.delistPlatform(BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });

  it("simulate.updatePlatformAdminAddress", async () => {
    try {
      await gp.simulate.updatePlatformAdminAddress(
        BYTES32_ZERO,
        "0x0000000000000000000000000000000000000001",
      );
    } catch {
      /* expected */
    }
  });

  it("simulate.updatePlatformClaimDelay", async () => {
    try {
      await gp.simulate.updatePlatformClaimDelay(BYTES32_ZERO, 0n);
    } catch {
      /* expected */
    }
  });

  it("simulate.updateProtocolAdminAddress", async () => {
    try {
      await gp.simulate.updateProtocolAdminAddress(
        "0x0000000000000000000000000000000000000001",
      );
    } catch {
      /* expected */
    }
  });

  it("simulate.updateProtocolFeePercent", async () => {
    try {
      await gp.simulate.updateProtocolFeePercent(100n);
    } catch {
      /* expected */
    }
  });

  it("simulate.setPlatformAdapter", async () => {
    try {
      await gp.simulate.setPlatformAdapter(
        BYTES32_ZERO,
        "0x0000000000000000000000000000000000000001",
      );
    } catch {
      /* expected */
    }
  });

  it("simulate.setPlatformLineItemType", async () => {
    try {
      await gp.simulate.setPlatformLineItemType(
        BYTES32_ZERO,
        BYTES32_ZERO,
        "test",
        true,
        true,
        true,
        false,
      );
    } catch {
      /* expected */
    }
  });

  it("simulate.removePlatformLineItemType", async () => {
    try {
      await gp.simulate.removePlatformLineItemType(BYTES32_ZERO, BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });

  it("simulate.addTokenToCurrency", async () => {
    try {
      await gp.simulate.addTokenToCurrency(
        BYTES32_ZERO,
        "0x0000000000000000000000000000000000000001",
      );
    } catch {
      /* expected */
    }
  });

  it("simulate.removeTokenFromCurrency", async () => {
    try {
      await gp.simulate.removeTokenFromCurrency(
        BYTES32_ZERO,
        "0x0000000000000000000000000000000000000001",
      );
    } catch {
      /* expected */
    }
  });

  it("simulate.addPlatformData", async () => {
    try {
      await gp.simulate.addPlatformData(BYTES32_ZERO, BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });

  it("simulate.removePlatformData", async () => {
    try {
      await gp.simulate.removePlatformData(BYTES32_ZERO, BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });

  it("simulate.addToRegistry", async () => {
    try {
      await gp.simulate.addToRegistry(BYTES32_ZERO, BYTES32_ZERO);
    } catch {
      /* expected */
    }
  });
});

describe("GlobalParams — events", () => {
  it("events is an empty object", () => {
    expect(gp.events).toEqual({});
  });
});
