/**
 * Step 10: Claim Tips (Platform Admin)
 *
 * Some backers include a tip on top of their pledge as an extra show
 * of support. Tips are tracked separately from the main pledge amounts
 * and are claimed by the **platform admin** — not the creator.
 *
 * `claimTip()` can only be called after the campaign deadline has
 * passed (or after the treasury is cancelled). Tips are transferred
 * to the platform admin's wallet for all accepted tokens in a single
 * call.
 *
 * `claimTip` can only be called once — a second call reverts with
 * `KeepWhatsRaisedAlreadyClaimed`.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const platformOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PLATFORM_PRIVATE_KEY! as `0x${string}`,
});

const treasuryAddress = process.env.KEEP_WHATS_RAISED_ADDRESS! as `0x${string}`;
const treasury = platformOak.keepWhatsRaisedTreasury(treasuryAddress);

const tipTxHash = await treasury.claimTip();
await platformOak.waitForReceipt(tipTxHash);
console.log("Platform admin claimed tips!");
