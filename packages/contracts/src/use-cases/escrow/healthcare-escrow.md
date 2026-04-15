# Healthcare Escrow — MedConnect

## The Business

**MedConnect** is a healthcare platform that connects patients with specialist doctors for consultations, lab work, and follow-up care. Patients pay upfront, but their funds are held in escrow until the doctor confirms the service was delivered. If the service is not delivered within the agreed timeframe, the patient gets a full refund.

## Why Oak?

MedConnect needs a trustless escrow mechanism that:

- Holds patient payments securely until service confirmation
- Allows the platform to confirm delivery on behalf of the provider
- Enables automatic refunds if service is not delivered
- Tracks fees (platform booking fee, protocol fee) transparently
- Works with **any accepted ERC-20** on the campaign’s token whitelist (examples below use USDC for readability)

## Oak Contract Used

**PaymentTreasury** — a smart contract that holds funds until the platform confirms service delivery. Supports line items, external fees, and refund flows.

### Multi-token support

Payments specify **`paymentToken`**; the contract reverts unless **`CampaignInfo.isTokenAccepted(paymentToken)`** is true. The campaign may accept **several ERC-20s** for one logical currency; pending, confirmed, fee, and refund accounting is **per token address** in each token’s **native decimals**. Snippets in this guide use **USDC** as a stand-in—use any whitelisted token your `GlobalParams` / campaign configuration allows. Resolve the list with **`globalParams.getTokensForCurrency(currency)`** or read the campaign’s cached copy via **`campaign.getAcceptedTokens()`** (same addresses the factory stored at creation).

## Roles

| Role | Who | On-Chain Functions |
|------|-----|--------------------|
| **Platform Admin** | MedConnect backend | `createPayment`, `createPaymentBatch`, `confirmPayment`, `confirmPaymentBatch`, `cancelPayment`, `claimRefund(paymentId, address)` (non-NFT), `claimExpiredFunds`, `claimNonGoalLineItems`, `pauseTreasury`, `unpauseTreasury`, `cancelTreasury` |
| **Platform Admin or Campaign Owner** | MedConnect or clinic | `withdraw`, `cancelTreasury` |
| **Patient (Buyer)** | Sarah | ERC-20 `approve`, `processCryptoPayment`, `claimRefundSelf(paymentId)` (NFT payments) |
| **Protocol Admin** | Oak protocol | Receives protocol fees (via `disburseFees`) |
| **Any caller** | Anyone | `disburseFees`, all read functions (`getPaymentData`, `getRaisedAmount`, `getExpectedAmount`, `paused`, etc.) |

## Integration Flow

### Step 1: Connect to the deployed PaymentTreasury

> **Role: Any caller** — connecting and reading treasury state is public.

MedConnect has a PaymentTreasury deployed for its healthcare escrow pool. The backend connects using the SDK.

```typescript
import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL,
  privateKey: process.env.PLATFORM_PRIVATE_KEY as `0x${string}`,
});

const treasury = oak.paymentTreasury(TREASURY_ADDRESS);

// Verify the treasury is operational
const isPaused = await treasury.paused();
const isCancelled = await treasury.cancelled();
```

### Step 2: Patient books appointment — create payment

> **Role: Platform Admin** — only the platform admin can create payment records.

Sarah books a cardiology consultation with Dr. Rivera. The appointment costs 150 USDC broken down into two line items: consultation (120 USDC) and lab work (30 USDC).

```typescript
import { toHex } from "@oaknetwork/contracts-sdk";

const paymentId = toHex("medconnect-appt-12345", { size: 32 });
const buyerId = toHex("patient-sarah-001", { size: 32 });
const itemId = toHex("cardiology-consult", { size: 32 });

const lineItems = [
  { typeId: toHex("consultation", { size: 32 }), amount: 120_000000n },  // 120 USDC (6 decimals)
  { typeId: toHex("lab-work", { size: 32 }),      amount: 30_000000n },  // 30 USDC
];

const externalFees = [
  { feeType: toHex("platform-booking-fee", { size: 32 }), feeAmount: 5_000000n },  // 5 USDC
];

// Simulate first to catch errors before spending gas
await treasury.simulate.createPayment(
  paymentId, buyerId, itemId, USDC_TOKEN_ADDRESS,
  150_000000n,                                       // total: 150 USDC
  BigInt(Math.floor(Date.now() / 1000) + 7 * 86400), // expires in 7 days
  lineItems, externalFees,
);

// Send the transaction
const txHash = await treasury.createPayment(
  paymentId, buyerId, itemId, USDC_TOKEN_ADDRESS,
  150_000000n,
  BigInt(Math.floor(Date.now() / 1000) + 7 * 86400),
  lineItems, externalFees,
);
await oak.waitForReceipt(txHash);
```

At this point the payment record exists on-chain, but **no funds have moved yet**. The treasury is waiting for Sarah to pay.

### Step 3: Patient pays — crypto payment processed on-chain

