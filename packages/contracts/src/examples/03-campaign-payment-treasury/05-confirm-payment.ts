/**
 * Step 5: Confirm the Payment (Platform Admin)
 *
 * After Sam's tokens arrive in the treasury, CeloMarket performs its
 * off-chain verification — checking inventory, running fraud detection,
 * and validating the shipping address. Once satisfied, the platform
 * confirms the payment on-chain.
 *
 * Confirmation is what makes the funds available for withdrawal.
 * Until a payment is confirmed, the funds remain in a pending state.
 *
 * For high-volume platforms, batch confirmation is available to confirm
 * multiple payments in a single transaction, reducing gas costs.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PLATFORM_PRIVATE_KEY! as `0x${string}`,
});

const paymentTreasury = oak.paymentTreasury(
  process.env.PAYMENT_TREASURY_ADDRESS! as `0x${string}`,
);

// Confirm a single payment
const paymentId = keccak256(toHex("order-12345"));

const confirmTxHash = await paymentTreasury.confirmPayment(
  paymentId,
  process.env.SAM_ADDRESS! as `0x${string}`,
);
await oak.waitForReceipt(confirmTxHash);
console.log("Payment confirmed for order #12345");

// Batch confirmation — multiple payments in one transaction
// const batchTxHash = await paymentTreasury.confirmPaymentBatch(
//   [paymentId1, paymentId2, paymentId3],
//   [buyerAddress1, buyerAddress2, buyerAddress3],
// );
// await oak.waitForReceipt(batchTxHash);
// console.log("3 payments confirmed in a single transaction");
