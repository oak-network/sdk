# E-Commerce Marketplace — CeloMarket

## The Business

**CeloMarket** is an online marketplace where independent sellers list physical products (electronics, handmade goods, apparel). Buyers pay using fiat through the platform's UI, but under the hood, funds flow through crypto rails on the Celo network. Funds are locked until the seller ships the product and the platform confirms delivery, providing buyer protection similar to traditional e-commerce escrow.

## Why Oak?

CeloMarket needs:

- **Buyer protection** — funds locked until shipment is confirmed
- **Physical item tracking** — product dimensions, weight, and category stored on-chain via ItemRegistry
- **Multi-line-item orders** — product cost, shipping fee, and platform commission as separate line items
- **Fee transparency** — protocol and platform fees are tracked and disbursed on-chain
- **Fiat-to-fiat UX** — end users see USD prices; crypto conversion happens behind the scenes

## Oak Contracts Used

| Contract | Purpose |
|----------|---------|
| **PaymentTreasury** | Holds buyer funds until delivery is confirmed |
| **ItemRegistry** | Stores physical product metadata (weight, dimensions, category) |

## Multi-token support

**PaymentTreasury** is **multi-token**: each order’s **`paymentToken`** must be on the campaign’s accepted-token list (`isTokenAccepted`). Balances and fee paths are **per ERC-20 contract** (native decimals). This story uses **USDC** for pricing clarity; CeloMarket can offer the same UX in “USD” while settling on-chain in **any whitelisted stablecoin or other ERC-20** your protocol maps to that currency. **`GlobalParams.getTokensForCurrency`** defines the mapping; **`CampaignInfo.getAcceptedTokens`** reflects what that campaign was created with.

## Roles

| Role | Who | On-Chain Functions |
|------|-----|--------------------|
| **Platform Admin** | CeloMarket backend | `createPayment`, `createPaymentBatch`, `confirmPayment`, `confirmPaymentBatch`, `cancelPayment`, `claimRefund(paymentId, address)` (non-NFT), `claimExpiredFunds`, `claimNonGoalLineItems`, `pauseTreasury`, `unpauseTreasury`, `cancelTreasury` |
| **Platform Admin or Campaign Owner** | CeloMarket or seller | `withdraw`, `cancelTreasury` |
| **Buyer** | End customer | ERC-20 `approve`, `processCryptoPayment`, `claimRefundSelf(paymentId)` (NFT payments) |
| **Seller** | Independent merchant | `addItem`, `addItemsBatch` (ItemRegistry) |
| **Protocol Admin** | Oak protocol | Receives protocol fees (via `disburseFees`) |
| **Any caller** | Anyone | `disburseFees`, all read functions (`getPaymentData`, `getRaisedAmount`, `getItem`, `paused`, etc.) |

## Integration Flow

### Step 1: Connect to PaymentTreasury and ItemRegistry

> **Role: Any caller** — connecting and reading state is public.

CeloMarket's backend connects to both contracts.

```typescript
import { createOakContractsClient, CHAIN_IDS, toHex } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL,
  privateKey: process.env.PLATFORM_PRIVATE_KEY as `0x${string}`,
});

const treasury = oak.paymentTreasury(TREASURY_ADDRESS);
const registry = oak.itemRegistry(ITEM_REGISTRY_ADDRESS);
```

### Step 2: Seller lists a product — register in ItemRegistry

> **Role: Seller** — the item registry owner (typically the seller or platform) registers items.

When a seller lists a new product, CeloMarket registers its physical attributes in the ItemRegistry. This data can be used for shipping calculations, customs declarations, and dispute resolution.

```typescript
const productId = toHex("wireless-headphones-v2", { size: 32 });

const item = {
  actualWeight: 250n,                              // 250 grams
  height: 200n,                                     // 200mm
  width: 180n,                                      // 180mm
  length: 80n,                                      // 80mm
  category: toHex("electronics", { size: 32 }),
  declaredCurrency: toHex("USD", { size: 32 }),
};

await registry.simulate.addItem(productId, item);
const txHash = await registry.addItem(productId, item);
await oak.waitForReceipt(txHash);
```

For bulk listings, use batch registration:

```typescript
const productIds = [
  toHex("headphones-black", { size: 32 }),
  toHex("headphones-white", { size: 32 }),
];

const items = [
  { actualWeight: 250n, height: 200n, width: 180n, length: 80n,
    category: toHex("electronics", { size: 32 }),
    declaredCurrency: toHex("USD", { size: 32 }) },
  { actualWeight: 250n, height: 200n, width: 180n, length: 80n,
    category: toHex("electronics", { size: 32 }),
    declaredCurrency: toHex("USD", { size: 32 }) },
];

const txHash = await registry.addItemsBatch(productIds, items);
await oak.waitForReceipt(txHash);
```

### Step 3: Buyer places order — two independent payment flows

CeloMarket supports two payment methods. A platform uses one or both depending on its business model — they are **not** sequential steps.

#### Flow A: Off-chain / fiat payment (`createPayment`)

> **Role: Platform Admin** — only the platform admin can create payment records.

A buyer orders wireless headphones for $79.99. CeloMarket's backend creates a payment record on-chain. **No funds move** — the buyer pays through off-chain rails (credit card, bank transfer, etc.) and CeloMarket calls `confirmPayment` after verifying receipt.

