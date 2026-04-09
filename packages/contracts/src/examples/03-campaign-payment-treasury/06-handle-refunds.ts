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
// A. Crypto payment refund (NFT Owner / Buyer)
// ============================================================
//
// Steps 2–3 processed order-12345 as a crypto payment, which minted
// an NFT to Sam. To claim a refund, Sam (the NFT owner) calls
// `claimRefundSelf`. The contract verifies NFT ownership, burns the
// NFT, and sends the refundable amount back to Sam's wallet.

const samOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.SAM_PRIVATE_KEY! as `0x${string}`,
});

const samTreasury = samOak.paymentTreasury(
  process.env.PAYMENT_TREASURY_ADDRESS! as `0x${string}`,
);

const paymentId = keccak256(toHex("order-12345"));

const selfRefundTxHash = await samTreasury.claimRefundSelf(paymentId);
await samOak.waitForReceipt(selfRefundTxHash);
console.log("NFT burned + refund claimed by Sam");

// ============================================================
// B. Off-chain payment refund (Platform Admin) — Alternative
// ============================================================
//
// For payments created via `createPayment` only (no NFT minted),
// the platform admin cancels the payment and directs the refund
// to a specific address. This path does NOT apply to crypto
// payments — use `claimRefundSelf` above instead.

// const oak = createOakContractsClient({
//   chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
//   rpcUrl: process.env.RPC_URL!,
//   privateKey: process.env.PLATFORM_PRIVATE_KEY! as `0x${string}`,
// });
//
// const paymentTreasury = oak.paymentTreasury(
//   process.env.PAYMENT_TREASURY_ADDRESS! as `0x${string}`,
// );
//
// const offchainPaymentId = keccak256(toHex("offchain-order-67890"));
//
// // Step 1: Cancel the payment
// const cancelTxHash = await paymentTreasury.cancelPayment(offchainPaymentId);
// await oak.waitForReceipt(cancelTxHash);
// console.log("Payment cancelled");
//
// // Step 2: Direct the refund to the buyer's address
// const refundTxHash = await paymentTreasury.claimRefund(
//   offchainPaymentId,
//   process.env.SAM_ADDRESS! as `0x${string}`,
// );
// await oak.waitForReceipt(refundTxHash);
// console.log("Refund sent to Sam's address");
