# Scenario 3: E-Commerce Payment Flow — Payment Treasury

## The Story

**CeloMarket** is an online marketplace where independent artisans sell handcrafted goods. Unlike the crowdfunding scenarios (Scenarios 1 and 2), CeloMarket does not run time-bound campaigns with pledges and rewards. Instead, it processes individual **e-commerce transactions** — a buyer selects a product, pays with cryptocurrency, and the platform fulfills the order.

CeloMarket uses the **PaymentTreasury** model, which works like a traditional payment processor but entirely on-chain. Every payment is broken down into **line items** (product price, shipping, tax) and follows a two-step flow: the buyer pays, and the platform confirms after verifying the order.

In this scenario, a buyer named **Sam** purchases a handcrafted ceramic vase for **$120** with **$15 shipping**. The payment flows through the treasury, gets confirmed by the platform, and the funds become available for withdrawal.

## Multi-token support

Every payment record includes **`paymentToken`**. The treasury only accepts tokens that **`CampaignInfo.isTokenAccepted`** allows for that campaign. Pending, confirmed, fee, and refund accounting is **per ERC-20 contract** (amounts in that token’s decimals). The walkthrough uses **one stablecoin**; batch and single-payment APIs work the same way for **each additional accepted token** you configure at the protocol/campaign level.

## How It Unfolds

1. **CeloMarket (Platform Admin)** connects to its deployed PaymentTreasury contract and reads back the platform configuration
2. **CeloMarket** creates a payment record for Sam's order — this includes the total amount, line items (product + shipping), external fees, and an expiration window. Batch creation is also available for high-volume platforms.
3. **Sam (Buyer)** transfers the payment on-chain by sending ERC-20 tokens to the treasury contract
4. **CeloMarket** verifies the order (inventory check, fraud review) and confirms the payment. Batch confirmation is available for multiple payments.
5. **Anyone** can read payment data and treasury balances — buyer address, amount, confirmation status, expected pending amount, and line item breakdown
6. If something goes wrong (wrong item shipped, order cancelled), a refund is issued. For off-chain payments the **platform admin** cancels and directs the refund to an address (`claimRefund`). For on-chain crypto payments the **buyer (NFT owner)** calls `claimRefundSelf` — the contract verifies NFT ownership, burns the NFT, and sends refundable line items back.
7. **Anyone** disburses accumulated protocol and platform fees
8. **CeloMarket or the Creator** withdraws confirmed funds to the campaign owner's wallet
9. For TimeConstrainedPaymentTreasury: the platform claims all remaining balances after the deadline + claim delay
10. **CeloMarket** claims non-goal line item accumulations (e.g., shipping fees) per token
11. **CeloMarket** can pause and unpause the treasury during an investigation
12. **CeloMarket or the Creator** can permanently cancel the treasury in extreme cases

## NFT Handling in PaymentTreasury

Unlike the AllOrNothing and KeepWhatsRaised scenarios — where the treasury contract **is** an ERC-721 itself and exposes NFT functions directly (e.g., `treasury.ownerOf(...)`, `treasury.burn(...)`) — the **PaymentTreasury does not expose any NFT methods**. NFT minting for crypto payments is delegated to the **CampaignInfo** contract via `INFO.mintNFTForPledge(...)` internally.

This means:

- There is no `paymentTreasury.ownerOf(...)` or `paymentTreasury.approve(...)`.
- NFT reads/writes for PaymentTreasury NFTs go through the **CampaignInfo** entity instead.
- `claimRefundSelf(paymentId)` is the only PaymentTreasury function that interacts with NFTs — it verifies the caller is the current NFT owner, sends the refundable amount to them, and burns the NFT automatically.
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
| 2 | `02-create-payment.ts` | Platform Admin | Create a payment record with line items (single + batch) | Required |
| 3 | `03-process-crypto-payment.ts` | Buyer | Transfer ERC-20 tokens to the treasury | Required |
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
| `claimRefundSelf(paymentId)` | NFT Owner (crypto payments only — verifies ownership, burns NFT) | (no role modifier) |
| `claimRefund(paymentId, refundAddress)` | Platform Admin (off-chain payments only — `tokenId == 0`) | `onlyPlatformAdmin` |
| `disburseFees` | Anyone | (no role modifier) |
| `withdraw` | Platform Admin or Creator | `onlyPlatformAdminOrCampaignOwner` |
| `claimExpiredFunds` | Platform Admin | `onlyPlatformAdmin` |
| `claimNonGoalLineItems` | Platform Admin | `onlyPlatformAdmin` |
| `pauseTreasury` / `unpauseTreasury` | Platform Admin | `onlyPlatformAdmin` |
| `cancelTreasury` | Platform Admin or Creator | custom check (both roles) |
| `getPaymentData`, `getRaisedAmount`, etc. | Anyone | (read-only) |
