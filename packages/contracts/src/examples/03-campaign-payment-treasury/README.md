# Scenario 3: E-Commerce Payment Flow — Payment Treasury

## The Story

**CeloMarket** is an online marketplace where independent artisans sell handcrafted goods. Unlike the crowdfunding scenarios (Scenarios 1 and 2), CeloMarket does not run time-bound campaigns with pledges and rewards. Instead, it processes individual **e-commerce transactions** — a buyer selects a product, pays with cryptocurrency, and the platform fulfills the order.

CeloMarket uses the **PaymentTreasury** model, which works like a traditional payment processor but entirely on-chain. Every payment is broken down into **line items** (product price, shipping, tax) and follows a two-step flow: the buyer pays, and the platform confirms after verifying the order.

In this scenario, a buyer named **Sam** purchases a handcrafted ceramic vase for **$120** with **$15 shipping**. The payment flows through the treasury, gets confirmed by the platform, and the funds become available for withdrawal.

## Multi-token support

Every payment record includes **`paymentToken`**. The treasury only accepts tokens that **`CampaignInfo.isTokenAccepted`** allows for that campaign. Pending, confirmed, fee, and refund accounting is **per ERC-20 contract** (amounts in that token’s decimals). The walkthrough uses **one stablecoin**; batch and single-payment APIs work the same way for **each additional accepted token** you configure at the protocol/campaign level.

## How It Unfolds

1. **CeloMarket (Platform Admin)** connects to its deployed PaymentTreasury contract and reads back the platform configuration

**Two independent payment flows** — a platform uses one or both depending on its business model:

2. **Flow A — Off-chain / fiat payment:** **CeloMarket** creates a payment record for Sam's order via `createPayment`. This records the intent on-chain (total amount, line items, external fees, expiration) but **no funds move**. A buyer pays through off-chain rails (credit card, bank transfer, etc.) and the platform later calls `confirmPayment` after verifying receipt.
3. **Flow B — On-chain crypto payment:** **Sam (Buyer)** pays directly on-chain via `processCryptoPayment`. This is a **standalone operation** — it creates the payment record AND transfers ERC-20 tokens to the treasury in a single transaction. It does **not** require a prior `createPayment` call. An NFT is minted to the buyer as proof of payment.

> **These are two separate flows, not sequential steps.** `processCryptoPayment` does not "complete" a pending `createPayment` — it is an independent entry point for on-chain payments.

4. **CeloMarket** verifies the order (inventory check, fraud review) and confirms the payment. Batch confirmation is available for multiple payments.
5. **Anyone** can read payment data and treasury balances — buyer address, amount, confirmation status, expected pending amount, and line item breakdown
6. If something goes wrong, three separate cancellation/refund paths exist: **a)** the **platform admin** cancels an unconfirmed off-chain payment via `cancelPayment` (deletes the record; no on-chain refund since no funds were transferred); **b)** the **platform admin** refunds a confirmed non-NFT payment via `claimRefund(paymentId, refundAddress)`; **c)** for crypto payments, anyone can call `claimRefundSelf` — the contract looks up the NFT owner, burns the NFT, and sends refundable line items to that owner (no `cancelPayment` needed — crypto payments are auto-confirmed and `cancelPayment` rejects them).
7. **Anyone** disburses accumulated protocol and platform fees
8. **CeloMarket or the Creator** withdraws confirmed funds to the campaign owner's wallet
9. For TimeConstrainedPaymentTreasury: the platform claims all remaining balances after the deadline + claim delay
10. **CeloMarket** claims non-goal line item accumulations (e.g., shipping fees) per token
11. **CeloMarket** can pause and unpause the treasury during an investigation
12. **CeloMarket or the Creator** can permanently cancel the treasury in extreme cases

## NFT Handling

All pledge/payment NFTs across **every treasury type** (AllOrNothing, KeepWhatsRaised, PaymentTreasury) live on the **CampaignInfo** contract. No treasury contract is an ERC-721 itself — they all delegate NFT operations (`mint`, `burn`, `ownerOf`) to CampaignInfo internally.

This means:

- There is no `treasury.ownerOf(...)` or `treasury.approve(...)` on **any** treasury type.
- NFT reads (`ownerOf`, `balanceOf`, `tokenURI`, `getPledgeData`) and writes (`approve`, `setApprovalForAll`) go through the **CampaignInfo** entity: `oak.campaignInfo(address)`.
- **Before calling any refund function** that burns an NFT (`claimRefund` on AON/KWR, `claimRefundSelf` on PaymentTreasury), the NFT owner must approve the treasury contract to manage the NFT via `campaignInfo.approve(treasuryAddress, tokenId)`. See [Step 6](./06-handle-refunds.ts) for the full code.
- `claimRefundSelf(paymentId)` is the only PaymentTreasury function that interacts with NFTs — it looks up the current NFT owner, burns the NFT, and sends the refundable amount to that owner. Any caller can trigger it; the refund always goes to the NFT owner.
- `claimRefund(paymentId, refundAddress)` is for **non-NFT payments** (off-chain `createPayment` where no NFT was minted) and can only be called by the platform admin.

