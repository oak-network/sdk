/**
 * Step 12: Update Campaign Parameters (Creator or Platform Admin) — Optional
 *
 * ⚙️ THIS STEP IS OPTIONAL — most campaigns do not change parameters
 * after launch. Only use this if circumstances require it.
 *
 * The Keep-What's-Raised treasury allows the creator OR platform admin
 * to update certain campaign parameters after deployment:
 *
 *   - `updateDeadline` — extend or shorten the campaign deadline
 *   - `updateGoalAmount` — raise or lower the funding goal
 *
 * Constraints (from the contract's `onlyBeforeConfigLock` modifier):
 *
 *   - Updates must happen BEFORE `deadline - configLockPeriod`.
 *     Once the lock period begins, no further changes are allowed.
 *   - The new deadline must be in the future and after launch time.
 *   - The new goal amount must be greater than zero.
 */

import { createOakContractsClient, addDays, getCurrentTimestamp, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.TECHFORGE_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.KEEP_WHATS_RAISED_ADDRESS! as `0x${string}`;
const treasury = oak.keepWhatsRaisedTreasury(treasuryAddress);

// Extend the deadline to 90 days from now
const now = getCurrentTimestamp();
const newDeadline = addDays(now, 90);
const deadlineTxHash = await treasury.updateDeadline(newDeadline);
await oak.waitForReceipt(deadlineTxHash);
console.log("Deadline extended to 90 days");

const currentDeadline = await treasury.getDeadline();
console.log("New deadline:", new Date(Number(currentDeadline) * 1000).toISOString());

// Lower the goal to $7,500 (partial funding is enough)
const newGoal = 7_500_000_000n; // $7,500
const goalTxHash = await treasury.updateGoalAmount(newGoal);
await oak.waitForReceipt(goalTxHash);
console.log("Goal updated to $7,500");

const currentGoal = await treasury.getGoalAmount();
console.log("New goal:", Number(currentGoal) / 1_000_000);
