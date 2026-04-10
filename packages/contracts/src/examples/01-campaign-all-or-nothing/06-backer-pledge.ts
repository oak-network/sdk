/**
 * Step 6: Backer Pledges (Backer)
 *
 * Backers can pledge in two ways:
 *
 *   1. `pledgeForAReward` — choose a specific reward tier and pledge
 *      the minimum amount required for that tier
 *   2. `pledgeWithoutAReward` — pledge a flat token amount without
 *      selecting any reward tier
 *
 * In both cases, the treasury transfers the backer's ERC-20 tokens
 * into the treasury and mints an NFT receipt to the backer's wallet.
 * This NFT serves two purposes:
 *   - It proves the pledge and entitles the holder to the reward
 *     (if the campaign succeeds)
 *   - It can be used to claim a full refund (if the campaign fails)
 *
 * Prerequisite: the backer must have already approved the treasury
 * contract to spend their ERC-20 tokens.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

// --- Pledge FOR a reward ---
//
// Alex pledges $100 for the "Signed Print" tier.

const alexOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.ALEX_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.ALL_OR_NOTHING_ADDRESS! as `0x${string}`;
const alexTreasury = alexOak.allOrNothingTreasury(treasuryAddress);

const pledgeToken = process.env.CUSD_TOKEN_ADDRESS! as `0x${string}`;
const shippingFee = 5_000_000n; // $5 shipping
const printReward = keccak256(toHex("signed-print"));

const pledgeTxHash = await alexTreasury.pledgeForAReward(
  process.env.ALEX_ADDRESS! as `0x${string}`,
  pledgeToken,
  shippingFee,
  [printReward],
);

const pledgeReceipt = await alexOak.waitForReceipt(pledgeTxHash);
console.log(`Alex pledged for "Signed Print" at block ${pledgeReceipt.blockNumber}`);

const alexBalance = await alexTreasury.balanceOf(process.env.ALEX_ADDRESS! as `0x${string}`);
console.log("Alex's NFT balance:", alexBalance); // 1n

// --- Pledge WITHOUT a reward ---
//
// Sam wants to support Maya without choosing a tier. He pledges
// a flat $50. He still receives an NFT receipt and is entitled
// to a full refund if the campaign fails.

const samOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.SAM_PRIVATE_KEY! as `0x${string}`,
});

const samTreasury = samOak.allOrNothingTreasury(treasuryAddress);

const samPledgeTxHash = await samTreasury.pledgeWithoutAReward(
  process.env.SAM_ADDRESS! as `0x${string}`,
  pledgeToken,
  50_000_000n, // $50
);

await samOak.waitForReceipt(samPledgeTxHash);
console.log("Sam pledged $50 (no reward)");

const samBalance = await samTreasury.balanceOf(process.env.SAM_ADDRESS! as `0x${string}`);
console.log("Sam's NFT balance:", samBalance); // 1n
