/**
 * Step 4: Handle Read-Only Client Restrictions
 *
 * When using a read-only client (no private key), write methods
 * throw immediately with "No signer configured" without making
 * an RPC call. Build your UI to handle this gracefully.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const readOnlyOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
});

const campaign = readOnlyOak.campaignInfo(
  process.env.CAMPAIGN_INFO_ADDRESS! as `0x${string}`,
);

// Reads work fine
const goalAmount = await campaign.getGoalAmount();
console.log("Goal amount:", goalAmount);

const deadline = await campaign.getDeadline();
console.log("Deadline:", new Date(Number(deadline) * 1000).toISOString());

// Writes throw immediately
try {
  await campaign.updateGoalAmount(2_000_000_000n);
} catch (error) {
  if ((error as Error).message.startsWith("No signer configured")) {
    console.error("Connect your wallet to perform this action.");
  }
}
