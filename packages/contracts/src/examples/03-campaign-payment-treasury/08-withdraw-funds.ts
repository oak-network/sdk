/**
 * Step 8: Withdraw Confirmed Funds (Platform Admin or Creator)
 *
 * After fees have been disbursed (Step 7), the platform admin or the
 * campaign owner withdraws all available confirmed funds from the
 * treasury. The funds are transferred to the campaign owner's wallet.
 *
 * `withdraw()` takes no parameters — it calculates protocol and
 * platform fees on the available balance, deducts them, and transfers
 * the remainder to the campaign owner.
 *
 * After withdrawal, the treasury's available balance drops to zero
 * (until new payments are confirmed).
 *
 * For TimeConstrainedPaymentTreasury, this can only be called
 * after the launch time and before cancellation.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PLATFORM_PRIVATE_KEY! as `0x${string}`,
});

const paymentTreasury = oak.paymentTreasury(
  process.env.PAYMENT_TREASURY_ADDRESS! as `0x${string}`,
);

const withdrawTxHash = await paymentTreasury.withdraw();
const receipt = await oak.waitForReceipt(withdrawTxHash);
console.log(`Funds withdrawn at block ${receipt.blockNumber}`);

const raised = await paymentTreasury.getRaisedAmount();
const available = await paymentTreasury.getAvailableRaisedAmount();
const refunded = await paymentTreasury.getRefundedAmount();

console.log(`Raised: $${Number(raised) / 1_000_000}`);
console.log(`Available: $${Number(available) / 1_000_000}`);
console.log(`Refunded: $${Number(refunded) / 1_000_000}`);
