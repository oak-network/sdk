/**
 * Step 11: Claim a Refund (Backer)
 *
 * A backer who wants their money back can claim a refund by calling
 * `claimRefund` with their pledge NFT token ID. The contract burns
 * the NFT and returns the pledged tokens (minus any payment fees)
 * to the NFT owner's wallet in a single transaction.
 *
 * Refund eligibility timing:
 *
 *   - If the campaign is NOT cancelled: refunds are available after
 *     the deadline has passed AND before `deadline + refundDelay`
 *   - If the campaign IS cancelled: refunds are available immediately
 *     after cancellation and until `cancellationTime + refundDelay`
 *
 * Note: `claimRefund` already burns the NFT — there is no need
 * to call `burn` separately.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const backerOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.BACKER_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.KEEP_WHATS_RAISED_ADDRESS! as `0x${string}`;
const treasury = backerOak.keepWhatsRaisedTreasury(treasuryAddress);

const tokenId = BigInt(process.env.BACKER_PLEDGE_TOKEN_ID ?? "0"); // NFT token ID from the pledge receipt event
const refundTxHash = await treasury.claimRefund(tokenId);
const refundReceipt = await backerOak.waitForReceipt(refundTxHash);
console.log(`Refund claimed at block ${refundReceipt.blockNumber}`);

const refundedAmount = await treasury.getRefundedAmount();
console.log("Total refunded from treasury:", refundedAmount);
