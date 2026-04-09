/**
 * Step 12: Cancel the Treasury (Platform Admin or Creator) — Optional
 *
 * ⚙️ THIS STEP IS OPTIONAL — cancellation is permanent and
 * irreversible. Use only for fraud, terms violation, or shutdown.
 *
 * Both the platform admin and the campaign owner can cancel the
 * treasury (the contract checks both roles).
 *
 * Once cancelled:
 *
 *   - No new payments can be created or confirmed
 *   - No withdrawals or fee disbursements are possible
 *   - Buyers can still claim refunds on cancelled/refundable payments
 *
 * `cancelTreasury(message)` takes a bytes32 reason code.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const platformOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PLATFORM_PRIVATE_KEY! as `0x${string}`,
});

const paymentTreasury = platformOak.paymentTreasury(
  process.env.PAYMENT_TREASURY_ADDRESS! as `0x${string}`,
);

const cancelReason = keccak256(toHex("terms-violation"));
const cancelTxHash = await paymentTreasury.cancelTreasury(cancelReason);
await platformOak.waitForReceipt(cancelTxHash);
console.log("Treasury permanently cancelled");

const isCancelled = await paymentTreasury.cancelled();
console.log("Is cancelled:", isCancelled); // true
