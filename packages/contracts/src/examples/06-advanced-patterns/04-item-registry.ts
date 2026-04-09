/**
 * Step 4: Register Physical Items in the Item Registry
 *
 * For campaigns that ship physical products, use the ItemRegistry
 * to register item metadata (dimensions, weight, category) on-chain.
 * Supports single and batch registration.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";
import type { Item } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PRIVATE_KEY! as `0x${string}`,
});

const itemRegistry = oak.itemRegistry(
  process.env.ITEM_REGISTRY_ADDRESS! as `0x${string}`,
);

// --- Single item registration ---

const vaseItemId = keccak256(toHex("handcrafted-vase-001"));

const vaseItem: Item = {
  actualWeight: 2500n,     // 2500 grams (2.5 kg)
  height: 300n,            // 300 mm
  width: 150n,             // 150 mm
  length: 150n,            // 150 mm
  category: keccak256(toHex("ceramics")),
  declaredCurrency: toHex("USD", { size: 32 }),
};

const txHash = await itemRegistry.addItem(vaseItemId, vaseItem);
await oak.waitForReceipt(txHash);
console.log("Vase registered in the item registry");

// Read back the item
const storedItem = await itemRegistry.getItem(
  process.env.CREATOR_ADDRESS! as `0x${string}`,
  vaseItemId,
);
console.log("Weight:", storedItem.actualWeight, "grams");
console.log("Dimensions:", storedItem.height, "x", storedItem.width, "x", storedItem.length, "mm");

// --- Batch registration ---

const item1Id = keccak256(toHex("sticker-pack-001"));
const item2Id = keccak256(toHex("signed-print-001"));

const item1: Item = {
  actualWeight: 50n,
  height: 150n,
  width: 100n,
  length: 5n,
  category: keccak256(toHex("paper-goods")),
  declaredCurrency: toHex("USD", { size: 32 }),
};

const item2: Item = {
  actualWeight: 200n,
  height: 400n,
  width: 300n,
  length: 10n,
  category: keccak256(toHex("art-prints")),
  declaredCurrency: toHex("USD", { size: 32 }),
};

const batchTxHash = await itemRegistry.addItemsBatch(
  [item1Id, item2Id],
  [item1, item2],
);
await oak.waitForReceipt(batchTxHash);
console.log("2 items registered in a single transaction");
