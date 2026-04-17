/**
 * Step 7: Handle Refunds (Platform Admin / Buyer)
 *
 * Suppose the vase arrives damaged. Sam contacts CeloMarket's support
 * team, and they decide to issue a refund. Three distinct paths exist:
 *
 * **A) Cancel an unconfirmed off-chain payment:**
 *
 *   - `cancelPayment(paymentId)` — Platform Admin only. Works only on
 *     unconfirmed, non-expired, non-crypto payments. Deletes the on-chain
 *     record. No funds are returned because off-chain payments haven't
 *     transferred any tokens to the contract.
 *
 * **B) Refund a confirmed off-chain payment (non-NFT):**
 *
 *   - `claimRefund(paymentId, refundAddress)` — Platform Admin only.
 *     Refunds a confirmed payment where no NFT was minted (tokenId == 0).
 *     Sends refundable line items to the specified address.
 *
 * **C) Refund a crypto payment (NFT):**
 *
 *   - `claimRefundSelf(paymentId)` — Any caller (NFT owner). Crypto
 *     payments are auto-confirmed on creation, so no prior
 *     `cancelPayment` is needed (and would revert if attempted).
 *     The contract looks up the NFT owner, burns the NFT, and sends
 *     the refundable amount to that owner.
 *
 *   Prerequisite: the NFT owner must approve the treasury contract
 *   to manage the NFT beforehand — the treasury calls `INFO.burn()`,
 *   which requires approval. Since all pledge NFTs live on the
 *   CampaignInfo contract (not the treasury itself), approval is
 *   done via `campaignInfo.approve(treasuryAddress, tokenId)`.
 *
 * For B and C, only line items marked as `canRefund: true` at creation
 * time are included. Non-refundable line items (e.g., shipping) are
 * excluded from the refund.
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
// an NFT to Sam on the CampaignInfo contract. Crypto payments are
// auto-confirmed on creation, so no `cancelPayment` is needed (and
// would revert if attempted).
//
// Before calling `claimRefundSelf`, Sam must approve the treasury
// contract to manage his NFT. All pledge NFTs live on the
// CampaignInfo contract, so approval uses the CampaignInfo SDK entity.

const samOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.SAM_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.PAYMENT_TREASURY_ADDRESS! as `0x${string}`;
const samTreasury = samOak.paymentTreasury(treasuryAddress);
const samCampaign = samOak.campaignInfo(
  process.env.CAMPAIGN_INFO_ADDRESS! as `0x${string}`,
);

const paymentId = keccak256(toHex("order-12345"));
const tokenId = /* NFT token ID from the PaymentCreated event */ 1n;

// Approve the treasury to burn this pledge NFT via the CampaignInfo entity
const approveTxHash = await samCampaign.approve(treasuryAddress, tokenId);
await samOak.waitForReceipt(approveTxHash);

const selfRefundTxHash = await samTreasury.claimRefundSelf(paymentId);
await samOak.waitForReceipt(selfRefundTxHash);
console.log("NFT burned + refund claimed by Sam");

// ============================================================
// B. Cancel an unconfirmed off-chain payment (Platform Admin)
// ============================================================
//
// For unconfirmed payments created via `createPayment`, the platform
// admin can cancel the on-chain record. Since no real funds were
// transferred for off-chain payments, `cancelPayment` simply deletes
// the record. Any off-chain refund (credit card reversal, etc.) is
// handled by the platform outside the contract.

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
// const cancelTxHash = await paymentTreasury.cancelPayment(offchainPaymentId);
// await oak.waitForReceipt(cancelTxHash);
// console.log("Unconfirmed payment record deleted");

// ============================================================
// C. Refund a confirmed off-chain payment (Platform Admin)
// ============================================================
//
// For confirmed off-chain payments (no NFT minted, i.e. `confirmPayment`
// was called with `buyerAddress = address(0)`), the platform admin can
// refund on-chain funds to a specified address. This path verifies
// the payment is confirmed and has `tokenId == 0`.

// const confirmedPaymentId = keccak256(toHex("confirmed-order-99999"));
//
// const refundTxHash = await paymentTreasury.claimRefund(
//   confirmedPaymentId,
//   process.env.SAM_ADDRESS! as `0x${string}`,
// );
// await oak.waitForReceipt(refundTxHash);
// console.log("Refund sent to Sam's address");
