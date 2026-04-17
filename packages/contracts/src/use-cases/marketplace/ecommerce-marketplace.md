# E-Commerce Marketplace — CeloMarket

## The Business

**CeloMarket** is an online marketplace where independent sellers list physical products (electronics, handmade goods, apparel). Buyers pay using fiat through the platform's UI, but under the hood, funds flow through crypto rails on the Celo network. Funds are locked until the seller ships the product and the platform confirms delivery, providing buyer protection similar to traditional e-commerce escrow.

## Why Oak?

CeloMarket needs:

- **Buyer protection** — funds locked until shipment is confirmed
- **Multi-line-item orders** — product cost, shipping fee, and platform commission as separate line items
- **Fee transparency** — protocol and platform fees are tracked and disbursed on-chain
- **Fiat-to-fiat UX** — end users see USD prices; crypto conversion happens behind the scenes

## Oak Contracts Used

| Contract | Purpose |
|----------|---------|
| **CampaignInfoFactory** | Creates the CampaignInfo contract that holds NFT receipts and the accepted token list |
| **TreasuryFactory** | Deploys the PaymentTreasury clone linked to the CampaignInfo |
| **PaymentTreasury** | Holds buyer funds until delivery is confirmed |

## Multi-token support

**PaymentTreasury** is **multi-token**: each order’s **`paymentToken`** must be on the campaign’s accepted-token list (`isTokenAccepted`). Balances and fee paths are **per ERC-20 contract** (native decimals). This story uses **USDC** for pricing clarity; CeloMarket can offer the same UX in “USD” while settling on-chain in **any whitelisted stablecoin or other ERC-20** your protocol maps to that currency. **`GlobalParams.getTokensForCurrency`** defines the mapping; **`CampaignInfo.getAcceptedTokens`** reflects what that campaign was created with.

## Roles

| Role | Who | On-Chain Functions |
|------|-----|--------------------|
| **Platform Admin** | CeloMarket backend | `createPayment`, `createPaymentBatch`, `confirmPayment`, `confirmPaymentBatch`, `cancelPayment`, `claimRefund(paymentId, address)` (non-NFT), `claimExpiredFunds`, `claimNonGoalLineItems`, `pauseTreasury`, `unpauseTreasury`, `cancelTreasury` |
| **Platform Admin or Campaign Owner** | CeloMarket or seller | `withdraw`, `cancelTreasury` |
| **Buyer** | End customer | ERC-20 `approve`, `processCryptoPayment`, `claimRefundSelf(paymentId)` (NFT payments) |
| **Protocol Admin** | Oak protocol | Receives protocol fees (via `disburseFees`) |
| **Any caller** | Anyone | `disburseFees`, all read functions (`getPaymentData`, `getRaisedAmount`, `paused`, etc.) |

## Integration Flow

### Step 1: Create a CampaignInfo contract

> **Role: Any caller** — `createCampaign` is permissionless.

Before deploying a PaymentTreasury, CeloMarket needs a CampaignInfo contract. This holds NFT receipts for crypto payments and defines the accepted token list.

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

const platformHash = keccak256(toHex("celomarket"));
const identifierHash = keccak256(toHex("celomarket-storefront-2026"));
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
  nftName: "CeloMarket Receipts",
  nftSymbol: "CMR",
  nftImageURI: "ipfs://QmXyz.../celomarket-receipt.png",
  contractURI: "ipfs://QmXyz.../metadata.json",
});

const receipt = await oak.waitForReceipt(txHash);

// Decode the CampaignCreated event from the receipt (recommended)
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

CeloMarket deploys a PaymentTreasury linked to the CampaignInfo from Step 1.

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

### Step 3: Buyer places order — two independent payment flows

CeloMarket supports two payment methods. A platform uses one or both depending on its business model — they are **not** sequential steps.

#### Flow A: Off-chain / fiat payment (`createPayment`)

> **Role: Platform Admin** — only the platform admin can create payment records.

