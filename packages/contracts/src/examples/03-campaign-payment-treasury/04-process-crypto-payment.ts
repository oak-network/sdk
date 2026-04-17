/**
 * Step 4: Process a Crypto Payment (Buyer) — Independent On-Chain Flow
 *
 * This is an alternative to Step 3's off-chain `createPayment` flow.
 * `processCryptoPayment` is a standalone operation that creates the
 * payment record AND transfers ERC-20 tokens to the treasury in a
 * single transaction. It does NOT require or complete a prior
 * `createPayment` call — they are two independent payment flows:
 *
 *   - Flow A (`createPayment`): Platform records payment off-chain,
 *     buyer pays via fiat/external rails, platform confirms later.
 *   - Flow B (`processCryptoPayment`): Buyer pays directly on-chain
 *     with ERC-20 tokens. An NFT is minted as proof of payment.
 *
 * Prerequisite: Sam must have already approved the treasury contract
 * to spend his ERC-20 tokens before calling this method. This is a
 * standard ERC-20 approval, not specific to Oak Protocol.
 *
 * Multi-token: `paymentToken` must be on the campaign's accepted-token
 * list; use a separate approval per token if you support several.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";
import type { LineItem, ExternalFees } from "@oaknetwork/contracts-sdk";

const samOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.SAM_PRIVATE_KEY! as `0x${string}`,
});

const paymentTreasury = samOak.paymentTreasury(
  process.env.PAYMENT_TREASURY_ADDRESS! as `0x${string}`,
);

const paymentId = keccak256(toHex("order-12345"));
const itemId = keccak256(toHex("handcrafted-vase-001"));
const paymentToken = process.env.USDC_TOKEN_ADDRESS! as `0x${string}`;
const totalAmount = 135_000_000n;

const lineItems: LineItem[] = [
  { typeId: keccak256(toHex("product")), amount: 120_000_000n },
  { typeId: keccak256(toHex("shipping")), amount: 15_000_000n },
];

const externalFees: ExternalFees[] = [
  { feeType: keccak256(toHex("payment-processor")), feeAmount: 2_700_000n },
];

const cryptoPaymentTxHash = await paymentTreasury.processCryptoPayment(
  paymentId,
  itemId,
  process.env.SAM_ADDRESS! as `0x${string}`,
  paymentToken,
  totalAmount,
  lineItems,
  externalFees,
);

await samOak.waitForReceipt(cryptoPaymentTxHash);
console.log("Payment processed — tokens transferred to treasury");
