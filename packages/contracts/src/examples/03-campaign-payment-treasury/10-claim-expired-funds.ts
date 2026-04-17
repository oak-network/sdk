/**
 * Step 10: Claim Expired Funds (Platform Admin)
 *
 * If a TimeConstrainedPaymentTreasury is used, the platform admin can
 * sweep all remaining balances after the campaign deadline plus the
 * platform's `claimDelay` has elapsed. This includes:
 *
 *   - Confirmed funds that were not yet withdrawn
 *   - Non-goal line item accumulations
 *   - Refundable amounts that backers did not claim
 *   - Platform fees and protocol fees
 *
 * `claimExpiredFunds()` takes no parameters — it transfers everything
 * to the appropriate recipients (platform admin, protocol admin).
 *
 * If the `claimDelay` has not elapsed, the call reverts with
 * `PaymentTreasuryClaimWindowNotReached`.
 *
 * Note: This function is specific to TimeConstrainedPaymentTreasury.
 * A standard PaymentTreasury without a deadline does not use this.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const platformOak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PLATFORM_PRIVATE_KEY! as `0x${string}`,
});

const paymentTreasury = platformOak.paymentTreasury(
  process.env.PAYMENT_TREASURY_ADDRESS! as `0x${string}`,
);

const claimTxHash = await paymentTreasury.claimExpiredFunds();
const receipt = await platformOak.waitForReceipt(claimTxHash);
console.log(`Expired funds claimed at block ${receipt.blockNumber}`);

const available = await paymentTreasury.getAvailableRaisedAmount();
console.log(`Remaining available: $${Number(available) / 1_000_000}`);
