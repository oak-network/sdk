/**
 * Step 8: Disburse Protocol and Platform Fees (Anyone)
 *
 * Before anyone can withdraw funds from a successful campaign, the
 * protocol and platform fees must be disbursed first. This is a
 * separate on-chain call because the fee recipients (the Oak Protocol
 * treasury and the ArtFund platform wallet) are different from the
 * campaign creator.
 *
 * `disburseFees()` has no role restriction — anyone can call it.
 * The contract verifies internally that:
 *   - The campaign deadline has passed
 *   - The funding goal has been met (success condition)
 *   - Fees have not already been disbursed
 *
 * It calculates the protocol fee and platform fee based on the raised
 * amount, then transfers them to the respective recipients in a single
 * transaction. The remaining balance becomes available for withdrawal
 * (Step 9a). It only needs to be called once.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.MAYA_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.ALL_OR_NOTHING_ADDRESS! as `0x${string}`;
const treasury = oak.allOrNothingTreasury(treasuryAddress);

const feeTxHash = await treasury.disburseFees();
const feeReceipt = await oak.waitForReceipt(feeTxHash);
console.log(`Fees disbursed at block ${feeReceipt.blockNumber}`);

// Verify the fee percent that was applied
const platformFeePercent = await treasury.getPlatformFeePercent();
console.log(`Platform fee: ${Number(platformFeePercent)} basis points`);
