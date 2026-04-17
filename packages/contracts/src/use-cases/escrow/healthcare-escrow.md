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

| Contract | Purpose |
|----------|---------|
| **CampaignInfoFactory** | Creates the CampaignInfo contract that holds NFT receipts and the accepted token list |
| **TreasuryFactory** | Deploys the PaymentTreasury clone linked to the CampaignInfo |
| **PaymentTreasury** | Holds patient funds until the platform confirms service delivery. Supports line items, external fees, and refund flows |

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

### Step 1: Create a CampaignInfo contract

> **Role: Any caller** — `createCampaign` is permissionless.

Before deploying a PaymentTreasury, MedConnect needs a CampaignInfo contract. This holds NFT receipts for crypto payments and defines the accepted token list.

```typescript
import {
  createOakContractsClient, keccak256, toHex,
  getCurrentTimestamp, addDays, CHAIN_IDS, CAMPAIGN_INFO_FACTORY_EVENTS,
} from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL,
  privateKey: process.env.PLATFORM_PRIVATE_KEY as `0x${string}`,
});

const factory = oak.campaignInfoFactory(CAMPAIGN_INFO_FACTORY_ADDRESS);

const platformHash = keccak256(toHex("medconnect"));
const identifierHash = keccak256(toHex("medconnect-escrow-2026"));
const now = getCurrentTimestamp();

const txHash = await factory.createCampaign({
  creator: PLATFORM_ADMIN_ADDRESS,
  identifierHash,
  selectedPlatformHash: [platformHash],
  campaignData: {
    launchTime: now,
    deadline: addDays(now, 365),
    goalAmount: 0n,
    currency: toHex("USD", { size: 32 }),
  },
  nftName: "MedConnect Receipts",
  nftSymbol: "MCR",
  nftImageURI: "ipfs://QmXyz.../medconnect-receipt.png",
  contractURI: "ipfs://QmXyz.../metadata.json",
});

const receipt = await oak.waitForReceipt(txHash);

let campaignInfoAddress: `0x${string}` | undefined;
for (const log of receipt.logs) {
  try {
    const decoded = factory.events.decodeLog({
      topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
      data: log.data as `0x${string}`,
    });
    if (decoded.eventName === CAMPAIGN_INFO_FACTORY_EVENTS.CampaignCreated) {
      campaignInfoAddress = decoded.args?.campaignInfoAddress as `0x${string}`;
      break;
    }
  } catch { /* log from a different contract */ }
}
```

### Step 2: Deploy the PaymentTreasury

> **Role: Any caller** — `deploy` on TreasuryFactory is permissionless (the implementation must have been registered and approved during platform onboarding).

MedConnect deploys a PaymentTreasury linked to the CampaignInfo from Step 1.

```typescript
import { TREASURY_FACTORY_EVENTS } from "@oaknetwork/contracts-sdk";

const treasuryFactory = oak.treasuryFactory(TREASURY_FACTORY_ADDRESS);

const deployTxHash = await treasuryFactory.deploy(
  platformHash,
  campaignInfoAddress!,
  2n, // PaymentTreasury implementation ID
);

const deployReceipt = await oak.waitForReceipt(deployTxHash);

let treasuryAddress: `0x${string}` | undefined;
for (const log of deployReceipt.logs) {
  try {
    const decoded = treasuryFactory.events.decodeLog({
      topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
      data: log.data as `0x${string}`,
    });
    if (decoded.eventName === TREASURY_FACTORY_EVENTS.TreasuryDeployed) {
      treasuryAddress = decoded.args?.treasuryAddress as `0x${string}`;
      break;
    }
  } catch { /* log from a different contract */ }
}

const treasury = oak.paymentTreasury(treasuryAddress!);
```

### Step 3: Patient books appointment — two independent payment flows

Sarah books a cardiology consultation with Dr. Rivera. The appointment costs 150 USDC broken down into two line items: consultation (120 USDC) and lab work (30 USDC).

MedConnect supports two payment methods — they are **not** sequential steps:

#### Flow A: Off-chain / fiat payment (`createPayment`)

> **Role: Platform Admin** — only the platform admin can create payment records.

