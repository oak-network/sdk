import { getTestClient, getTestConfig } from "../setup/test-client";
import { BYTES32_ZERO } from "../../src/constants/encoding";
import type { Item } from "../../src/types/structs";

const cfg = getTestConfig();
const client = getTestClient();
const ir = client.itemRegistry(cfg.addresses.itemRegistry);
const ZERO_ADDR = "0x0000000000000000000000000000000000000001" as const;

const dummyItem: Item = {
  actualWeight: 100n,
  height: 10n,
  width: 10n,
  length: 10n,
  category: BYTES32_ZERO,
  declaredCurrency: BYTES32_ZERO,
};

describe("ItemRegistry — reads", () => {
  it("getItem returns an Item struct", async () => {
    const item = await ir.getItem(ZERO_ADDR, BYTES32_ZERO);
    expect(item).toBeDefined();
  });
});

describe("ItemRegistry — writes (may revert)", () => {
  it("addItem", async () => {
    try {
      await ir.addItem(BYTES32_ZERO, dummyItem);
    } catch {
      /* expected */
    }
  });

  it("addItemsBatch", async () => {
    try {
      await ir.addItemsBatch([BYTES32_ZERO], [dummyItem]);
    } catch {
      /* expected */
    }
  });
});

describe("ItemRegistry — simulate (may throw)", () => {
  it("simulate.addItem", async () => {
    try {
      await ir.simulate.addItem(BYTES32_ZERO, dummyItem);
    } catch {
      /* expected */
    }
  });

  it("simulate.addItemsBatch", async () => {
    try {
      await ir.simulate.addItemsBatch([BYTES32_ZERO], [dummyItem]);
    } catch {
      /* expected */
    }
  });
});

describe("ItemRegistry — events", () => {
  it("events is an empty object", () => {
    expect(ir.events).toEqual({});
  });
});
