/**
 * Step 10: Pause and Unpause the Treasury (Platform Admin)
 *
 * The ArtFund platform receives a report that Maya's campaign images
 * may contain copyrighted material. While the team investigates, they
 * pause the treasury to temporarily freeze all activity — no new
 * pledges can be made and no withdrawals or refunds can be processed.
 *
 * `pauseTreasury(message)` takes a bytes32 reason code that is emitted
 * in the Paused event. This helps auditors and the community understand
 * why the treasury was frozen.
 *
 * Once the investigation concludes and the artwork is verified, the
 * platform unpauses the treasury with `unpauseTreasury(message)`.
 * Normal operations resume immediately.
 *
 * The `paused()` read method returns true while the treasury is frozen.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const platformOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PLATFORM_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.ALL_OR_NOTHING_ADDRESS! as `0x${string}`;
const treasury = platformOak.allOrNothingTreasury(treasuryAddress);

// Pause the treasury
const pauseReason = keccak256(toHex("copyright-investigation"));
const pauseTxHash = await treasury.pauseTreasury(pauseReason);
await platformOak.waitForReceipt(pauseTxHash);
console.log("Treasury paused:", await treasury.paused()); // true

// --- Investigation complete, artwork verified ---

// Unpause the treasury
const unpauseReason = keccak256(toHex("investigation-cleared"));
const unpauseTxHash = await treasury.unpauseTreasury(unpauseReason);
await platformOak.waitForReceipt(unpauseTxHash);
console.log("Treasury paused:", await treasury.paused()); // false
