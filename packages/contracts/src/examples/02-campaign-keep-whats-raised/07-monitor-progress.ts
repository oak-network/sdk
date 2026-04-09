/**
 * Step 7: Monitor Campaign Progress (Anyone)
 *
 * Anyone can check the campaign's progress at any time using read-only
 * calls. No wallet or private key is needed, just an RPC endpoint.
 *
 * This step reads from both the CampaignInfo contract (goal, deadline)
 * and the KeepWhatsRaised treasury (raised amounts, fees, state).
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
});

const treasuryAddress = process.env.KEEP_WHATS_RAISED_ADDRESS! as `0x${string}`;
const treasury = oak.keepWhatsRaisedTreasury(treasuryAddress);

// Treasury reads
const raisedAmount = await treasury.getRaisedAmount();
const lifetimeRaised = await treasury.getLifetimeRaisedAmount();
const refundedAmount = await treasury.getRefundedAmount();
const availableRaised = await treasury.getAvailableRaisedAmount();
const platformHash = await treasury.getPlatformHash();
const platformFeePercent = await treasury.getPlatformFeePercent();
const goalAmount = await treasury.getGoalAmount();
const deadline = await treasury.getDeadline();
const launchTime = await treasury.getLaunchTime();
const isPaused = await treasury.paused();
const isCancelled = await treasury.cancelled();
const withdrawalApproved = await treasury.getWithdrawalApprovalStatus();

// Inspect a specific reward tier
const earlyBirdReward = keccak256(toHex("early-bird"));
const rewardDetails = await treasury.getReward(earlyBirdReward);

// Fee reads
const flatFeeKey = keccak256(toHex("flatWithdrawalFee"));
const flatFeeValue = await treasury.getFeeValue(flatFeeKey);

// Payment gateway fee for a specific pledge
const pledgeId = keccak256(toHex("pledge-001"));
const gatewayFee = await treasury.getPaymentGatewayFee(pledgeId);

const now = BigInt(Math.floor(Date.now() / 1000));
const progressPercent = goalAmount > 0n ? Number((raisedAmount * 100n) / goalAmount) : 0;
const daysRemaining = deadline > now ? Number((deadline - now) / 86400n) : 0;

console.log("=== Campaign Dashboard ===");
console.log(`Goal: $${Number(goalAmount) / 1_000_000}`);
console.log(`Raised: $${Number(raisedAmount) / 1_000_000} (${progressPercent}%)`);
console.log(`Available for withdrawal: $${Number(availableRaised) / 1_000_000}`);
console.log(`Lifetime raised: $${Number(lifetimeRaised) / 1_000_000}`);
console.log(`Refunded: $${Number(refundedAmount) / 1_000_000}`);
console.log(`Launch: ${new Date(Number(launchTime) * 1000).toISOString()}`);
console.log(`Days remaining: ${daysRemaining}`);
console.log(`Platform hash: ${platformHash}`);
console.log(`Platform fee: ${Number(platformFeePercent)} bps`);
console.log(`Flat withdrawal fee: $${Number(flatFeeValue) / 1_000_000}`);
console.log(`Gateway fee for pledge-001: $${Number(gatewayFee) / 1_000_000}`);
console.log(`Withdrawal approved: ${withdrawalApproved}`);
console.log(`Paused: ${isPaused}`);
console.log(`Cancelled: ${isCancelled}`);
console.log(`"Early Bird" reward value: $${Number(rewardDetails.rewardValue) / 1_000_000}`);
