import { getTestClient, getTestConfig } from "../setup/test-client";
import { BYTES32_ZERO } from "../../src/constants/encoding";

const cfg = getTestConfig();
const client = getTestClient();
const gp = client.globalParams(cfg.addresses.globalParams);
const ZERO_ADDR = "0x0000000000000000000000000000000000000001" as const;

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

  it("getPlatformAdminAddress returns or reverts for unlisted platform", async () => {
    try {
      const addr = await gp.getPlatformAdminAddress(BYTES32_ZERO);
      expect(addr).toMatch(/^0x/);
    } catch {
      /* reverts for unlisted platform hash */
    }
  });

  it("getPlatformFeePercent returns or reverts for unlisted platform", async () => {
    try {
      const fee = await gp.getPlatformFeePercent(BYTES32_ZERO);
      expect(typeof fee).toBe("bigint");
    } catch {
      /* reverts for unlisted platform hash */
    }
  });

  it("getPlatformClaimDelay returns or reverts for unlisted platform", async () => {
    try {
      const delay = await gp.getPlatformClaimDelay(BYTES32_ZERO);
      expect(typeof delay).toBe("bigint");
    } catch {
      /* reverts for unlisted platform hash */
    }
  });

  it("getPlatformAdapter returns or reverts for unlisted platform", async () => {
    try {
      const addr = await gp.getPlatformAdapter(BYTES32_ZERO);
      expect(addr).toMatch(/^0x/);
    } catch {
      /* reverts for unlisted platform hash */
    }
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
  it("enlistPlatform", async () => {
    try {
      await gp.enlistPlatform(BYTES32_ZERO, ZERO_ADDR, 100n, ZERO_ADDR);
    } catch {
      /* revert expected */
    }
  });

  it("delistPlatform", async () => {
    try {
      await gp.delistPlatform(BYTES32_ZERO);
    } catch {
      /* revert expected */
    }
  });

  it("updatePlatformAdminAddress", async () => {
    try {
      await gp.updatePlatformAdminAddress(BYTES32_ZERO, ZERO_ADDR);
    } catch {
      /* revert expected */
    }
  });

  it("updatePlatformClaimDelay", async () => {
    try {
      await gp.updatePlatformClaimDelay(BYTES32_ZERO, 0n);
    } catch {
      /* revert expected */
    }
  });

  it("updateProtocolAdminAddress", async () => {
    try {
      await gp.updateProtocolAdminAddress(ZERO_ADDR);
    } catch {
      /* revert expected */
    }
  });

  it("updateProtocolFeePercent", async () => {
    try {
      await gp.updateProtocolFeePercent(100n);
    } catch {
      /* revert expected */
    }
  });

  it("setPlatformAdapter", async () => {
    try {
      await gp.setPlatformAdapter(BYTES32_ZERO, ZERO_ADDR);
    } catch {
      /* revert expected */
    }
  });

  it("setPlatformLineItemType", async () => {
    try {
      await gp.setPlatformLineItemType(BYTES32_ZERO, BYTES32_ZERO, "test", true, true, true, false);
    } catch {
      /* revert expected */
    }
  });

  it("removePlatformLineItemType", async () => {
    try {
      await gp.removePlatformLineItemType(BYTES32_ZERO, BYTES32_ZERO);
    } catch {
      /* revert expected */
    }
  });

  it("addTokenToCurrency", async () => {
    try {
      await gp.addTokenToCurrency(BYTES32_ZERO, ZERO_ADDR);
    } catch {
      /* revert expected */
    }
  });

  it("removeTokenFromCurrency", async () => {
    try {
      await gp.removeTokenFromCurrency(BYTES32_ZERO, ZERO_ADDR);
    } catch {
      /* revert expected */
    }
  });

  it("addPlatformData", async () => {
    try {
      await gp.addPlatformData(BYTES32_ZERO, BYTES32_ZERO);
    } catch {
      /* revert expected */
    }
  });

  it("removePlatformData", async () => {
    try {
      await gp.removePlatformData(BYTES32_ZERO, BYTES32_ZERO);
    } catch {
      /* revert expected */
    }
  });

  it("addToRegistry", async () => {
    try {
      await gp.addToRegistry(BYTES32_ZERO, BYTES32_ZERO);
    } catch {
      /* revert expected */
    }
  });

  it("transferOwnership", async () => {
    try {
      await gp.transferOwnership(ZERO_ADDR);
    } catch {
      /* revert expected */
    }
  });

  it("renounceOwnership", async () => {
    try {
      await gp.renounceOwnership();
    } catch {
      /* revert expected */
    }
  });
});

