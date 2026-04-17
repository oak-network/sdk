/**
 * Step 1: Create a Campaign (Platform Admin / Creator)
 *
 * Before deploying a PaymentTreasury, CeloMarket needs a CampaignInfo
 * contract. The CampaignInfoFactory deploys one and links it to the
 * platform — it will later hold NFT receipts for crypto payments.
 *
 * The factory emits a CampaignCreated event containing the deployed
 * CampaignInfo address. Two ways to discover it:
 *
 *   1. **Receipt-based (recommended)** — decode the event from the
 *      transaction receipt. Deterministic, works immediately.
 *   2. **Lookup-based (convenience)** — call `identifierToCampaignInfo`.
 *      On some RPC providers the state may not be indexed instantly,
 *      so this can briefly return a zero address.
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
  privateKey: process.env.CELOMARKET_ADMIN_PRIVATE_KEY! as `0x${string}`,
});

const factory = oak.campaignInfoFactory(
  process.env.CAMPAIGN_INFO_FACTORY_ADDRESS! as `0x${string}`,
);

const platformHash = keccak256(toHex("celomarket"));
const identifierHash = keccak256(toHex("celomarket-storefront-2026"));
const currency = toHex("USD", { size: 32 });
const now = getCurrentTimestamp();

const txHash = await factory.createCampaign({
  creator: process.env.CELOMARKET_ADMIN_ADDRESS! as `0x${string}`,
  identifierHash,
  selectedPlatformHash: [platformHash],
  campaignData: {
    launchTime: now,
    deadline: addDays(now, 365),    // storefront open for 1 year
    goalAmount: 0n,                 // no funding goal for e-commerce
    currency,
  },
  nftName: "CeloMarket Receipts",
  nftSymbol: "CMR",
  nftImageURI: "ipfs://QmXyz.../celomarket-receipt.png",
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
const lookedUp = await factory.identifierToCampaignInfo(identifierHash);
console.log("CampaignInfo (from lookup):", lookedUp);
