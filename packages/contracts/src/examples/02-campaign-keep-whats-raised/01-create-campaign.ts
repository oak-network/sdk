/**
 * Step 1: Create the Campaign (Creator)
 *
 * TechForge wants to raise $10,000 over 60 days to fund their
 * open-source code review tool. They create the campaign through
 * the CampaignInfoFactory on the ArtFund platform.
 *
 * After creation we discover the deployed CampaignInfo address — this
 * address is needed for all subsequent steps (deploying the treasury,
 * adding rewards, etc.). Two approaches are shown:
 *
 *   1. **Receipt-based (recommended)** — decode the CampaignCreated
 *      event from the transaction receipt. Deterministic, works
 *      immediately regardless of RPC indexing lag.
 *   2. **Lookup-based (convenience)** — call `identifierToCampaignInfo`.
 *      Note: on some RPC providers the state may not be indexed
 *      instantly after the transaction, briefly returning a zero address.
 *
 * Multi-token: the campaign `currency` resolves to accepted ERC-20
 * addresses; pledges and `withdraw(token, amount)` use tokens from that
 * whitelist only. This example uses one token for simplicity.
 */

import {
  createOakContractsClient,
  keccak256,
  toHex,
  getCurrentTimestamp,
  addDays,
  CHAIN_IDS,
  CAMPAIGN_INFO_FACTORY_EVENTS,
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

const createReceipt = await oak.waitForReceipt(createTxHash);
console.log(`Campaign created at block ${createReceipt.blockNumber}`);

// ── Approach 1: Decode CampaignCreated from the receipt (recommended) ──
let campaignInfoAddress: `0x${string}` | undefined;

for (const log of createReceipt.logs) {
  try {
    const decoded = factory.events.decodeLog({
      topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
      data: log.data as `0x${string}`,
    });

    if (decoded.eventName === CAMPAIGN_INFO_FACTORY_EVENTS.CampaignCreated) {
      campaignInfoAddress = decoded.args?.campaignInfoAddress as `0x${string}`;
      break;
    }
  } catch {
    // Log belongs to a different contract — skip
  }
}

console.log("CampaignInfo (from receipt):", campaignInfoAddress);

// ── Approach 2: Lookup via identifierToCampaignInfo (convenience) ──
// Handy when you only have the identifier and did not keep the receipt.
// On some RPC providers this may briefly return the zero address right
// after the transaction — prefer Approach 1 when the receipt is available.
const lookedUp = await factory.identifierToCampaignInfo(identifierHash);
console.log("CampaignInfo (from lookup):", lookedUp);