> **Role: Any caller** — `processCryptoPayment` is permissionless, but the buyer must first approve the treasury to transfer their ERC-20 tokens.

Sarah opens the MedConnect app, sees the $150 charge, and approves the transfer. Before the treasury can pull funds, Sarah must grant an ERC-20 allowance:

```typescript
import { erc20Abi } from "viem";

const usdc = { address: USDC_TOKEN_ADDRESS, abi: erc20Abi };

// Sarah approves the treasury to spend up to 150 USDC
const approveTx = await walletClient.writeContract({
  ...usdc,
  functionName: "approve",
  args: [TREASURY_ADDRESS, 150_000000n],
});
await publicClient.waitForTransactionReceipt({ hash: approveTx });
```

Now the payment can be processed:

```typescript
const txHash = await treasury.processCryptoPayment(
  paymentId, itemId, SARAH_WALLET_ADDRESS, USDC_TOKEN_ADDRESS,
  150_000000n,
  lineItems, externalFees,
);
await oak.waitForReceipt(txHash);
```

Funds are now **locked in the treasury**. Sarah cannot withdraw them, and neither can Dr. Rivera — only the platform can release them by confirming delivery.

### Step 4: Doctor confirms service delivery

> **Role: Platform Admin** — only the platform admin can confirm payments.

Dr. Rivera completes the consultation and marks it as delivered in the MedConnect dashboard. The backend calls `confirmPayment` to release the escrowed funds.

```typescript
await treasury.simulate.confirmPayment(paymentId, SARAH_WALLET_ADDRESS);

const txHash = await treasury.confirmPayment(paymentId, SARAH_WALLET_ADDRESS);
await oak.waitForReceipt(txHash);
```

The payment status is now **confirmed**. Funds are settled and ready for fee disbursement and withdrawal.

### Step 5: Read the final treasury state

> **Role: Any caller** — all read functions are public.

MedConnect's dashboard shows the current state of the escrow pool.

```typescript
const [raised, available, lifetime, refunded] = await oak.multicall([
  () => treasury.getRaisedAmount(),
  () => treasury.getAvailableRaisedAmount(),
  () => treasury.getLifetimeRaisedAmount(),
  () => treasury.getRefundedAmount(),
]);
```

### Step 6: Disburse fees

> **Role: Any caller** — `disburseFees` is permissionless. Fees are sent to the Protocol Admin and Platform Admin automatically.

Before the provider can withdraw, accumulated protocol and platform fees are distributed.

```typescript
const txHash = await treasury.disburseFees();
await oak.waitForReceipt(txHash);
```

### Step 7: Withdraw settled funds

