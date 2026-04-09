/**
 * Step 6b: Final Withdrawal — After Deadline (Creator or Platform Admin)
 *
 * After the campaign deadline passes, the creator or platform admin
 * can execute a final withdrawal. Unlike partial withdrawals (Step 6a),
 * the final withdrawal sweeps the entire remaining balance of a
 * specific token from the treasury.
 *
 * Key differences from partial withdrawal:
 *
 *   - The `amount` parameter is ignored — the contract uses the full
 *     available balance for the token
 *   - If the total available is below `minimumWithdrawalForFeeExemption`,
 *     a flat fee (not cumulative) is deducted
 *   - If `isColombianCreator` is true, an additional tax is applied
 *   - The call must happen within `deadline + withdrawalDelay` — after
 *     that window, `withdraw` is no longer available (use `claimFund`
 *     instead once the withdrawal delay has fully elapsed)
 *
 * Call `disburseFees()` (Step 7) before this step so that protocol
 * and platform fees have already been transferred out.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.TECHFORGE_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.KEEP_WHATS_RAISED_ADDRESS! as `0x${string}`;
const treasury = oak.keepWhatsRaisedTreasury(treasuryAddress);

const withdrawToken = process.env.CUSD_TOKEN_ADDRESS! as `0x${string}`;

// For a final withdrawal the contract ignores the amount parameter
// and uses the full available balance — pass 0n or any value
const finalWithdrawTxHash = await treasury.withdraw(withdrawToken, 0n);
const receipt = await oak.waitForReceipt(finalWithdrawTxHash);
console.log(`Final withdrawal completed at block ${receipt.blockNumber}`);

const availableAfter = await treasury.getAvailableRaisedAmount();
console.log(`Remaining available: $${Number(availableAfter) / 1_000_000}`);
