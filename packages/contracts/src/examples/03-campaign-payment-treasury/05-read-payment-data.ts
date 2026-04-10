/**
 * Step 5: Read Payment and Treasury Data (Anyone)
 *
 * All payment and treasury data is stored on-chain and publicly
 * readable. No wallet connection is required — just an RPC endpoint.
 *
 * This step covers:
 *
 *   - `getPaymentData` — full snapshot of a specific payment including
 *     buyer address, amount, confirmation status, and line item breakdown
 *   - Treasury-level reads — raised amount, available balance, expected
 *     pending amount, lifetime raised, refunded total, and cancellation
 *     status
 *
 * Useful for building order detail pages, customer support dashboards,
 * treasury monitoring tools, or audit reports.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
});

const paymentTreasury = oak.paymentTreasury(
  process.env.PAYMENT_TREASURY_ADDRESS! as `0x${string}`,
);

// --- Read a specific payment ---

const paymentId = keccak256(toHex("order-12345"));
const paymentData = await paymentTreasury.getPaymentData(paymentId);

console.log("=== Payment Details ===");
console.log("Buyer:", paymentData.buyerAddress);
console.log("Amount:", Number(paymentData.amount) / 1_000_000);
console.log("Confirmed:", paymentData.isConfirmed);
console.log("Is crypto payment:", paymentData.isCryptoPayment);
console.log("Token:", paymentData.paymentToken);
console.log("Expiration:", new Date(Number(paymentData.expiration) * 1000).toISOString());

for (const item of paymentData.lineItems) {
  console.log(`  Line item: $${Number(item.amount) / 1_000_000}`);
}

// --- Treasury-level reads ---

const platformHash = await paymentTreasury.getPlatformHash();
const feePercent = await paymentTreasury.getPlatformFeePercent();
const raised = await paymentTreasury.getRaisedAmount();
const available = await paymentTreasury.getAvailableRaisedAmount();
const expected = await paymentTreasury.getExpectedAmount();
const lifetime = await paymentTreasury.getLifetimeRaisedAmount();
const refunded = await paymentTreasury.getRefundedAmount();
const isCancelled = await paymentTreasury.cancelled();

console.log("\n=== Treasury Dashboard ===");
console.log(`Platform: ${platformHash}`);
console.log(`Fee: ${Number(feePercent)} bps`);
console.log(`Raised: $${Number(raised) / 1_000_000}`);
console.log(`Available: $${Number(available) / 1_000_000}`);
console.log(`Expected (pending): $${Number(expected) / 1_000_000}`);
console.log(`Lifetime raised: $${Number(lifetime) / 1_000_000}`);
console.log(`Refunded: $${Number(refunded) / 1_000_000}`);
console.log(`Cancelled: ${isCancelled}`);
