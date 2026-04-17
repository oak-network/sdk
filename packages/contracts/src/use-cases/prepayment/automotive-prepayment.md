# Automotive Prepayment — Karma Automotive

## The Business

**Karma Automotive** sells luxury electric vehicles. Customers place prepayment deposits when ordering a vehicle, with the full balance due before delivery. If the vehicle is not delivered within the agreed timeframe (e.g. 6 months), the customer is entitled to a full refund of their deposit.

## Why Oak?

Karma Automotive needs:

- **Time-constrained escrow** — funds are locked with a hard deadline; if delivery doesn't happen by the deadline, the buyer is automatically protected
- **Structured payments** — line items for base price, options packages, and delivery fees
- **Automatic expiry protection** — after the deadline + claim delay, expired funds can be swept back to the buyer
- **Transparent fee tracking** — dealer fees, protocol fees, all visible on-chain
- **Trust for high-value transactions** — a $50,000+ vehicle deposit requires stronger guarantees than a traditional wire transfer

## Oak Contract Used

**TimeConstrainedPaymentTreasury** — identical to PaymentTreasury in its SDK interface (both use `oak.paymentTreasury()`), but the smart contract enforces launch-time and deadline constraints on-chain. After the deadline passes and the claim delay expires, `claimExpiredFunds` becomes callable.

### Multi-token support

Like **PaymentTreasury**, the time-constrained variant is **multi-token**: **`paymentToken`** must be accepted for the campaign, and all pending / confirmed / fee accounting is **per token address** in that token’s decimals. The Karma example uses **USDT** only as a familiar stablecoin; deposits and `claimNonGoalLineItems` can use **any accepted ERC-20** from the campaign whitelist. Whitelist source: **`GlobalParams`** (`getTokensForCurrency` / owner `addTokenToCurrency`); per-campaign cache: **`campaign.getAcceptedTokens()`**.

## Roles

| Role | Who | On-Chain Functions |
|------|-----|--------------------|
| **Platform Admin** | Karma's ordering system | `createPayment`, `createPaymentBatch`, `confirmPayment`, `confirmPaymentBatch`, `cancelPayment`, `claimRefund(paymentId, address)` (non-NFT), `claimExpiredFunds`, `claimNonGoalLineItems`, `pauseTreasury`, `unpauseTreasury`, `cancelTreasury` |
| **Platform Admin or Campaign Owner** | Karma or dealer | `withdraw`, `cancelTreasury` |
| **Buyer** | Vehicle customer | ERC-20 `approve`, `processCryptoPayment`, `claimRefundSelf(paymentId)` (NFT payments) |
| **Dealer (Campaign Owner)** | Karma dealership | Receives funds after `withdraw` |
| **Protocol Admin** | Oak protocol | Receives protocol fees (via `disburseFees`) |
| **Any caller** | Anyone | `disburseFees`, all read functions (`getPaymentData`, `getRaisedAmount`, `getExpectedAmount`, `paused`, etc.) |

> **Note on time constraints:** Unlike the standard PaymentTreasury, `createPayment`, `createPaymentBatch`, `processCryptoPayment`, `cancelPayment`, `confirmPayment`, and `confirmPaymentBatch` must be called while the current time is within `launchTime` … `deadline + bufferTime` (per `TimestampChecker`). `claimRefund`, `claimRefundSelf`, `claimExpiredFunds`, `disburseFees`, `withdraw`, and `claimNonGoalLineItems` require the current time to be **after** `launchTime` (they use `_checkTimeIsGreater()`).

## Integration Flow

### Step 1: Connect to the TimeConstrainedPaymentTreasury

> **Role: Any caller** — connecting and reading treasury state is public.

Karma's order management system connects to their deployed treasury.

```typescript
import { createOakContractsClient, CHAIN_IDS, toHex } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL,
  privateKey: process.env.KARMA_PLATFORM_KEY as `0x${string}`,
});

// TimeConstrainedPaymentTreasury uses the same SDK entity as PaymentTreasury
const treasury = oak.paymentTreasury(TIME_CONSTRAINED_TREASURY_ADDRESS);

const isPaused = await treasury.paused();
const isCancelled = await treasury.cancelled();
```

### Step 2: Customer orders a vehicle — two independent payment flows

James orders a Karma GS-6 electric sedan with the Performance Package. The total prepayment is $52,500 broken down into line items.

