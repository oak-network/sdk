/**
 * Step 2: Create a Payment Record (Platform Admin) — Off-Chain Payment Flow
 *
 * Sam has added a handcrafted ceramic vase ($120) to his cart and
 * proceeds to checkout. CeloMarket creates a payment record on-chain
 * that describes the order:
 *
 *   - A unique payment ID derived from the order number
 *   - Line items: product price ($120) and shipping ($15)
 *   - External fee metadata (e.g., payment processor fee) for accounting
 *   - A 24-hour expiration window — if Sam does not pay within this
 *     time, the payment record expires
 *
 * This step does not move any funds. It records the payment intent
 * on-chain. The buyer pays through off-chain rails (credit card, bank
 * transfer, etc.) and the platform later confirms via `confirmPayment`.
 *
 * This is one of two independent payment flows:
 *   - Flow A (`createPayment` → off-chain payment → `confirmPayment`):
 *     shown here — platform-initiated, no on-chain token transfer.
 *   - Flow B (`processCryptoPayment`): shown in Step 3 — buyer pays
 *     directly on-chain with ERC-20 tokens in a single transaction.
 *
 * For high-volume platforms, `createPaymentBatch` is available to
 * create multiple payment records in a single transaction.
 *
 * Multi-token: `paymentToken` must be on the campaign’s accepted-token
 * list (`CampaignInfo.isTokenAccepted`). Balances and refunds are tracked
 * per ERC-20. See Scenario 0 for currency ↔ token mapping in GlobalParams.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";
import type { LineItem, ExternalFees } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PLATFORM_PRIVATE_KEY! as `0x${string}`,
});

const paymentTreasury = oak.paymentTreasury(
  process.env.PAYMENT_TREASURY_ADDRESS! as `0x${string}`,
);

const paymentId = keccak256(toHex("order-12345"));
const buyerId = keccak256(toHex("sam-user-id"));
const itemId = keccak256(toHex("handcrafted-vase-001"));
const paymentToken = process.env.USDC_TOKEN_ADDRESS! as `0x${string}`;
const totalAmount = 135_000_000n; // $135 total (product + shipping)
const expiration = BigInt(Math.floor(Date.now() / 1000)) + 86400n; // 24 hours

const lineItems: LineItem[] = [
  {
    typeId: keccak256(toHex("product")),    // product price
    amount: 120_000_000n,                   // $120
  },
  {
    typeId: keccak256(toHex("shipping")),   // shipping fee
    amount: 15_000_000n,                    // $15
  },
];

const externalFees: ExternalFees[] = [
  {
    feeType: keccak256(toHex("payment-processor")),
    feeAmount: 2_700_000n,  // $2.70 (2% payment processor fee)
  },
];

// --- Create a single payment ---

const txHash = await paymentTreasury.createPayment(
  paymentId,
  buyerId,
  itemId,
  paymentToken,
  totalAmount,
  expiration,
  lineItems,
  externalFees,
);

await oak.waitForReceipt(txHash);
console.log("Payment created for order #12345");

// --- Batch creation — multiple payments in one transaction ---

// const paymentId2 = keccak256(toHex("order-12346"));
// const buyerId2 = keccak256(toHex("alice-user-id"));
// const itemId2 = keccak256(toHex("ceramic-bowl-002"));
//
// const batchTxHash = await paymentTreasury.createPaymentBatch(
//   [paymentId, paymentId2],
//   [buyerId, buyerId2],
//   [itemId, itemId2],
//   [paymentToken, paymentToken],
//   [totalAmount, 85_000_000n],
//   [expiration, expiration],
//   [lineItems, [{ typeId: keccak256(toHex("product")), amount: 85_000_000n }]],
//   [externalFees, []],
// );
// await oak.waitForReceipt(batchTxHash);
// console.log("2 payments created in a single transaction");
