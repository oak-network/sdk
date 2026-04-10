/**
 * Step 11: Pause and Unpause the Treasury (Platform Admin) — Optional
 *
 * ⚙️ THIS STEP IS OPTIONAL — use only when an investigation or
 * compliance review requires freezing all treasury activity.
 *
 * `pauseTreasury(message)` freezes the treasury — no new payments,
 * confirmations, withdrawals, or refunds can be processed while
 * paused. The `message` is a bytes32 reason code emitted in the
 * Paused event for audit purposes.
 *
 * `unpauseTreasury(message)` resumes normal operations.
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

// Pause
const pauseReason = keccak256(toHex("fraud-investigation"));
const pauseTxHash = await paymentTreasury.pauseTreasury(pauseReason);
await platformOak.waitForReceipt(pauseTxHash);
console.log("Treasury paused");

// Unpause
const unpauseReason = keccak256(toHex("investigation-cleared"));
const unpauseTxHash = await paymentTreasury.unpauseTreasury(unpauseReason);
await platformOak.waitForReceipt(unpauseTxHash);
console.log("Treasury resumed");
