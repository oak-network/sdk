/**
 * Step 9a: Success — Goal Met, Withdraw Funds (Anyone)
 *
 * After fees have been disbursed (Step 8), the remaining funds are
 * available for withdrawal. `withdraw()` has no role restriction —
 * anyone can call it. The contract always sends the funds to the
 * campaign owner (`INFO.owner()`), regardless of who initiates the
 * transaction.
 *
 * In practice, the creator usually calls this themselves, but a
 * platform admin or even a bot could trigger it on their behalf.
 *
 * After withdrawal, the treasury balance drops to zero. Maya can now
 * use the funds to produce and ship rewards to her backers.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.MAYA_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.ALL_OR_NOTHING_ADDRESS! as `0x${string}`;
const treasury = oak.allOrNothingTreasury(treasuryAddress);

const withdrawTxHash = await treasury.withdraw();
const withdrawReceipt = await oak.waitForReceipt(withdrawTxHash);
console.log(`Funds withdrawn at block ${withdrawReceipt.blockNumber}`);

// Verify withdrawal is complete
const remaining = await treasury.getRaisedAmount();
console.log("Raised amount (accounting total):", remaining);
