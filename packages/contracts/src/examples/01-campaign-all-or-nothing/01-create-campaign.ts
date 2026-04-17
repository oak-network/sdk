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
 * After creation the factory emits a CampaignCreated event that contains
 * the deployed CampaignInfo address. We show two ways to discover it:
 *
 *   1. **Receipt-based (recommended)** — decode the event from the
 *      transaction receipt. This is deterministic and works immediately.
 *   2. **Lookup-based (convenience)** — call `identifierToCampaignInfo`
 *      on the factory. Note: on some RPC providers the state may not be
 *      indexed instantly, so this can briefly return a zero address.
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

// ── Approach 1: Decode CampaignCreated from the receipt (recommended) ──
let campaignInfoAddress: `0x${string}` | undefined;

for (const log of receipt.logs) {
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