Karma supports two payment methods — they are **not** sequential steps:

#### Flow A: Off-chain / fiat payment (`createPayment`)

> **Role: Platform Admin** — only the platform admin can create payment records. Must be called within the time window (`launchTime` to `deadline + bufferTime`).

Karma's system creates a payment record on-chain. **No funds move** — James pays through off-chain rails (wire transfer, dealership financing, etc.) and Karma calls `confirmPayment` after verifying receipt.

```typescript
const orderId = toHex("karma-order-GS6-2026-0415", { size: 32 });
const buyerId = toHex("customer-james-091", { size: 32 });
const itemId = toHex("karma-gs6-performance", { size: 32 });

const lineItems = [
  { typeId: toHex("vehicle-base",      { size: 32 }), amount: 45_000_000000n },  // $45,000 USDT (6 decimals)
  { typeId: toHex("performance-pkg",   { size: 32 }), amount: 5_500_000000n },  // $5,500
  { typeId: toHex("delivery-fee",      { size: 32 }), amount: 2_000_000000n },  // $2,000
];

const externalFees = [
  { feeType: toHex("dealer-processing", { size: 32 }), feeAmount: 500_000000n },  // $500
];

const totalAmount = 52_500_000000n; // $52,500 USDT
// Delivery deadline: 6 months from now
const expiration = BigInt(Math.floor(Date.now() / 1000) + 180 * 86400);

await treasury.simulate.createPayment(
  orderId, buyerId, itemId, USDT_TOKEN_ADDRESS,
  totalAmount, expiration, lineItems, externalFees,
);

const txHash = await treasury.createPayment(
  orderId, buyerId, itemId, USDT_TOKEN_ADDRESS,
  totalAmount, expiration, lineItems, externalFees,
);
await oak.waitForReceipt(txHash);
```

#### Flow B: On-chain crypto payment (`processCryptoPayment`)

> **Role: Any caller** — `processCryptoPayment` is permissionless, but the buyer must first approve the treasury to transfer their ERC-20 tokens. Must be called within the time window.

This is a **standalone operation** — it creates the payment record AND transfers ERC-20 tokens in a single transaction. It does **not** require or complete a prior `createPayment` call. An NFT is minted to James as proof of payment.

James transfers the full prepayment amount. Before the treasury can pull funds, James must grant an ERC-20 allowance:

```typescript
import { erc20Abi } from "viem";

const usdt = { address: USDT_TOKEN_ADDRESS, abi: erc20Abi };

// James approves the treasury to spend $52,500 USDT
const approveTx = await walletClient.writeContract({
  ...usdt,
  functionName: "approve",
  args: [TIME_CONSTRAINED_TREASURY_ADDRESS, totalAmount],
});
await publicClient.waitForTransactionReceipt({ hash: approveTx });
```

Now the payment can be processed:

```typescript
const txHash = await treasury.processCryptoPayment(
  orderId, itemId, JAMES_WALLET_ADDRESS, USDT_TOKEN_ADDRESS,
  totalAmount, lineItems, externalFees,
);
await oak.waitForReceipt(txHash);
```

Funds are now **locked in the time-constrained treasury**. The clock is ticking toward the 6-month delivery deadline.

### Step 3: Monitor the order status

> **Role: Any caller** — all read functions are public.

Karma's dashboard tracks the prepayment and treasury health.

```typescript
// Read the specific order
const paymentData = await treasury.getPaymentData(orderId);
// paymentData.isConfirmed === false (not yet delivered)
// paymentData.expiration — the delivery deadline

// Treasury-level metrics
const [raised, available, expected] = await oak.multicall([
  () => treasury.getRaisedAmount(),
  () => treasury.getAvailableRaisedAmount(),
  () => treasury.getExpectedAmount(),
]);
```

### Step 4 (Success): Vehicle delivered — confirm and withdraw

> **Role: Platform Admin** for `confirmPayment` (must still be within the launch…deadline+buffer window). **Any caller** for `disburseFees` (after `launchTime`). **Platform Admin or Campaign Owner** for `withdraw` (after `launchTime`).

The GS-6 is manufactured and delivered to James. Karma's system confirms delivery.

