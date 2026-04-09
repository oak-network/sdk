/**
 * Step 3: Watch for Real-Time Events (Platform)
 *
 * After loading historical data in Steps 1 and 2, ArtFund subscribes
 * to live events so the dashboard updates instantly as new activity
 * happens on-chain. Watchers use WebSocket connections under the hood
 * and fire a callback every time a matching event is emitted.
 *
 * Each watcher returns an `unwatch` function that should be called
 * when the component unmounts or the page navigates away, to avoid
 * memory leaks and unnecessary RPC connections.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
});

const factory = oak.campaignInfoFactory(
  process.env.CAMPAIGN_INFO_FACTORY_ADDRESS! as `0x${string}`,
);

const treasuryAddress = process.env.ALL_OR_NOTHING_ADDRESS! as `0x${string}`;
const treasury = oak.allOrNothingTreasury(treasuryAddress);

// Watch for new campaigns
const unwatchCampaigns = factory.events.watchCampaignCreated((logs) => {
  for (const log of logs) {
    console.log("NEW CAMPAIGN:", log.args);
  }
});

// Watch for new pledges
const unwatchPledges = treasury.events.watchReceipt((logs) => {
  for (const log of logs) {
    console.log("NEW PLEDGE:", log.args);
  }
});

// Watch for platform-level events
const gp = oak.globalParams(process.env.GLOBAL_PARAMS_ADDRESS! as `0x${string}`);

const unwatchPlatforms = gp.events.watchPlatformEnlisted((logs) => {
  for (const log of logs) {
    console.log("NEW PLATFORM:", log.args);
  }
});

// Clean up when the dashboard unmounts — call this on page
// navigation or component teardown to stop WebSocket subscriptions
export function cleanup() {
  unwatchCampaigns();
  unwatchPledges();
  unwatchPlatforms();
  console.log("All watchers stopped");
}

// To stop watchers after a timeout (for testing):
// setTimeout(() => cleanup(), 60_000);
