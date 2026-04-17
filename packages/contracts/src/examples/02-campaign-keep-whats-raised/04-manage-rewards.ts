/**
 * Step 4: Manage Reward Tiers (Creator)
 *
 * TechForge sets up reward tiers for their backers. Each tier has a
 * minimum pledge value. This file covers both adding and removing:
 *
 *   - `addRewards` — registers one or more tiers in a single call
 *   - `removeReward` — deletes a tier by its bytes32 name
 *   - `getReward` — reads back a tier's details to verify
 *
 * Removing a reward is optional — most campaigns keep their tiers
 * unchanged after publishing.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.TECHFORGE_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.KEEP_WHATS_RAISED_ADDRESS! as `0x${string}`;
const treasury = oak.keepWhatsRaisedTreasury(treasuryAddress);

// --- Add reward tiers ---

const earlyBirdReward = keccak256(toHex("early-bird"));
const proReward = keccak256(toHex("pro-license"));

const addTxHash = await treasury.addRewards(
  [earlyBirdReward, proReward],
  [
    {
      rewardValue: 50_000_000n,       // $50 — Early Bird license
      isRewardTier: true,
      itemId: [],
      itemValue: [],
      itemQuantity: [],
    },
    {
      rewardValue: 200_000_000n,      // $200 — Pro license + priority support
      isRewardTier: true,
      itemId: [],
      itemValue: [],
      itemQuantity: [],
    },
  ],
);

await oak.waitForReceipt(addTxHash);
console.log("Reward tiers added: Early Bird ($50), Pro License ($200)");

// --- Remove a reward tier (optional) ---

// const removeTxHash = await treasury.removeReward(earlyBirdReward);
// await oak.waitForReceipt(removeTxHash);
// console.log('"Early Bird" reward removed');

// --- Verify a reward tier ---

const earlyBirdDetails = await treasury.getReward(earlyBirdReward);
console.log("Early Bird value:", earlyBirdDetails.rewardValue); // 50_000_000n