```typescript
const orderId = toHex("order-20260415-001", { size: 32 });
const buyerId = toHex("buyer-alex-042", { size: 32 });

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
  orderId, buyerId, productId, USDC_TOKEN_ADDRESS,
  totalAmount, expiration, lineItems, externalFees,
);

const txHash = await treasury.createPayment(
  orderId, buyerId, productId, USDC_TOKEN_ADDRESS,
  totalAmount, expiration, lineItems, externalFees,
);
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
  orderId, productId, BUYER_ADDRESS, USDC_TOKEN_ADDRESS,
  totalAmount, lineItems, externalFees,
);
await oak.waitForReceipt(txHash);
```

Funds are now **locked** — the seller cannot access them until CeloMarket confirms shipment.

### Step 4: Seller ships — platform confirms payment

> **Role: Platform Admin** — only the platform admin can confirm payments.

The seller uploads a shipping proof (tracking number). CeloMarket's backend verifies and confirms the payment.

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

### Step 5: Read order state — dashboard view

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

### Step 6: Fee disbursement

> **Role: Any caller** — `disburseFees` is permissionless. Fees are sent to the Protocol Admin and Platform Admin automatically.

Protocol and platform fees are distributed before the seller can withdraw.

```typescript
const txHash = await treasury.disburseFees();
await oak.waitForReceipt(txHash);
```

### Step 7: Seller withdrawal

> **Role: Platform Admin or Campaign Owner** — either party can trigger withdrawal. Funds are always sent to the campaign owner (the seller).

The settled amount (product price minus fees) is sent to the seller.

```typescript
const txHash = await treasury.withdraw();
await oak.waitForReceipt(txHash);
```

### Alternative: Buyer refund before shipment

> **Role: Platform Admin** for `cancelPayment` and `claimRefund(paymentId, refundAddress)`. **Buyer (NFT owner)** for `claimRefundSelf(paymentId)` (crypto / NFT payments).

If the buyer cancels before the seller ships, CeloMarket cancels the payment and the buyer gets a refund.

**For off-chain payments (no NFT minted):**

```typescript
// Platform cancels the unconfirmed payment
await treasury.cancelPayment(orderId);

// Platform initiates refund to the buyer's address
await treasury.claimRefund(orderId, BUYER_ADDRESS);
```

**For crypto payments (NFT was minted):**

```typescript
// Anyone can trigger the refund — funds go to the current NFT owner, and the NFT is burned
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

### Reading product data for disputes

> **Role: Any caller** — `getItem` is a public read function.

If a dispute arises (e.g. wrong item shipped), CeloMarket can verify the registered product attributes:

```typescript
const registeredItem = await registry.getItem(SELLER_ADDRESS, productId);
// registeredItem.actualWeight, registeredItem.height, registeredItem.category, etc.
```

## Architecture Diagram

```
Buyer (Alex)              CeloMarket (Platform Admin)        Blockchain
     |                          |                                |
     |   Browse & order         |                                |
     |------------------------->|                                |
     |                          |   addItem() [ItemRegistry]     |
     |                          |   [Seller]                     |
     |                          |------------------------------->|  Product registered
     |                          |                                |
     |            --- FLOW A: Off-chain / fiat payment ---       |
     |                          |                                |
     |                          |   createPayment()              |
     |                          |   [Platform Admin]             |
     |                          |------------------------------->|  Order recorded (no funds)
     |                          |                                |
     |   Buyer pays off-chain   |                                |
     |   (credit card, etc.)    |                                |
     |------------------------->|                                |
     |                          |                                |
     |            --- FLOW B: On-chain crypto payment ---        |
     |                          |                                |
     |   ERC-20 approve()       |                                |
     |------------------------------------------------------>   |  Treasury approved
     |                          |                                |
     |                          |   processCryptoPayment()       |
     |                          |   [Any caller]                 |
     |                          |------------------------------->|  Payment created + funds locked
     |                          |                                |
     |            --- Both flows continue here ---               |
     |                          |                                |
     |                   Seller ships product                    |
     |                          |   confirmPayment()             |
     |                          |   [Platform Admin]             |
     |                          |------------------------------->|  Funds settled
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
- **Multi-token** — orders can settle in any **accepted** `paymentToken`; treasury accounting is per token address
- **ItemRegistry** provides on-chain proof of product attributes for dispute resolution and compliance
- **Role-based access** — `createPayment`/`confirmPayment`/`cancelPayment` are platform-admin-only; `processCryptoPayment` and `disburseFees` are permissionless; `withdraw` requires admin or owner
- **Two refund models** — `claimRefund(paymentId, address)` for non-NFT payments (platform admin only) and `claimRefundSelf(paymentId)` for NFT payments (signer must be NFT owner)
- **Line items** separate product cost, shipping, and commission with configurable goal-counting, fees, and refund rules
- **Non-goal line items** (e.g., platform commission) can be claimed separately via `claimNonGoalLineItems`
- **Batch operations** (`createPaymentBatch`, `confirmPaymentBatch`) enable efficient end-of-day settlement
- **Pause / cancel controls** — platform admin can pause; either admin or owner can permanently cancel
- **Fiat-to-fiat for users** — buyers and sellers deal in USD; crypto conversion is abstracted away
- **Buyer protection** — funds only released after shipment confirmation, with a full refund path
