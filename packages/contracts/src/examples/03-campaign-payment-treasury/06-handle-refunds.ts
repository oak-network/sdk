/**
 * Step 6: Handle Refunds (Platform Admin / Buyer)
 *
 * Suppose the vase arrives damaged. Sam contacts CeloMarket's support
 * team, and they decide to issue a refund. The mechanism depends on
 * how the payment was originally made:
 *
 * **For off-chain payments (`createPayment`):**
 *
 *   1. The platform admin cancels the payment (`cancelPayment`)
 *   2. The platform admin directs the refund to a specific address
 *      using `claimRefund(paymentId, refundAddress)` — this is for
 *      non-NFT payments only (the contract verifies `tokenId == 0`)
 *
 * **For on-chain crypto payments (`processCryptoPayment`):**
 *
 *   1. The buyer (NFT owner) calls `claimRefundSelf(paymentId)` — the
 *      contract looks up the NFT minted at payment time, verifies the
 *      caller owns it, burns the NFT, and sends the refundable amount
 *      to the current NFT owner
 *
 * In both cases, only line items marked as `canRefund: true` at
 * creation time are returned. Non-refundable line items (e.g.,
 * shipping) are not included in the refund amount.
 *
 * Note: `claimRefundSelf` burns the NFT automatically — there is
 * no need to call burn separately.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

// ============================================================
// A. Off-chain payment refund (Platform Admin)
// ============================================================
//
// For payments created via `createPayment` — no NFT was minted.
// The platform admin cancels and directs the refund.

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PLATFORM_PRIVATE_KEY! as `0x${string}`,
});

const paymentTreasury = oak.paymentTreasury(
  process.env.PAYMENT_TREASURY_ADDRESS! as `0x${string}`,
);

const paymentId = keccak256(toHex("order-12345"));

// Step 1: Cancel the payment
const cancelTxHash = await paymentTreasury.cancelPayment(paymentId);
await oak.waitForReceipt(cancelTxHash);
console.log("Payment cancelled");

// Step 2: Direct the refund to the buyer's address (platform admin only)
const refundTxHash = await paymentTreasury.claimRefund(
  paymentId,
  process.env.SAM_ADDRESS! as `0x${string}`,
);
await oak.waitForReceipt(refundTxHash);
console.log("Refund sent to Sam's address");

// ============================================================
// B. On-chain crypto payment refund (NFT Owner)
// ============================================================
//
// For payments made via `processCryptoPayment` — an NFT was minted
// to the buyer. The buyer (current NFT owner) claims the refund
// themselves. The contract burns the NFT and sends tokens to the
// NFT owner.

// const samOak = createOakContractsClient({
//   chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
//   rpcUrl: process.env.RPC_URL!,
//   privateKey: process.env.SAM_PRIVATE_KEY! as `0x${string}`,
// });
//
// const samTreasury = samOak.paymentTreasury(
//   process.env.PAYMENT_TREASURY_ADDRESS! as `0x${string}`,
// );
//
// const cryptoPaymentId = keccak256(toHex("crypto-order-67890"));
// const selfRefundTxHash = await samTreasury.claimRefundSelf(cryptoPaymentId);
// await samOak.waitForReceipt(selfRefundTxHash);
// console.log("NFT burned + refund claimed by Sam");
