/**
 * Step 5: Simulate-Then-Send Pattern for UI
 *
 * A reusable pattern that simulates a transaction, shows the user
 * what will happen, and only sends after simulation passes.
 * Reverts are caught and displayed as user-friendly error messages.
 */

import {
  createOakContractsClient,
  keccak256,
  toHex,
  CHAIN_IDS,
  parseContractError,
  getRevertData,
} from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PRIVATE_KEY! as `0x${string}`,
});

async function safeTransaction(
  description: string,
  simulateFn: () => Promise<unknown>,
  executeFn: () => Promise<`0x${string}`>,
) {
  console.log(`Preparing: ${description}`);

  // Step 1: Simulate
  try {
    await simulateFn();
    console.log("Simulation passed — transaction will succeed");
  } catch (error) {
    const revertData = getRevertData(error);
    const parsed = revertData ? parseContractError(revertData) : null;

    if (parsed) {
      console.error(`Transaction would fail: ${parsed.name}`);
      console.error(parsed.recoveryHint || "No recovery hint available");
    } else {
      console.error("Transaction would fail:", (error as Error).message);
    }
    return null;
  }

  // Step 2: Execute
  const txHash = await executeFn();
  const receipt = await oak.waitForReceipt(txHash);
  console.log(`Success at block ${receipt.blockNumber}`);
  return receipt;
}

// Usage: simulate then send a campaign update
const campaign = oak.campaignInfo(process.env.CAMPAIGN_INFO_ADDRESS! as `0x${string}`);
const newDeadline = BigInt(Math.floor(Date.now() / 1000)) + 86400n * 45n; // 45 days from now

await safeTransaction(
  "Update campaign deadline",
  () => campaign.simulate.updateDeadline(newDeadline),
  () => campaign.updateDeadline(newDeadline),
);
