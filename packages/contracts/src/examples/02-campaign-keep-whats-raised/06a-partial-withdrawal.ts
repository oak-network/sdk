/**
 * Step 6a: Partial Withdrawal — Mid-Campaign (Platform Admin + Creator)
 *
 * One of the key advantages of the Keep-What's-Raised model is that
 * the creator does not have to wait until the campaign ends to access
 * funds. TechForge needs $2,000 now to begin prototyping.
 *
 * The withdrawal process involves two parties:
 *
 *   1. The **platform admin** approves withdrawal capability for the
 *      treasury (`approveWithdrawal`). This is a one-time action —
 *      once approved, the withdrawal flag stays on.
 *   2. The **creator or platform admin** executes the withdrawal
 *      (`withdraw(token, amount)`) after the configured delay period.
 *
 * Partial withdrawals let the creator specify exactly how much to
 * withdraw. A cumulative or flat fee may apply depending on the
 * amount relative to `minimumWithdrawalForFeeExemption`.
 *
 * This is distinct from the final withdrawal (Step 6b), which happens
 * after the deadline and sweeps the remaining balance.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

// --- Step A: Platform admin approves withdrawal ---

const platformOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PLATFORM_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.KEEP_WHATS_RAISED_ADDRESS! as `0x${string}`;
const platformTreasury = platformOak.keepWhatsRaisedTreasury(treasuryAddress);

const approvalTxHash = await platformTreasury.approveWithdrawal();
await platformOak.waitForReceipt(approvalTxHash);
console.log("Platform admin approved withdrawals");

const approvalStatus = await platformTreasury.getWithdrawalApprovalStatus();
console.log("Withdrawal approved:", approvalStatus); // true

// --- Step B: Creator withdraws after the delay period ---
// The on-chain withdrawal delay (set during treasury configuration)
// must have elapsed since approval before this call can succeed.
// If the delay has not passed, the transaction will revert.

const creatorOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.TECHFORGE_PRIVATE_KEY! as `0x${string}`,
});

const creatorTreasury = creatorOak.keepWhatsRaisedTreasury(treasuryAddress);

const withdrawToken = process.env.USDC_TOKEN_ADDRESS! as `0x${string}`;
const withdrawAmount = 2_000_000_000n; // $2,000

const withdrawTxHash = await creatorTreasury.withdraw(withdrawToken, withdrawAmount);
await creatorOak.waitForReceipt(withdrawTxHash);
console.log("Creator withdrew $2,000 for prototyping");
