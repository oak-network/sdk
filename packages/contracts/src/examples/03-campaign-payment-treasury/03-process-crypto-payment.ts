/**
 * Step 3: Process the Crypto Payment (Buyer)
 *
 * Sam completes the purchase by transferring ERC-20 tokens (e.g., cUSD)
 * from his wallet to the treasury contract. This is the moment funds
 * actually move on-chain.
 *
 * The payment details (line items, amounts, external fees) must match
 * what the platform recorded in Step 2. If anything differs, the
 * contract reverts to prevent mismatched payments.
 *
 * Prerequisite: Sam must have already approved the treasury contract
 * to spend his ERC-20 tokens before calling this method. This is a
 * standard ERC-20 approval, not specific to Oak Protocol.
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
const paymentToken = process.env.CUSD_TOKEN_ADDRESS! as `0x${string}`;
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
