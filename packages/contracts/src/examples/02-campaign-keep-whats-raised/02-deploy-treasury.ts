/**
 * Step 2: Deploy a Keep-What's-Raised Treasury (Creator)
 *
 * TechForge deploys a Keep-What's-Raised treasury for their campaign.
 * This treasury model allows the creator to keep whatever funds are
 * raised, even if the full goal is not met — unlike All-or-Nothing,
 * which requires the goal to be reached before any funds are released.
 *
 * After deployment, TechForge reads the TreasuryDeployed event to
 * discover the treasury contract address.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.TECHFORGE_PRIVATE_KEY! as `0x${string}`,
});

const treasuryFactory = oak.treasuryFactory(
  process.env.TREASURY_FACTORY_ADDRESS! as `0x${string}`,
);

const platformHash = keccak256(toHex("artfund"));
const campaignInfoAddress = process.env.CAMPAIGN_INFO_ADDRESS! as `0x${string}`;
const kwrImplementationId = 1n;

const deployTxHash = await treasuryFactory.deploy(
  platformHash,
  campaignInfoAddress,
  kwrImplementationId,
);

const deployReceipt = await oak.waitForReceipt(deployTxHash);

// Decode the TreasuryDeployed event directly from the receipt.
// Using receipt.logs guarantees we only see events from our transaction,
// avoiding ambiguity when multiple deploys land in the same block.
let treasuryAddress: `0x${string}` | undefined;

for (const log of deployReceipt.logs) {
  try {
    const decoded = treasuryFactory.events.decodeLog({
      topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
      data: log.data as `0x${string}`,
    });

    if (decoded.eventName === "TreasuryFactoryTreasuryDeployed") {
      treasuryAddress = decoded.args?.treasuryAddress as `0x${string}`;
      break;
    }
  } catch {
    // Log belongs to a different contract — skip
  }
}

console.log("KWR Treasury at:", treasuryAddress);
