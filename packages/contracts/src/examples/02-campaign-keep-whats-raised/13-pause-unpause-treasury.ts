/**
 * Step 13: Pause and Unpause the Treasury (Platform Admin) — Optional
 *
 * The platform temporarily freezes all treasury activity — no new
 * pledges, withdrawals, or refunds — while investigating an issue.
 *
 * `pauseTreasury(message)` takes a bytes32 reason code emitted in
 * the Paused event. `unpauseTreasury(message)` resumes operations.
 *
 * The `paused()` read method returns true while the treasury is frozen.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const platformOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PLATFORM_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.KEEP_WHATS_RAISED_ADDRESS! as `0x${string}`;
const treasury = platformOak.keepWhatsRaisedTreasury(treasuryAddress);

// Pause
const pauseReason = keccak256(toHex("compliance-review"));
const pauseTxHash = await treasury.pauseTreasury(pauseReason);
await platformOak.waitForReceipt(pauseTxHash);
console.log("Treasury paused:", await treasury.paused()); // true

// Unpause
const unpauseReason = keccak256(toHex("review-cleared"));
const unpauseTxHash = await treasury.unpauseTreasury(unpauseReason);
await platformOak.waitForReceipt(unpauseTxHash);
console.log("Treasury paused:", await treasury.paused()); // false