A buyer orders wireless headphones for $79.99. CeloMarket's backend creates a payment record on-chain. The **`createPayment` transaction does not pull ERC-20 from the buyer’s wallet** — it records the order and pending accounting. The buyer pays through off-chain rails (credit card, bank transfer, etc.). Before `confirmPayment`, **the treasury must hold enough of the payment token on-chain** (for example after fiat settlement the platform deposits USDC). The contract checks the treasury balance when confirming.

```typescript
const orderId = toHex("order-20260415-001", { size: 32 });
const buyerId = toHex("buyer-alex-042", { size: 32 });
const itemId = toHex("wireless-headphones-v2", { size: 32 });

const lineItems = [
  { typeId: toHex("product",    { size: 32 }), amount: 69_990000n },  // $69.99 USDC (6 decimals)
  { typeId: toHex("shipping",   { size: 32 }), amount: 7_500000n },  // $7.50
  { typeId: toHex("commission", { size: 32 }), amount: 2_500000n },  // $2.50
];

const externalFees = [
  { feeType: toHex("payment-processing", { size: 32 }), feeAmount: 1_200000n },  // $1.20
];

const totalAmount = 79_990000n;  // $79.99 USDC
const expiration = BigInt(Math.floor(Date.now() / 1000) + 30 * 86400); // 30 days

await treasury.simulate.createPayment(
  orderId, buyerId, itemId, USDC_TOKEN_ADDRESS,
  totalAmount, expiration, lineItems, externalFees,
);

const txHash = await treasury.createPayment(
  orderId, buyerId, itemId, USDC_TOKEN_ADDRESS,
  totalAmount, expiration, lineItems, externalFees,
);
await oak.waitForReceipt(txHash);
```

After `createPayment`, **fund the treasury** with the agreed token amount before calling `confirmPayment` (operational path is product-specific).

##### Confirm after shipment (platform admin)

> **Role: Platform Admin** — `confirmPayment` applies only to payments created with `createPayment`.

The seller uploads a shipping proof (tracking number). After verification **and** once the treasury holds the required ERC-20, CeloMarket confirms the payment on-chain.

```typescript
await treasury.simulate.confirmPayment(orderId, BUYER_ADDRESS);

const txHash = await treasury.confirmPayment(orderId, BUYER_ADDRESS);
await oak.waitForReceipt(txHash);
```

For batch order processing (e.g. end-of-day settlement):

```typescript
const orderIds = [orderId1, orderId2, orderId3];
const buyerAddresses = [buyer1, buyer2, buyer3];

const txHash = await treasury.confirmPaymentBatch(orderIds, buyerAddresses);
await oak.waitForReceipt(txHash);
```

#### Flow B: On-chain crypto payment (`processCryptoPayment`)

> **Role: Any caller** — `processCryptoPayment` is permissionless, but the buyer must first approve the treasury to transfer their ERC-20 tokens.

This is a **standalone operation** — it creates the payment record AND transfers ERC-20 tokens in a single transaction. It does **not** require or complete a prior `createPayment` call. An NFT is minted to the buyer as proof of payment.

Before the treasury can pull funds, the buyer must grant an ERC-20 allowance:

```typescript
import { erc20Abi } from "viem";

const usdc = { address: USDC_TOKEN_ADDRESS, abi: erc20Abi };

// Buyer approves the treasury to spend the order amount
const approveTx = await walletClient.writeContract({
  ...usdc,
  functionName: "approve",
  args: [TREASURY_ADDRESS, totalAmount],
});
await publicClient.waitForTransactionReceipt({ hash: approveTx });
```

Now the payment can be processed:

```typescript
const txHash = await treasury.processCryptoPayment(
  orderId, itemId, BUYER_ADDRESS, USDC_TOKEN_ADDRESS,
  totalAmount, lineItems, externalFees,
);
await oak.waitForReceipt(txHash);
```

### Step 4: Read order state — dashboard view

> **Role: Any caller** — all read functions are public.

CeloMarket's admin dashboard reads the payment details and treasury state.

```typescript
// Read specific order
const paymentData = await treasury.getPaymentData(orderId);
// paymentData.isConfirmed, paymentData.amount, paymentData.lineItems, etc.

// Read treasury-wide metrics
const [raised, available, refunded, expected] = await oak.multicall([
  () => treasury.getRaisedAmount(),
  () => treasury.getAvailableRaisedAmount(),
  () => treasury.getRefundedAmount(),
  () => treasury.getExpectedAmount(),
]);
```

