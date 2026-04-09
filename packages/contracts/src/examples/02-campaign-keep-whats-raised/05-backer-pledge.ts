/**
 * Step 5: Backers Pledge (Backer)
 *
 * Three ways to pledge into a Keep-What's-Raised treasury:
 *
 *   1. `pledgeForAReward` — the backer specifies which reward tier
 *      they want; the pledge amount is determined by the tier value
 *   2. `pledgeWithoutAReward` — the backer contributes a chosen
 *      amount without selecting a reward tier
 *   3. `setFeeAndPledge` — (Platform Admin only) records a payment-
 *      gateway fee and the pledge in a single transaction. Used by
 *      platforms that charge on-ramp fees and want both recorded
 *      atomically. Tokens are transferred from the admin wallet.
 *
 * Additionally, `setPaymentGatewayFee` (Platform Admin only) lets
 * the platform record a gateway fee for an existing pledge.
 *
 * Every pledge requires a unique `pledgeId` (a bytes32 value) and
 * supports an optional `tip` that goes directly to the platform.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.BACKER_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.KEEP_WHATS_RAISED_ADDRESS! as `0x${string}`;
const treasury = oak.keepWhatsRaisedTreasury(treasuryAddress);

const pledgeToken = process.env.CUSD_TOKEN_ADDRESS! as `0x${string}`;
const backerAddress = process.env.BACKER_ADDRESS! as `0x${string}`;
const earlyBirdReward = keccak256(toHex("early-bird"));

// --- Pledge with a reward ---

const pledgeId = keccak256(toHex("pledge-001"));
const pledgeTxHash = await treasury.pledgeForAReward(
  pledgeId,
  backerAddress,
  pledgeToken,
  0n,                 // no tip
  [earlyBirdReward],  // the "Early Bird" reward
);
await oak.waitForReceipt(pledgeTxHash);
console.log("Pledged for Early Bird reward");

// --- Pledge without a reward — pure support ---
// Uses a separate client for the supporter's wallet so that
// msg.sender matches the backer address for token transfers.

const supporterOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.SUPPORTER_PRIVATE_KEY! as `0x${string}`,
});
const supporterTreasury = supporterOak.keepWhatsRaisedTreasury(treasuryAddress);

const supportPledgeId = keccak256(toHex("pledge-002"));
const supporterAddress = process.env.SUPPORTER_ADDRESS! as `0x${string}`;
const noRewardTxHash = await supporterTreasury.pledgeWithoutAReward(
  supportPledgeId,
  supporterAddress,
  pledgeToken,
  50_000_000n,   // $50 pledge amount
  0n,            // no tip
);
await supporterOak.waitForReceipt(noRewardTxHash);
console.log("Pledged without reward");

// --- Set fee and pledge in one call (Platform Admin only) ---

// const platformOak = createOakContractsClient({
//   chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
//   rpcUrl: process.env.RPC_URL!,
//   privateKey: process.env.PLATFORM_PRIVATE_KEY! as `0x${string}`,
// });
// const platformTreasury = platformOak.keepWhatsRaisedTreasury(treasuryAddress);
//
// const feeAndPledgeId = keccak256(toHex("pledge-003"));
// const feeAndPledgeTxHash = await platformTreasury.setFeeAndPledge(
//   feeAndPledgeId,
//   backerAddress,
//   pledgeToken,
//   75_000_000n,   // $75 pledge amount
//   0n,            // tip
//   2_500_000n,    // $2.50 gateway fee
//   [earlyBirdReward],
//   true,          // isPledgeForAReward
// );
// await platformOak.waitForReceipt(feeAndPledgeTxHash);
// console.log("Fee recorded + pledge created in one call");

// --- Record a gateway fee for an existing pledge (Platform Admin only) ---

// const gatewayFee = 1_000_000n; // $1 fee
// const feeTxHash = await platformTreasury.setPaymentGatewayFee(pledgeId, gatewayFee);
// await platformOak.waitForReceipt(feeTxHash);
// console.log("Payment gateway fee recorded for pledge-001");
