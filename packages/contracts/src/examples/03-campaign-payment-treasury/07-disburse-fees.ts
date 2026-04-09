/**
 * Step 7: Disburse Protocol and Platform Fees (Anyone)
 *
 * `disburseFees()` transfers all accumulated protocol and platform
 * fees from the treasury to their respective recipients. There is
 * no role restriction — anyone can call this function.
 *
 * Fees are calculated per payment at confirmation time based on the
 * platform fee percent and protocol fee percent. This call simply
 * transfers the accumulated totals.
 *
 * Can be called multiple times as new payments are confirmed and
 * new fees accumulate.
 *
 * For TimeConstrainedPaymentTreasury, this can only be called
 * after the launch time.
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

const feeTxHash = await paymentTreasury.disburseFees();
const feeReceipt = await oak.waitForReceipt(feeTxHash);
console.log(`Fees disbursed at block ${feeReceipt.blockNumber}`);

const feePercent = await paymentTreasury.getPlatformFeePercent();
console.log(`Platform fee: ${Number(feePercent)} bps`);
