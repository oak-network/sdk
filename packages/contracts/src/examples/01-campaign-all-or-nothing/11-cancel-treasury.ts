/**
 * Step 11: Cancel the Treasury (Platform Admin or Creator)
 *
 * In rare cases, a campaign must be permanently shut down — for
 * example, if the creator violates the platform's terms of service,
 * the project is determined to be fraudulent, or the creator
 * themselves decides to abandon the campaign.
 *
 * Both the **platform admin** and the **campaign owner** can cancel
 * the treasury (the contract checks both roles). Once cancelled:
 *
 *   - No new pledges can be made
 *   - No withdrawals by the creator are allowed
 *   - Backers can still claim full refunds via `claimRefund`
 *
 * `cancelTreasury(message)` takes a bytes32 reason code. The
 * cancellation is permanent — there is no "uncancel."
 *
 * The `cancelled()` read method returns true once the treasury
 * has been cancelled.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const platformOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PLATFORM_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.ALL_OR_NOTHING_ADDRESS! as `0x${string}`;
const treasury = platformOak.allOrNothingTreasury(treasuryAddress);

const cancelReason = keccak256(toHex("duplicate-campaign"));
const cancelTxHash = await treasury.cancelTreasury(cancelReason);
await platformOak.waitForReceipt(cancelTxHash);
console.log("Treasury permanently cancelled");

const isCancelled = await treasury.cancelled();
console.log("Is treasury cancelled:", isCancelled); // true
console.log("Backers may now call claimRefund() to retrieve their pledged tokens.");
