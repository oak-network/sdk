/**
 * Step 1: Create a Campaign (Creator)
 *
 * Maya wants to crowdfund $5,000 for her "Earth & Fire" ceramic collection.
 * She creates the campaign through the CampaignInfoFactory, which deploys
 * a new CampaignInfo contract on-chain. The campaign includes:
 *
 *   - A $5,000 funding goal (in 6-decimal token units)
 *   - A 30-day deadline from today
 *   - ArtFund as the selected platform (identified by its platform hash)
 *   - NFT metadata so each backer receives a collectible receipt
 *
 * Multi-token: the campaign `currency` resolves to one or more accepted
 * ERC-20 addresses on-chain; later pledges must use `pledgeToken` in that
 * whitelist (`CampaignInfo.isTokenAccepted`). This example uses one token.
 *
 * The factory assigns a unique contract address to the campaign, which
 * Maya will look up in the next step.
 */

import {
  createOakContractsClient,
  keccak256,
  toHex,
  getCurrentTimestamp,
  addDays,
  CHAIN_IDS,
} from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.MAYA_PRIVATE_KEY! as `0x${string}`,
});

const factory = oak.campaignInfoFactory(
  process.env.CAMPAIGN_INFO_FACTORY_ADDRESS! as `0x${string}`,
);

const platformHash = keccak256(toHex("artfund"));
const identifierHash = keccak256(toHex("earth-and-fire-2026"));
const currency = toHex("USD", { size: 32 });
const now = getCurrentTimestamp();

const txHash = await factory.createCampaign({
  creator: process.env.MAYA_ADDRESS! as `0x${string}`,
  identifierHash,
  selectedPlatformHash: [platformHash],
  campaignData: {
    launchTime: now + 3600n,       // launches 1 hour from now
    deadline: addDays(now, 30),    // 30-day campaign
    goalAmount: 5_000_000_000n,    // $5,000 (assuming 6-decimal token)
    currency,
  },
  nftName: "Earth & Fire Backers",
  nftSymbol: "EF26",
  nftImageURI: "ipfs://QmXyz.../earth-fire.png",
  contractURI: "ipfs://QmXyz.../metadata.json",
});

const receipt = await oak.waitForReceipt(txHash);
console.log(`Campaign created at block ${receipt.blockNumber}`);