```typescript
// Confirm delivery
await treasury.simulate.confirmPayment(orderId, JAMES_WALLET_ADDRESS);
const confirmTx = await treasury.confirmPayment(orderId, JAMES_WALLET_ADDRESS);
await oak.waitForReceipt(confirmTx);

// Disburse protocol and platform fees
const feeTx = await treasury.disburseFees();
await oak.waitForReceipt(feeTx);

// Withdraw settled funds to the dealer (campaign owner)
const withdrawTx = await treasury.withdraw();
await oak.waitForReceipt(withdrawTx);
```

### Step 4 (Failure): Claim window after deadline — platform sweeps expired funds

> **Role: Platform Admin** — only the platform admin can call `claimExpiredFunds`. Callable only after `campaignDeadline + platformClaimDelay`, and only after `launchTime` (time-constrained variant).

If the vehicle is not delivered and funds remain in the treasury past the campaign deadline plus the configured claim delay, Karma's backend can sweep idle balances on-chain. The contract transfers swept amounts to the **platform admin** and **protocol admin** addresses (see `ExpiredFundsClaimed`). Consumer-facing refunds to James are then handled by Karma's policy and ops (off-chain settlement or a follow-on transfer), not by a single `claimExpiredFunds` transfer directly to the buyer wallet in the base contract logic.

```typescript
// After INFO.getDeadline() + INFO.getPlatformClaimDelay(PLATFORM_HASH) has passed:
const txHash = await treasury.claimExpiredFunds();
await oak.waitForReceipt(txHash);
```

This is the core value of the **TimeConstrainedPaymentTreasury** — the **claim window** is enforced on-chain, so idle balances cannot sit forever without a defined recovery path.

### Alternative: Refunds before or after the claim window

**A) Cancel unconfirmed off-chain payment (before `confirmPayment`):**

> **Role: Platform Admin** for `cancelPayment` (within the launch…deadline+buffer window).

```typescript
await treasury.cancelPayment(orderId);
```

**B) Refund a confirmed off-chain payment (non-NFT):**

> **Role: Platform Admin** for `claimRefund(paymentId, refundAddress)` (after `launchTime`). This refunds a confirmed payment where no NFT was minted. The contract verifies the payment is confirmed and has `tokenId == 0`.

```typescript
await treasury.claimRefund(orderId, JAMES_WALLET_ADDRESS);
```

**C) Refund — NFT-backed crypto payment:**

> **Role: Any caller (NFT owner)** — `claimRefundSelf(paymentId)` looks up the current NFT owner, burns the NFT, and sends the refundable amount to that owner (after `launchTime`). No prior `cancelPayment` is needed — crypto payments cannot be cancelled via `cancelPayment` (they are auto-confirmed on creation).

Before calling `claimRefundSelf`, the NFT owner must approve the treasury to manage the NFT. All pledge NFTs live on the **CampaignInfo** contract (not the treasury itself), so approval uses the CampaignInfo SDK entity:

```typescript
const campaign = oak.campaignInfo(CAMPAIGN_INFO_ADDRESS);
await campaign.approve(TIME_CONSTRAINED_TREASURY_ADDRESS, tokenId);

await treasury.claimRefundSelf(orderId);
```

### Claim non-goal line items

> **Role: Platform Admin** — only the platform admin can claim non-goal line items (after `launchTime`).

If the prepayment used line items that do not count toward the campaign goal (e.g., processing fees), the platform admin can claim accumulated non-goal balances per token.

```typescript
const txHash = await treasury.claimNonGoalLineItems(USDT_TOKEN_ADDRESS);
await oak.waitForReceipt(txHash);
```

### Batch operations

> **Role: Platform Admin** — batch create and confirm are platform-admin-only (within the launch…deadline+buffer window).

```typescript
const txHash = await treasury.createPaymentBatch(
  paymentIds, buyerIds, itemIds, tokens, amounts, expirations,
  lineItemsArray, externalFeesArray,
);
await oak.waitForReceipt(txHash);

const txHash2 = await treasury.confirmPaymentBatch(paymentIds, buyerAddresses);
await oak.waitForReceipt(txHash2);
```

### Pause, unpause, or cancel the treasury

**Pause / unpause:**

> **Role: Platform Admin** — only the platform admin can pause and unpause.

```typescript
const pauseTx = await treasury.pauseTreasury(toHex("compliance-hold", { size: 32 }));
await oak.waitForReceipt(pauseTx);

const unpauseTx = await treasury.unpauseTreasury(toHex("hold-cleared", { size: 32 }));
await oak.waitForReceipt(unpauseTx);
```

