/**
 * Step 9: Claim Remaining Funds (Platform Admin)
 *
 * After the withdrawal delay has fully elapsed (deadline + withdrawalDelay),
 * the platform admin can claim any remaining funds from the treasury
 * using `claimFund()`. This transfers the full remaining balance of
 * every accepted token to the platform admin's wallet.
 *
 * Only the **platform admin** can call this function — the creator
 * cannot. This is a platform-level settlement step for sweeping
 * residual balances after the withdrawal window has closed.
 *
 * If the treasury was cancelled, the platform admin must wait until
 * `cancellationTime + refundDelay` before claiming.
 *
 * `claimFund` can only be called once — a second call reverts with
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

const claimTxHash = await treasury.claimFund();
await platformOak.waitForReceipt(claimTxHash);
console.log("Platform admin claimed remaining funds");

const raised = await treasury.getRaisedAmount();
const lifetime = await treasury.getLifetimeRaisedAmount();
const refunded = await treasury.getRefundedAmount();

console.log(`Lifetime raised: $${Number(lifetime) / 1_000_000}`);
console.log(`Refunded: $${Number(refunded) / 1_000_000}`);
console.log(`Current balance: $${Number(raised) / 1_000_000}`);
