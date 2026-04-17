/**
 * Step 1: Fetch Historical Campaign Events (Platform)
 *
 * When ArtFund's dashboard loads for the first time, it needs to
 * display all campaigns that have ever been created on the platform.
 * This is done by querying the CampaignInfoFactory for historical
 * CampaignCreated events starting from block 0.
 *
 * In production, you would typically store the last synced block
 * number and only fetch new events on subsequent loads.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
});

const factory = oak.campaignInfoFactory(
  process.env.CAMPAIGN_INFO_FACTORY_ADDRESS! as `0x${string}`,
);

const campaignLogs = await factory.events.getCampaignCreatedLogs({
  fromBlock: 0n,
});

console.log(`Found ${campaignLogs.length} campaigns`);

for (const log of campaignLogs) {
  console.log("Campaign:", log.args);
}