> **Role: Platform Admin or Campaign Owner** — either party can trigger withdrawal. Funds are always sent to the campaign owner (Dr. Rivera's clinic).

The settled amount (minus fees) is sent to the campaign owner.

```typescript
const txHash = await treasury.withdraw();
await oak.waitForReceipt(txHash);
```

### Alternative: Cancel and refund flow

> **Role: Platform Admin** for `cancelPayment` and `claimRefund(paymentId, refundAddress)`. **Buyer (NFT owner)** for `claimRefundSelf(paymentId)` (crypto / NFT payments — refund to current NFT owner).

If Sarah needs to cancel the appointment before the doctor confirms delivery, MedConnect cancels the payment and initiates a refund.

**For off-chain payments (no NFT minted):**

```typescript
// Platform cancels the unconfirmed payment
await treasury.cancelPayment(paymentId);

// Platform initiates refund to Sarah's address
await treasury.claimRefund(paymentId, SARAH_WALLET_ADDRESS);
```

**For crypto payments (NFT was minted via `processCryptoPayment` or `confirmPayment` with buyerAddress):**

```typescript
// Anyone can trigger the refund — funds go to the current NFT owner, and the NFT is burned
await treasury.claimRefundSelf(paymentId);
```

### Step 8: Claim non-goal line items

> **Role: Platform Admin** — only the platform admin can claim non-goal line items.

If the payment included line items that don't count toward the campaign goal (e.g., platform commission, processing fees), these accumulate separately. The platform admin can claim them at any time after confirmation.

```typescript
const txHash = await treasury.claimNonGoalLineItems(USDC_TOKEN_ADDRESS);
await oak.waitForReceipt(txHash);
```

### Step 9: Pause, unpause, or cancel the treasury

**Pause the treasury:**

> **Role: Platform Admin** — only the platform admin can pause and unpause.

If MedConnect needs to halt operations for compliance or investigation:

```typescript
const txHash = await treasury.pauseTreasury(toHex("compliance-review", { size: 32 }));
await oak.waitForReceipt(txHash);

const isPaused = await treasury.paused();
```

While paused, no payments, confirmations, refunds, or withdrawals can occur.

**Unpause the treasury:**

> **Role: Platform Admin**

```typescript
const txHash = await treasury.unpauseTreasury(toHex("review-complete", { size: 32 }));
await oak.waitForReceipt(txHash);
```

**Cancel the treasury permanently:**

> **Role: Platform Admin or Campaign Owner** — either party can cancel.

Cancellation is irreversible. After cancellation, backers can still claim refunds for confirmed NFT payments, but no new payments, confirmations, or withdrawals can happen.

```typescript
const txHash = await treasury.cancelTreasury(toHex("treasury-shutdown", { size: 32 }));
await oak.waitForReceipt(txHash);

const isCancelled = await treasury.cancelled();
```

### Batch operations

> **Role: Platform Admin** — batch create and confirm are platform-admin-only.

For high-volume platforms, PaymentTreasury supports batch operations to reduce gas costs and prevent nonce conflicts.

**Batch create payments:**

```typescript
const paymentIds = [
  toHex("appt-001", { size: 32 }),
  toHex("appt-002", { size: 32 }),
];
const buyerIds = [
  toHex("patient-sarah", { size: 32 }),
  toHex("patient-john", { size: 32 }),
];
const itemIds = [
  toHex("cardiology", { size: 32 }),
  toHex("dermatology", { size: 32 }),
];
const tokens = [USDC_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS];
const amounts = [150_000000n, 200_000000n];
const expirations = [
  BigInt(Math.floor(Date.now() / 1000) + 7 * 86400),
  BigInt(Math.floor(Date.now() / 1000) + 7 * 86400),
];

const txHash = await treasury.createPaymentBatch(
  paymentIds, buyerIds, itemIds, tokens, amounts, expirations,
  [lineItems1, lineItems2], [externalFees1, externalFees2],
);
await oak.waitForReceipt(txHash);
```

**Batch confirm payments:**

```typescript
const txHash = await treasury.confirmPaymentBatch(
  [toHex("appt-001", { size: 32 }), toHex("appt-002", { size: 32 })],
  [SARAH_WALLET_ADDRESS, JOHN_WALLET_ADDRESS],
);
await oak.waitForReceipt(txHash);
```

## Architecture Diagram

```
Patient (Sarah)                  MedConnect (Platform Admin)      PaymentTreasury
       |                                |                               |
       |   Books appointment            |                               |
       |------------------------------->|                               |
       |                                |  createPayment(...)           |
       |                                |  [Platform Admin]             |
       |                                |------------------------------>|  Payment record created
       |                                |                               |
       |   ERC-20 approve()             |                               |
       |--------------------------------------------------------------->|  Treasury approved to spend
       |                                |                               |
       |                                |  processCryptoPayment(...)    |
       |                                |  [Any caller]                 |
       |                                |------------------------------>|  Funds locked in escrow
       |                                |                               |
       |                     Doctor confirms delivery                   |
       |                                |  confirmPayment(...)          |
       |                                |  [Platform Admin]             |
       |                                |------------------------------>|  Funds settled
       |                                |                               |
       |                                |  claimNonGoalLineItems()      |
       |                                |  [Platform Admin]             |
       |                                |------------------------------>|  Non-goal items claimed
       |                                |                               |
       |                                |  disburseFees()               |
       |                                |  [Any caller]                 |
       |                                |------------------------------>|  Fees → Protocol + Platform
       |                                |                               |
       |                                |  withdraw()                   |
       |                                |  [Admin or Owner]             |
       |                                |------------------------------>|  Funds → Provider
       |                                |                               |
       |  [Optional] Pause / Cancel     |  pauseTreasury() /            |
       |                                |  cancelTreasury()             |
       |                                |  [Platform Admin / Owner]     |
       |                                |------------------------------>|  Treasury state updated
```

## Key Takeaways

- **ERC-20 approval is required** — the buyer must `approve` the treasury contract before `processCryptoPayment` can transfer tokens
- **Multi-token** — `paymentToken` must be on the campaign’s accepted list; balances and refunds are tracked per ERC-20 (each token’s decimals)
- **Funds are never at risk** — they stay locked in the smart contract until service is confirmed
- **Role-based access** — `createPayment`/`confirmPayment`/`cancelPayment` are platform-admin-only; `processCryptoPayment` and `disburseFees` are permissionless; `withdraw` requires admin or owner
- **Two refund models** — `claimRefund(paymentId, address)` for non-NFT payments (platform admin only) and `claimRefundSelf(paymentId)` for NFT payments (signer must be NFT owner; burns pledge NFT)
- **Line items** allow granular tracking (consultation vs. lab work) with configurable goal-counting, fees, and refund rules
- **Non-goal line items** (e.g., platform commission) can be claimed separately via `claimNonGoalLineItems`
- **Batch operations** — `createPaymentBatch` and `confirmPaymentBatch` for high-volume platforms
- **Pause / cancel controls** — platform admin can pause; either admin or owner can permanently cancel
- **External fees** track platform charges transparently on-chain (informational only, no financial impact)
- **Simulate before send** catches errors before spending gas
- **`multicall`** batches multiple reads into a single RPC call for dashboard views
