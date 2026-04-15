/**
 * Step 6a: Approve partial withdrawal (Platform Admin)
 *
 * Before the creator can withdraw mid-campaign, the platform admin must
 * call `approveWithdrawal` once. After this, the creator (or platform)
 * may call `withdraw(token, amount)` — but only after the configured
 * **withdrawal delay** has elapsed since this approval (unless the delay
 * is 0, as in Step 3 of this walkthrough).
 *
 * Run **06b-execute-partial-withdrawal.ts** next (creator wallet) in the
 * same session when `withdrawalDelay` is 0. If you set a non-zero delay
 * in production, wait that many seconds or advance time on a local node
 * before running Step 6b.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

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
