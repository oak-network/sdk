/**
 * Step 7: Monitor Campaign Progress (Anyone)
 *
 * One of the strengths of on-chain crowdfunding is transparency.
 * Anyone — Maya, her backers, journalists, or curious visitors —
 * can check the campaign's progress at any time using read-only
 * calls. No wallet or private key is needed, just an RPC endpoint.
 *
 * This step combines reads from both the CampaignInfo contract
 * (goal, deadline, currency) and the AllOrNothing treasury
 * (raised amount, lifetime raised, refunded, platform hash, fees,
 * reward tiers, paused/cancelled state).
 *
 * This is the kind of data a campaign dashboard would display:
 * progress percentage, total raised, days remaining, treasury
 * health, and whether the goal has been reached.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
});

const campaignInfoAddress = process.env.CAMPAIGN_INFO_ADDRESS! as `0x${string}`;
const treasuryAddress = process.env.ALL_OR_NOTHING_ADDRESS! as `0x${string}`;

const campaign = oak.campaignInfo(campaignInfoAddress);
const treasury = oak.allOrNothingTreasury(treasuryAddress);

// --- CampaignInfo reads ---
const goalAmount = await campaign.getGoalAmount();
const deadline = await campaign.getDeadline();
const now = BigInt(Math.floor(Date.now() / 1000));

// --- Treasury reads ---
const raisedAmount = await treasury.getRaisedAmount();
const lifetimeRaised = await treasury.getLifetimeRaisedAmount();
const refundedAmount = await treasury.getRefundedAmount();
const platformHash = await treasury.getPlatformHash();
const platformFeePercent = await treasury.getPlatformFeePercent();
const isPaused = await treasury.paused();
const isCancelled = await treasury.cancelled();

// Inspect a specific reward tier
const printReward = keccak256(toHex("signed-print"));
const rewardDetails = await treasury.getReward(printReward);

// --- Dashboard output ---
const progressPercent = goalAmount > 0n ? Number((raisedAmount * 100n) / goalAmount) : 0;
const daysRemaining = deadline > now ? Number((deadline - now) / 86400n) : 0;

console.log("=== Campaign Dashboard ===");
console.log(`Goal: $${Number(goalAmount) / 1_000_000}`);
console.log(`Raised: $${Number(raisedAmount) / 1_000_000} (${progressPercent}%)`);
console.log(`Lifetime Raised: $${Number(lifetimeRaised) / 1_000_000}`);
console.log(`Refunded: $${Number(refundedAmount) / 1_000_000}`);
console.log(`Days Remaining: ${daysRemaining}`);
console.log(`Goal Reached: ${raisedAmount >= goalAmount ? "YES" : "Not yet"}`);
console.log(`Platform Hash: ${platformHash}`);
console.log(`Platform Fee: ${Number(platformFeePercent)} basis points`);
console.log(`Treasury Paused: ${isPaused}`);
console.log(`Treasury Cancelled: ${isCancelled}`);
console.log(`"Signed Print" reward value: $${Number(rewardDetails.rewardValue) / 1_000_000}`);
