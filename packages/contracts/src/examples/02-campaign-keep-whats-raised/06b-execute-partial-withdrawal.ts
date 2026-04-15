/**
 * Step 6b: Execute partial withdrawal (Creator)
 *
 * After Step 6a, the creator withdraws a specific amount of an accepted
 * ERC-20. The contract enforces **withdrawalDelay** seconds between
 * approval and this call (see `configureTreasury` in Step 3).
 *
 * This scenario sets **withdrawalDelay: 0** in `03-configure-treasury.ts`
 * so you can run 6a then 6b immediately. In production, use a positive
 * delay (e.g. 86400n) so backers have a window after approval.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const creatorOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.TECHFORGE_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.KEEP_WHATS_RAISED_ADDRESS! as `0x${string}`;
const creatorTreasury = creatorOak.keepWhatsRaisedTreasury(treasuryAddress);

const withdrawToken = process.env.USDC_TOKEN_ADDRESS! as `0x${string}`;
const withdrawAmount = 2_000_000_000n; // $2,000

const withdrawTxHash = await creatorTreasury.withdraw(withdrawToken, withdrawAmount);
await creatorOak.waitForReceipt(withdrawTxHash);
console.log("Creator withdrew $2,000 for prototyping");
