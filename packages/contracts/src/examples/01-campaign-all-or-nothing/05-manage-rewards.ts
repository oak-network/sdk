/**
 * Step 5: Manage Reward Tiers (Creator)
 *
 * Maya sets up reward tiers for her backers. Each tier has a minimum
 * pledge value. When a backer pledges at a tier, they receive an NFT
 * receipt representing their pledge and chosen reward.
 *
 * This file covers both adding and removing rewards:
 *
 *   - `addRewards` — registers one or more tiers in a single call
 *   - `removeReward` — deletes a tier by its bytes32 name (e.g., if
 *     the creator decides a tier is not cost-effective)
 *   - `getReward` — reads back a tier's details to verify
 *
 * Removing a reward is optional — most campaigns keep their tiers
 * unchanged. Once removed, no new backers can pledge for that tier.
 * Existing pledges for other tiers are unaffected.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.MAYA_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.ALL_OR_NOTHING_ADDRESS! as `0x${string}`;
const treasury = oak.allOrNothingTreasury(treasuryAddress);

// --- Add reward tiers ---

const stickerReward = keccak256(toHex("sticker-pack"));
const printReward = keccak256(toHex("signed-print"));
const originalReward = keccak256(toHex("original-piece"));

const addTxHash = await treasury.addRewards(
  [stickerReward, printReward, originalReward],
  [
    {
      rewardValue: 25_000_000n,       // $25 minimum pledge
      isRewardTier: true,
      itemId: [],
      itemValue: [],
      itemQuantity: [],
    },
    {
      rewardValue: 100_000_000n,      // $100 minimum pledge
      isRewardTier: true,
      itemId: [],
      itemValue: [],
      itemQuantity: [],
    },
    {
      rewardValue: 250_000_000n,      // $250 minimum pledge
      isRewardTier: true,
      itemId: [],
      itemValue: [],
      itemQuantity: [],
    },
  ],
);

await oak.waitForReceipt(addTxHash);
console.log("Reward tiers added: Sticker Pack ($25), Signed Print ($100), Original Piece ($250)");

// --- Remove a reward tier (optional) ---
//
// Maya decides the $25 Sticker Pack tier is not cost-effective.
// She removes it before any backers have pledged for it.

const removeTxHash = await treasury.removeReward(stickerReward);
await oak.waitForReceipt(removeTxHash);
console.log('"Sticker Pack" reward removed');

// Verify the reward no longer exists
const removedReward = await treasury.getReward(stickerReward);
console.log("Removed reward value:", removedReward.rewardValue); // 0n
