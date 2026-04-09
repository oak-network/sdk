/**
 * Step 4: Decode Raw Logs (Developer)
 *
 * In some workflows, you receive raw log data from a transaction
 * receipt or an external indexer (like The Graph or a custom backend).
 * These logs contain encoded topics and data that are not human-readable.
 *
 * The SDK provides a `decodeLog` method on every entity's events object.
 * Pass in the raw log and it returns a typed event with the event name
 * and decoded arguments — no manual ABI parsing needed.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
});

const factory = oak.campaignInfoFactory(
  process.env.CAMPAIGN_INFO_FACTORY_ADDRESS! as `0x${string}`,
);

// Decode logs from a transaction receipt
const someTxHash = "0x..." as `0x${string}`;
const receipt = await oak.waitForReceipt(someTxHash);

for (const log of receipt.logs) {
  try {
    const decoded = factory.events.decodeLog({
      topics: log.topics,
      data: log.data,
    });

    console.log(`Event: ${decoded.eventName}`);
    console.log(`Args:`, decoded.args);
  } catch {
    // Log belongs to a different contract — skip silently
  }
}