**Cancel the treasury permanently:**

> **Role: Platform Admin or Campaign Owner** — either party can cancel (same override pattern as `PaymentTreasury`).

```typescript
const txHash = await treasury.cancelTreasury(toHex("program-ended", { size: 32 }));
await oak.waitForReceipt(txHash);
```

## Architecture Diagram

```
Customer (James)            Karma (Platform Admin)         TimeConstrainedTreasury
       |                         |                                |
       |   Order GS-6            |                                |
       |------------------------>|                                |
       |                         |                                |
       |         --- FLOW A: Off-chain / fiat payment ---         |
       |                         |                                |
       |                         |  createPayment(...)            |
       |                         |  [Platform Admin, in window]   |
       |                         |------------------------------->|  Order recorded (no funds)
       |                         |                                |
       |   Pays off-chain        |                                |
       |   (wire, financing)     |                                |
       |------------------------>|                                |
       |                         |                                |
       |         --- FLOW B: On-chain crypto payment ---          |
       |                         |                                |
       |   ERC-20 approve()      |                                |
       |-------------------------------------------------------->|  Treasury approved
       |                         |                                |
       |                         |  processCryptoPayment(...)     |
       |                         |  [Any caller, in window]       |
       |                         |------------------------------->|  Payment created + funds locked
       |                         |                                |
       |         --- Both flows continue here ---                 |
       |                         |                                |
       |              --- SUCCESS PATH ---                        |
       |                         |                                |
       |   Vehicle delivered     |  confirmPayment(...)           |
       |                         |  [Platform Admin, in window]   |
       |                         |------------------------------->|  Funds settled
       |                         |                                |
       |                         |  disburseFees()                |
       |                         |  [Any caller, after launch]    |
       |                         |------------------------------->|  Fees → Protocol + Platform
       |                         |                                |
       |                         |  withdraw()                    |
       |                         |  [Admin or Owner, after launch]|
       |                         |------------------------------->|  Dealer paid
       |                         |                                |
       |              --- FAILURE / LATE PATH ---                 |
       |                         |                                |
       |   After deadline +      |  claimExpiredFunds()           |
       |   claim delay           |  [Platform Admin]              |
       |                         |------------------------------->|  Swept → Platform + Protocol
       |   Policy refund         |  (ops / off-chain follow-up)   |
       |<------------------------|                                |
       |                         |                                |
       |   Or: NFT refund        |  claimRefundSelf(paymentId)    |
       |                         |  [Any caller, after launch]    |
       |                         |------------------------------->|  Refund → NFT owner
```

## Key Takeaways

- **ERC-20 approval is required** — James must `approve` the treasury before `processCryptoPayment` can pull tokens
- **Multi-token** — use any **accepted** `paymentToken` for the campaign; balances and sweeps are per ERC-20
- **Time gates are enforced on-chain** — create/confirm/cancel/pay paths must occur within `launchTime` … `deadline + bufferTime`; refunds, fee disbursement, withdrawal, non-goal claims, and expired sweeps require time **after** `launchTime`
- **Same SDK interface** as PaymentTreasury — `oak.paymentTreasury()` works for both; behavior differs in the deployed contract bytecode
- **`claimExpiredFunds()`** is platform-admin-only and only after `deadline + platformClaimDelay`; on-chain recipients are the platform and protocol admins — align customer refunds with your product policy
- **Role-based access** — matches PaymentTreasury for admin-only writes; `withdraw` is platform admin or campaign owner; `disburseFees` is permissionless
- **Three cancellation/refund paths** — `cancelPayment` deletes unconfirmed off-chain records (no on-chain refund); `claimRefund(paymentId, address)` refunds confirmed non-NFT payments (platform admin); `claimRefundSelf(paymentId)` refunds crypto/NFT payments directly (NFT owner, no prior cancel needed; requires prior ERC-721 approval on CampaignInfo)
- **High-value transactions** benefit from deterministic rules instead of informal wire holds
- **Line items** provide a clear audit trail (base price vs. options vs. delivery)
- **Batch, pause, cancel, and `claimNonGoalLineItems`** behave like PaymentTreasury but inherit the same time checks from `TimeConstrainedPaymentTreasury`