### Step 5: Fee disbursement

> **Role: Any caller** — `disburseFees` is permissionless. Fees are sent to the Protocol Admin and Platform Admin automatically.

Protocol and platform fees are distributed before the seller can withdraw.

```typescript
const txHash = await treasury.disburseFees();
await oak.waitForReceipt(txHash);
```

### Step 6: Seller withdrawal

> **Role: Platform Admin or Campaign Owner** — either party can trigger withdrawal. Funds are always sent to the campaign owner (the seller).

The settled amount (product price minus fees) is sent to the seller.

```typescript
const txHash = await treasury.withdraw();
await oak.waitForReceipt(txHash);
```

### Alternative: Cancellation and refund flows

> Three distinct paths exist depending on payment state and type:

**A) Cancel an unconfirmed off-chain payment (before `confirmPayment`):**

> **Role: Platform Admin** — `cancelPayment` works only on unconfirmed, non-expired, non-crypto payments. The transaction **drops pending accounting**; it **does not** automatically return ERC-20 already sent to the treasury—recover tokens operationally if needed. Off-chain refunds (credit card reversal, etc.) are handled outside this call.

```typescript
await treasury.cancelPayment(orderId);
```

**B) Refund a confirmed off-chain payment (non-NFT):**

> **Role: Platform Admin** — `claimRefund(paymentId, refundAddress)` refunds a confirmed payment where no NFT was minted (`confirmPayment` was called without a `buyerAddress`, or `buyerAddress` was `address(0)`). The contract verifies the payment is confirmed and has `tokenId == 0`.

```typescript
await treasury.claimRefund(orderId, BUYER_ADDRESS);
```

**C) Refund a crypto payment (NFT was minted):**

> **Role: Any caller (NFT owner)** — `claimRefundSelf(paymentId)` is for crypto payments (auto-confirmed on creation). The contract looks up the NFT owner, burns the NFT, and sends the refundable amount to that owner. No prior `cancelPayment` is needed — crypto payments cannot be cancelled via `cancelPayment`.

Before calling `claimRefundSelf`, the NFT owner must approve the treasury to manage the NFT. All pledge NFTs live on the **CampaignInfo** contract (not the treasury itself), so approval uses the CampaignInfo SDK entity:

```typescript
const campaign = oak.campaignInfo(CAMPAIGN_INFO_ADDRESS);
await campaign.approve(TREASURY_ADDRESS, tokenId);

await treasury.claimRefundSelf(orderId);
```

### Claim non-goal line items

> **Role: Platform Admin** — only the platform admin can claim non-goal line items.

If the order included line items that don't count toward the campaign goal (e.g., platform commission, shipping fees configured as non-goal), these accumulate separately. The platform admin can claim them at any time after confirmation.

```typescript
const txHash = await treasury.claimNonGoalLineItems(USDC_TOKEN_ADDRESS);
await oak.waitForReceipt(txHash);
```

### Pause, unpause, or cancel the treasury

**Pause the treasury:**

> **Role: Platform Admin** — only the platform admin can pause and unpause.

If CeloMarket needs to halt operations (e.g., suspected fraud, compliance review):

```typescript
const txHash = await treasury.pauseTreasury(toHex("fraud-investigation", { size: 32 }));
await oak.waitForReceipt(txHash);

const isPaused = await treasury.paused();
```

While paused, no payments, confirmations, refunds, or withdrawals can occur.

**Unpause the treasury:**

> **Role: Platform Admin**

```typescript
const txHash = await treasury.unpauseTreasury(toHex("investigation-cleared", { size: 32 }));
await oak.waitForReceipt(txHash);
```

**Cancel the treasury permanently:**

> **Role: Platform Admin or Campaign Owner** — either party can cancel.

Cancellation is irreversible. After cancellation, buyers can still claim refunds for confirmed NFT payments, but no new payments or withdrawals can happen.

