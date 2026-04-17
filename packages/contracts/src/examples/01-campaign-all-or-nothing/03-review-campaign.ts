/**
 * Step 3: Review Campaign Details (Creator)
 *
 * Before sharing the campaign link with her community, Maya reads back
 * the on-chain campaign details to confirm everything matches her intent:
 * launch time, deadline, funding goal, currency, selected platforms,
 * and the protocol configuration (treasury factory address, protocol fee).
 *
 * This verification step is good practice — it catches configuration
 * mistakes before backers start pledging.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.MAYA_PRIVATE_KEY! as `0x${string}`,
});

const campaignInfoAddress = process.env.CAMPAIGN_INFO_ADDRESS! as `0x${string}`;
const campaign = oak.campaignInfo(campaignInfoAddress);

const launchTime = await campaign.getLaunchTime();
const deadline = await campaign.getDeadline();
const goalAmount = await campaign.getGoalAmount();
const campaignCurrency = await campaign.getCampaignCurrency();

console.log("Launch:", new Date(Number(launchTime) * 1000).toISOString());
console.log("Deadline:", new Date(Number(deadline) * 1000).toISOString());
console.log("Goal: $", Number(goalAmount) / 1_000_000);
console.log("Currency:", campaignCurrency);

const platformHash = keccak256(toHex("artfund"));
const isPlatformSelected = await campaign.checkIfPlatformSelected(platformHash);
console.log("ArtFund selected:", isPlatformSelected);

const config = await campaign.getCampaignConfig();
console.log("Treasury factory:", config.treasuryFactory);
console.log("Protocol fee:", Number(config.protocolFeePercent), "bps");
