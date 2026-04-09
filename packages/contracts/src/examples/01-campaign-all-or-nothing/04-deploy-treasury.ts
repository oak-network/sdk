/**
 * Step 4: Deploy an All-or-Nothing Treasury (Creator)
 *
 * Every campaign needs a treasury — the smart contract that holds all
 * pledged funds until the campaign outcome is decided. Maya deploys an
 * All-or-Nothing treasury through the TreasuryFactory.
 *
 * The factory creates a new treasury clone linked to Maya's campaign
 * and emits a TreasuryDeployed event containing the treasury address.
 * Maya reads this event to discover the address of her new treasury.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.MAYA_PRIVATE_KEY! as `0x${string}`,
});

const treasuryFactory = oak.treasuryFactory(
  process.env.TREASURY_FACTORY_ADDRESS! as `0x${string}`,
);

const platformHash = keccak256(toHex("artfund"));
const campaignInfoAddress = process.env.CAMPAIGN_INFO_ADDRESS! as `0x${string}`;
const allOrNothingImplementationId = 0n;

const deployTxHash = await treasuryFactory.deploy(
  platformHash,
  campaignInfoAddress,
  allOrNothingImplementationId,
);

const deployReceipt = await oak.waitForReceipt(deployTxHash);
console.log(`Treasury deployed at block ${deployReceipt.blockNumber}`);

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

console.log("All-or-Nothing treasury deployed at:", treasuryAddress);