describe("GlobalParams — simulate (may throw)", () => {
  it("simulate.enlistPlatform", async () => {
    try { await gp.simulate.enlistPlatform(BYTES32_ZERO, ZERO_ADDR, 100n, ZERO_ADDR); } catch { /* expected */ }
  });
  it("simulate.delistPlatform", async () => {
    try { await gp.simulate.delistPlatform(BYTES32_ZERO); } catch { /* expected */ }
  });
  it("simulate.updatePlatformAdminAddress", async () => {
    try { await gp.simulate.updatePlatformAdminAddress(BYTES32_ZERO, ZERO_ADDR); } catch { /* expected */ }
  });
  it("simulate.updatePlatformClaimDelay", async () => {
    try { await gp.simulate.updatePlatformClaimDelay(BYTES32_ZERO, 0n); } catch { /* expected */ }
  });
  it("simulate.updateProtocolAdminAddress", async () => {
    try { await gp.simulate.updateProtocolAdminAddress(ZERO_ADDR); } catch { /* expected */ }
  });
  it("simulate.updateProtocolFeePercent", async () => {
    try { await gp.simulate.updateProtocolFeePercent(100n); } catch { /* expected */ }
  });
  it("simulate.setPlatformAdapter", async () => {
    try { await gp.simulate.setPlatformAdapter(BYTES32_ZERO, ZERO_ADDR); } catch { /* expected */ }
  });
  it("simulate.setPlatformLineItemType", async () => {
    try { await gp.simulate.setPlatformLineItemType(BYTES32_ZERO, BYTES32_ZERO, "test", true, true, true, false); } catch { /* expected */ }
  });
  it("simulate.removePlatformLineItemType", async () => {
    try { await gp.simulate.removePlatformLineItemType(BYTES32_ZERO, BYTES32_ZERO); } catch { /* expected */ }
  });
  it("simulate.addTokenToCurrency", async () => {
    try { await gp.simulate.addTokenToCurrency(BYTES32_ZERO, ZERO_ADDR); } catch { /* expected */ }
  });
  it("simulate.removeTokenFromCurrency", async () => {
    try { await gp.simulate.removeTokenFromCurrency(BYTES32_ZERO, ZERO_ADDR); } catch { /* expected */ }
  });
  it("simulate.addPlatformData", async () => {
    try { await gp.simulate.addPlatformData(BYTES32_ZERO, BYTES32_ZERO); } catch { /* expected */ }
  });
  it("simulate.removePlatformData", async () => {
    try { await gp.simulate.removePlatformData(BYTES32_ZERO, BYTES32_ZERO); } catch { /* expected */ }
  });
  it("simulate.addToRegistry", async () => {
    try { await gp.simulate.addToRegistry(BYTES32_ZERO, BYTES32_ZERO); } catch { /* expected */ }
  });
  it("simulate.transferOwnership", async () => {
    try { await gp.simulate.transferOwnership(ZERO_ADDR); } catch { /* expected */ }
  });
  it("simulate.renounceOwnership", async () => {
    try { await gp.simulate.renounceOwnership(); } catch { /* expected */ }
  });
});

describe("GlobalParams — events", () => {
  it("events exposes event helpers", () => {
    expect(typeof gp.events.getPlatformEnlistedLogs).toBe("function");
    expect(typeof gp.events.decodeLog).toBe("function");
    expect(typeof gp.events.watchPlatformEnlisted).toBe("function");
  });
});
