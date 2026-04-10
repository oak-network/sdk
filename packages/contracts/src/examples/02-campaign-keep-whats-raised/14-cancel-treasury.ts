/**
 * Step 14: Cancel the Treasury (Platform Admin) — Optional
 *
 * In rare cases, a campaign must be permanently shut down. Once
 * cancelled:
 *
 *   - No new pledges can be made
 *   - No creator withdrawals or claims are allowed
 *   - Backers can still claim full refunds via `claimRefund`
 *
 * `cancelTreasury(message)` takes a bytes32 reason code. The
 * cancellation is permanent — there is no "uncancel."
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const platformOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PLATFORM_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.KEEP_WHATS_RAISED_ADDRESS! as `0x${string}`;
const treasury = platformOak.keepWhatsRaisedTreasury(treasuryAddress);

const cancelReason = keccak256(toHex("terms-violation"));
const cancelTxHash = await treasury.cancelTreasury(cancelReason);
await platformOak.waitForReceipt(cancelTxHash);
console.log("Treasury permanently cancelled");
console.log("Is cancelled:", await treasury.cancelled()); // true
console.log("Backers may now call claimRefund() to retrieve their tokens.");