## PaymentTreasury vs. TimeConstrainedPaymentTreasury

The SDK's `oak.paymentTreasury(address)` supports **two on-chain variants** through the same interface:

| Variant | Behavior |
| --- | --- |
| **PaymentTreasury** | Standard payment processing with no time restrictions. Payments can be created and confirmed at any time. |
| **TimeConstrainedPaymentTreasury** | Adds a **launch time** and **deadline** enforced on-chain. Payments can only be created after the launch time and before the deadline. Useful for limited-time sales, flash deals, or seasonal storefronts. Also enables `claimExpiredFunds` after deadline + claim delay. |

From your code's perspective, there is **no difference**. You use `oak.paymentTreasury(address)` for both variants. The time constraints are enforced transparently by the contract — if you attempt to create a payment outside the allowed window on a TimeConstrainedPaymentTreasury, the transaction will revert with a typed error that you can catch using the patterns shown in [Scenario 5](../05-error-handling/).

Which variant your platform uses depends on the treasury implementation registered and approved during [platform onboarding](../00-platform-enlistment/).

## Files

| Step | File | Role | Description | Required? |
| --- | --- | --- | --- | --- |
| 1 | `01-setup-treasury.ts` | Platform Admin | Connect to the PaymentTreasury and read platform config | Required |
| 2 | `02-create-payment.ts` | Platform Admin | Flow A: Create an off-chain payment record with line items (single + batch) | Required |
| 3 | `03-process-crypto-payment.ts` | Buyer | Flow B: Pay on-chain — creates the payment AND transfers ERC-20 tokens in one step (independent of Step 2) | Required |
| 4 | `04-confirm-payment.ts` | Platform Admin | Confirm the payment after order verification (single + batch) | Required |
| 5 | `05-read-payment-data.ts` | Anyone | Read payment details and treasury dashboard | Required |
| 6 | `06-handle-refunds.ts` | Platform Admin / Buyer | Cancel a payment and claim a refund (self or admin-directed) | Required |
| 7 | `07-disburse-fees.ts` | Anyone | Disburse accumulated protocol and platform fees | Required |
| 8 | `08-withdraw-funds.ts` | Platform Admin or Creator | Withdraw confirmed funds to the campaign owner's wallet | Required |
| 9 | `09-claim-expired-funds.ts` | Platform Admin | Sweep remaining balances after deadline + claim delay (TimeConstrained only) | Required |
| 10 | `10-claim-non-goal-line-items.ts` | Platform Admin | Claim non-goal line item accumulations per token | Required |
| 11 | `11-pause-unpause-treasury.ts` | Platform Admin | Temporarily freeze and resume treasury operations | (Optional) |
| 12 | `12-cancel-treasury.ts` | Platform Admin or Creator | Permanently cancel a treasury | (Optional) |

## Role Reference (from the Smart Contract)

| Function | Who can call | Contract modifier |
| --- | --- | --- |
| `createPayment` / `createPaymentBatch` | Platform Admin | `onlyPlatformAdmin` |
| `processCryptoPayment` | Anyone (buyer) | (no role modifier) |
| `confirmPayment` / `confirmPaymentBatch` | Platform Admin | `onlyPlatformAdmin` |
| `cancelPayment` | Platform Admin | `onlyPlatformAdmin` |
| `claimRefundSelf(paymentId)` | Anyone (crypto payments only — burns NFT, refund goes to NFT owner) | (no role modifier) |
| `claimRefund(paymentId, refundAddress)` | Platform Admin (off-chain payments only — `tokenId == 0`) | `onlyPlatformAdmin` |
| `disburseFees` | Anyone | (no role modifier) |
| `withdraw` | Platform Admin or Creator | `onlyPlatformAdminOrCampaignOwner` |
| `claimExpiredFunds` | Platform Admin | `onlyPlatformAdmin` |
| `claimNonGoalLineItems` | Platform Admin | `onlyPlatformAdmin` |
| `pauseTreasury` / `unpauseTreasury` | Platform Admin | `onlyPlatformAdmin` |
| `cancelTreasury` | Platform Admin or Creator | custom check (both roles) |
| `getPaymentData`, `getRaisedAmount`, etc. | Anyone | (read-only) |
