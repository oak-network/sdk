/**
 * Step 8: Disburse Protocol and Platform Fees (Anyone)
 *
 * `disburseFees()` transfers all accumulated protocol and platform
 * fees from the treasury to their respective recipients. Anyone can
 * call this function — there is no role restriction.
 *
 * Important constraints:
 *
 *   - `disburseFees` has a `whenNotCancelled` modifier — it must be
 *     called BEFORE the treasury is cancelled. If the treasury is
 *     cancelled first, fees can no longer be disbursed.
 *   - Fees accumulate per pledge (gross percentage fees, payment
 *     gateway fees, and protocol fees are calculated at pledge time).
 *     This call simply transfers the accumulated amounts.
 *   - Can be called multiple times if new fees accumulate.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.TECHFORGE_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.KEEP_WHATS_RAISED_ADDRESS! as `0x${string}`;
const treasury = oak.keepWhatsRaisedTreasury(treasuryAddress);

const feeTxHash = await treasury.disburseFees();
const feeReceipt = await oak.waitForReceipt(feeTxHash);
console.log(`Fees disbursed at block ${feeReceipt.blockNumber}`);

const platformFeePercent = await treasury.getPlatformFeePercent();
console.log(`Platform fee: ${Number(platformFeePercent)} basis points`);
