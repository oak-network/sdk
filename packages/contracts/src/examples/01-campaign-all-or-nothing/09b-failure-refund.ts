/**
 * Step 9b: Failure — Goal Not Met, Claim Refund (Anyone)
 *
 * The 30-day deadline has passed but the campaign did not reach the
 * $5,000 goal. Under the All-or-Nothing model, every backer is
 * entitled to a full refund.
 *
 * `claimRefund(tokenId)` has no role restriction — anyone can call it
 * for any token ID. The contract always sends the refund to the
 * **current NFT owner** (`INFO.ownerOf(tokenId)`), not to `msg.sender`.
 * This means a backer can call it themselves, or a platform bot could
 * trigger refunds on behalf of all backers.
 *
 * Prerequisite: the backer must approve the treasury contract to
 * manage their pledge NFT before calling `claimRefund`. Pledge NFTs
 * live on the **CampaignInfo** contract, so `approve` is called on
 * the CampaignInfo entity (not the treasury). Use `approve` for a
 * single token or `setApprovalForAll` for all tokens at once.
 *
 * The contract does two things in a single transaction:
 *
 *   1. Burns the pledge NFT (the token is permanently destroyed)
 *   2. Returns the pledged tokens to the NFT owner's wallet
 *
 * Because `claimRefund` already burns the NFT, there is no need to
 * call `burn` separately. After this call, the token no longer exists
 * and the backer's balance decreases by one.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const alexOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.ALEX_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.ALL_OR_NOTHING_ADDRESS! as `0x${string}`;
const campaignInfoAddress = process.env.CAMPAIGN_INFO_ADDRESS! as `0x${string}`;
const treasury = alexOak.allOrNothingTreasury(treasuryAddress);
const campaign = alexOak.campaignInfo(campaignInfoAddress);

const pledgeTokenIdEnv = process.env.ALEX_PLEDGE_TOKEN_ID?.trim();
if (!pledgeTokenIdEnv) {
  throw new Error("ALEX_PLEDGE_TOKEN_ID is required (pledge NFT tokenId from Step 6).");
}
const tokenId = BigInt(pledgeTokenIdEnv);

// Approve the treasury to burn this pledge NFT.
// Pledge NFTs live on CampaignInfo, so approve is called on the CampaignInfo entity.
const approveTxHash = await campaign.approve(treasuryAddress, tokenId);
await alexOak.waitForReceipt(approveTxHash);

const refundTxHash = await treasury.claimRefund(tokenId);
const refundReceipt = await alexOak.waitForReceipt(refundTxHash);
console.log(`Refund claimed at block ${refundReceipt.blockNumber}`);

const refundedAmount = await treasury.getRefundedAmount();
console.log("Total refunded from treasury:", refundedAmount);
