/**
 * Step 6: Non-Blocking Receipt Lookup
 *
 * `oak.getReceipt(txHash)` fetches the receipt for an already-mined
 * transaction without blocking. Unlike `waitForReceipt` — which
 * polls until the transaction is included in a block — `getReceipt`
 * returns immediately with the receipt or `null` if the transaction
 * has not been mined yet.
 *
 * Use this when you already have a transaction hash from a webhook,
 * an indexer, a database, or a previous user session, and you want
 * to check its status without waiting.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
});

const txHash = process.env.PREVIOUS_TX_HASH! as `0x${string}`;

const receipt = await oak.getReceipt(txHash);

if (receipt) {
  console.log("Transaction mined at block:", receipt.blockNumber);
  console.log("Gas used:", receipt.gasUsed);
  console.log("Log count:", receipt.logs.length);
} else {
  console.log("Transaction not yet mined — try again later");
}
