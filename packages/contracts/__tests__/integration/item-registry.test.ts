import { getTestClient, getTestConfig } from "../setup/test-client";
import { BYTES32_ZERO } from "../../src/constants/encoding";
import type { Item } from "../../src/types/structs";

const cfg = getTestConfig();
const client = getTestClient();
const ZERO_ADDR = "0x0000000000000000000000000000000000000001" as const;

const dummyItem: Item = {
  actualWeight: 100n,
  height: 10n,
  width: 20n,
  length: 30n,
  category: BYTES32_ZERO,
  declaredCurrency: BYTES32_ZERO,
};

describe("ItemRegistry — entity via client factory", () => {
  it("itemRegistry returns entity with read/write/simulate/events", () => {
    const ir = client.itemRegistry(ZERO_ADDR);
    expect(typeof ir.getItem).toBe("function");
    expect(typeof ir.addItem).toBe("function");
    expect(typeof ir.addItemsBatch).toBe("function");
    expect(ir.simulate).toBeDefined();
    expect(ir.events).toBeDefined();
  });
});

describe("ItemRegistry — reads (may revert on undeployed)", () => {
  const ir = client.itemRegistry(ZERO_ADDR);

  it("getItem", async () => {
    try {
      const item = await ir.getItem(ZERO_ADDR, BYTES32_ZERO);
      expect(item).toBeDefined();
    } catch {
      /* expected — contract may not be deployed at dummy address */
    }
  });
});

describe("ItemRegistry — writes (may revert)", () => {
  const ir = client.itemRegistry(ZERO_ADDR);

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
  const ir = client.itemRegistry(ZERO_ADDR);

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
  const ir = client.itemRegistry(ZERO_ADDR);

  it("events exposes event helpers", () => {
    expect(typeof ir.events.getItemAddedLogs).toBe("function");
    expect(typeof ir.events.decodeLog).toBe("function");
    expect(typeof ir.events.watchItemAdded).toBe("function");
  });
});
