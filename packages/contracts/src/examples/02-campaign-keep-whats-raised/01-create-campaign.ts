/**
 * Step 1: Create the Campaign (Creator)
 *
 * TechForge wants to raise $10,000 over 60 days to fund their
 * open-source code review tool. They create the campaign through
 * the CampaignInfoFactory on the ArtFund platform.
 *
 * After creation, they immediately look up the deployed CampaignInfo
 * contract address using the identifier hash — this address is needed
 * for all subsequent steps (deploying the treasury, adding rewards, etc.).
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
  privateKey: process.env.TECHFORGE_PRIVATE_KEY! as `0x${string}`,
});

const factory = oak.campaignInfoFactory(
  process.env.CAMPAIGN_INFO_FACTORY_ADDRESS! as `0x${string}`,
);

const platformHash = keccak256(toHex("artfund"));
const identifierHash = keccak256(toHex("techforge-devtool-2026"));
const currency = toHex("USD", { size: 32 });
const now = getCurrentTimestamp();

const createTxHash = await factory.createCampaign({
  creator: process.env.TECHFORGE_ADDRESS! as `0x${string}`,
  identifierHash,
  selectedPlatformHash: [platformHash],
  campaignData: {
    launchTime: now + 1800n,       // launches in 30 minutes
    deadline: addDays(now, 60),    // 60-day campaign
    goalAmount: 10_000_000_000n,   // $10,000
    currency,
  },
  nftName: "TechForge Early Backers",
  nftSymbol: "TFEB",
  nftImageURI: "ipfs://QmAbc.../techforge.png",
  contractURI: "ipfs://QmAbc.../metadata.json",
});

await oak.waitForReceipt(createTxHash);

const campaignInfoAddress = await factory.identifierToCampaignInfo(identifierHash);
console.log("Campaign at:", campaignInfoAddress);