```typescript
const txHash = await treasury.cancelTreasury(toHex("marketplace-shutdown", { size: 32 }));
await oak.waitForReceipt(txHash);

const isCancelled = await treasury.cancelled();
```

## Architecture Diagram

```
Buyer (Alex)              CeloMarket (Platform Admin)        Blockchain
     |                          |                                |
     |   Browse & order         |                                |
     |------------------------->|                                |
     |                          |                                |
     |            --- FLOW A: Off-chain / fiat payment ---       |
     |                          |                                |
     |                          |   createPayment()              |
     |                          |   [Platform Admin]             |
     |                          |------------------------------->|  Order recorded (no pull from buyer)
     |                          |                                |
     |   Buyer pays off-chain   |                                |
     |   (credit card, etc.)    |                                |
     |------------------------->|                                |
     |                          |                                |
     |   Tokens to treasury     |   (deposit / bridge / ops)     |
     |                          |------------------------------->|  Balance must cover confirm
     |                          |                                |
     |                   Seller ships product                    |
     |                          |   confirmPayment()             |
     |                          |   [Platform Admin]             |
     |                          |------------------------------->|  Flow A: pending → confirmed
     |                          |                                |
     |            --- FLOW B: On-chain crypto payment ---        |
     |                          |                                |
     |   ERC-20 approve()       |                                |
     |------------------------------------------------------>   |  Treasury approved
     |                          |                                |
     |                          |   processCryptoPayment()       |
     |                          |   [Any caller]                 |
     |                          |------------------------------->|  Pull + confirmed + NFT
     |                          |                                |
     |            --- Both flows (after Flow A confirm or Flow B) --- |
     |                          |                                |
     |                          |   claimNonGoalLineItems()      |
     |                          |   [Platform Admin]             |
     |                          |------------------------------->|  Non-goal items claimed
     |                          |                                |
     |                          |   disburseFees()               |
     |                          |   [Any caller]                 |
     |                          |------------------------------->|  Fees → Protocol + Platform
     |                          |                                |
     |                          |   withdraw()                   |
     |                          |   [Admin or Owner]             |
     |                          |------------------------------->|  Funds → Seller
     |                          |                                |
     |  [Optional] Pause /      |   pauseTreasury() /            |
     |   Cancel                 |   cancelTreasury()             |
     |                          |   [Platform Admin / Owner]     |
     |                          |------------------------------->|  Treasury state updated
```

## Key Takeaways

- **ERC-20 approval is required** — the buyer must `approve` the treasury contract before `processCryptoPayment` can transfer tokens
- **`createPayment` path** — `createPayment` does not pull tokens from the buyer; fund the treasury before `confirmPayment`
- **`processCryptoPayment` path** — confirms in one transaction; then `disburseFees` / `withdraw`—do not call `confirmPayment` for these payments
- **Multi-token** — orders can settle in any **accepted** `paymentToken`; treasury accounting is per token address
- **Role-based access** — `createPayment`/`confirmPayment`/`cancelPayment` are platform-admin-only; `processCryptoPayment` and `disburseFees` are permissionless; `withdraw` requires admin or owner
- **Three cancellation/refund paths** — `cancelPayment` deletes unconfirmed off-chain records (no on-chain refund); `claimRefund(paymentId, address)` refunds confirmed non-NFT payments (platform admin); `claimRefundSelf(paymentId)` refunds crypto/NFT payments directly (NFT owner, no prior cancel needed; requires prior ERC-721 approval on CampaignInfo)
- **Line items** separate product cost, shipping, and commission with configurable goal-counting, fees, and refund rules
- **Non-goal line items** (e.g., platform commission) can be claimed separately via `claimNonGoalLineItems`
- **Batch operations** (`createPaymentBatch`, `confirmPaymentBatch`) enable efficient end-of-day settlement
- **Pause / cancel controls** — platform admin can pause; either admin or owner can permanently cancel
- **Fiat-to-fiat for users** — buyers and sellers deal in USD; crypto conversion is abstracted away
- **Buyer protection** — funds stay in the treasury under contract rules until withdrawal; refunds use `cancelPayment`, `claimRefund`, or `claimRefundSelf` as applicable
