/**
 * Step 10: Claim Non-Goal Line Items (Platform Admin)
 *
 * Some line item types are configured as "non-goal" — they do not
 * count toward the campaign's fundraising goal. Common examples
 * include shipping fees, handling charges, or platform service fees.
 *
 * These non-goal amounts accumulate separately in the treasury and
 * can be claimed by the platform admin using `claimNonGoalLineItems`.
 *
 * The function takes a single `token` parameter — the ERC-20 token
 * address to claim non-goal accumulations for. Call it once per
 * accepted token if the treasury supports multiple currencies.
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

const cusdToken = process.env.CUSD_TOKEN_ADDRESS! as `0x${string}`;

const claimTxHash = await paymentTreasury.claimNonGoalLineItems(cusdToken);
const receipt = await platformOak.waitForReceipt(claimTxHash);
console.log(`Non-goal line items claimed at block ${receipt.blockNumber}`);
