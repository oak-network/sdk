/**
 * Step 11: Claim a Refund (Backer)
 *
 * A backer who wants their money back can claim a refund by calling
 * `claimRefund` with their pledge NFT token ID. The contract burns
 * the NFT and returns the pledged tokens (minus any payment fees)
 * to the NFT owner's wallet in a single transaction.
 *
 * Prerequisite: the backer must approve the treasury contract to
 * manage their pledge NFT before calling `claimRefund`. Pledge NFTs
 * live on the **CampaignInfo** contract, so `approve` is called on
 * the CampaignInfo entity (not the treasury). Use `approve` for a
 * single token or `setApprovalForAll` for all tokens at once.
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
const campaignInfoAddress = process.env.CAMPAIGN_INFO_ADDRESS! as `0x${string}`;
const treasury = backerOak.keepWhatsRaisedTreasury(treasuryAddress);
const campaign = backerOak.campaignInfo(campaignInfoAddress);

const pledgeTokenIdEnv = process.env.BACKER_PLEDGE_TOKEN_ID?.trim();
if (!pledgeTokenIdEnv) {
  throw new Error("BACKER_PLEDGE_TOKEN_ID is required (pledge NFT tokenId from Step 5).");
}
const tokenId = BigInt(pledgeTokenIdEnv);

// Approve the treasury to burn this pledge NFT.
// Pledge NFTs live on CampaignInfo, so approve is called on the CampaignInfo entity.
const approveTxHash = await campaign.approve(treasuryAddress, tokenId);
await backerOak.waitForReceipt(approveTxHash);

const refundTxHash = await treasury.claimRefund(tokenId);
const refundReceipt = await backerOak.waitForReceipt(refundTxHash);
console.log(`Refund claimed at block ${refundReceipt.blockNumber}`);

const refundedAmount = await treasury.getRefundedAmount();
console.log("Total refunded from treasury:", refundedAmount);