MedConnect creates a payment record on-chain. **No funds move** — Sarah pays through off-chain rails (credit card, insurance billing, etc.) and MedConnect calls `confirmPayment` after verifying receipt.

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

At this point the payment record exists on-chain, but **no funds have moved yet**. Sarah pays through off-chain channels.

#### Flow B: On-chain crypto payment (`processCryptoPayment`)

> **Role: Any caller** — `processCryptoPayment` is permissionless, but the buyer must first approve the treasury to transfer their ERC-20 tokens.

This is a **standalone operation** — it creates the payment record AND transfers ERC-20 tokens in a single transaction. It does **not** require or complete a prior `createPayment` call. An NFT is minted to Sarah as proof of payment.

Sarah opens the MedConnect app, sees the $150 charge, and approves the transfer:

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

### Alternative: Cancellation and refund flows

> Three distinct paths exist depending on payment state and type:

**A) Cancel an unconfirmed off-chain payment (before `confirmPayment`):**

> **Role: Platform Admin** — `cancelPayment` works only on unconfirmed, non-expired, non-crypto payments. No on-chain funds were transferred for off-chain payments, so the on-chain record is simply deleted. Any off-chain refund is handled by MedConnect outside the contract.

```typescript
await treasury.cancelPayment(paymentId);
```

**B) Refund a confirmed off-chain payment (non-NFT):**

> **Role: Platform Admin** — `claimRefund(paymentId, refundAddress)` refunds a confirmed payment where no NFT was minted. The contract verifies the payment is confirmed and has `tokenId == 0`.

```typescript
await treasury.claimRefund(paymentId, SARAH_WALLET_ADDRESS);
```

**C) Refund a crypto payment (NFT was minted via `processCryptoPayment`):**

> **Role: Any caller (NFT owner)** — `claimRefundSelf(paymentId)` is for crypto payments (auto-confirmed on creation). The contract looks up the NFT owner, burns the NFT, and sends the refundable amount to that owner. No prior `cancelPayment` is needed — crypto payments cannot be cancelled via `cancelPayment`.

Before calling `claimRefundSelf`, the NFT owner must approve the treasury to manage the NFT. All pledge NFTs live on the **CampaignInfo** contract (not the treasury itself), so approval uses the CampaignInfo SDK entity:

```typescript
const campaign = oak.campaignInfo(CAMPAIGN_INFO_ADDRESS);
await campaign.approve(TREASURY_ADDRESS, tokenId);

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
       |                                |                               |
       |         --- FLOW A: Off-chain / fiat payment ---               |
       |                                |                               |
       |                                |  createPayment(...)           |
       |                                |  [Platform Admin]             |
       |                                |------------------------------>|  Payment recorded (no funds)
       |                                |                               |
       |   Pays off-chain               |                               |
       |   (insurance, credit card)     |                               |
       |------------------------------->|                               |
       |                                |                               |
       |         --- FLOW B: On-chain crypto payment ---                |
       |                                |                               |
       |   ERC-20 approve()             |                               |
       |--------------------------------------------------------------->|  Treasury approved to spend
       |                                |                               |
       |                                |  processCryptoPayment(...)    |
       |                                |  [Any caller]                 |
       |                                |------------------------------>|  Payment created + funds locked
       |                                |                               |
       |         --- Both flows continue here ---                       |
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
- **Three cancellation/refund paths** — `cancelPayment` deletes unconfirmed off-chain records (no on-chain refund); `claimRefund(paymentId, address)` refunds confirmed non-NFT payments (platform admin); `claimRefundSelf(paymentId)` refunds crypto/NFT payments directly (NFT owner, no prior cancel needed; burns pledge NFT — requires prior ERC-721 approval on the CampaignInfo contract)
- **Line items** allow granular tracking (consultation vs. lab work) with configurable goal-counting, fees, and refund rules
- **Non-goal line items** (e.g., platform commission) can be claimed separately via `claimNonGoalLineItems`
- **Batch operations** — `createPaymentBatch` and `confirmPaymentBatch` for high-volume platforms
- **Pause / cancel controls** — platform admin can pause; either admin or owner can permanently cancel
- **External fees** track platform charges transparently on-chain (informational only, no financial impact)
- **Simulate before send** catches errors before spending gas
- **`multicall`** batches multiple reads into a single RPC call for dashboard views
