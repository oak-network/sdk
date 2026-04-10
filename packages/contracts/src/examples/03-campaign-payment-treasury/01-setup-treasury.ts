/**
 * Step 1: Connect to the Payment Treasury (Anyone)
 *
 * CeloMarket's backend connects to its deployed PaymentTreasury contract
 * and reads back the platform configuration — the platform hash it belongs
 * to and the fee percent. This is typically done once at application startup
 * to verify the treasury is correctly linked to the platform.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
});

const paymentTreasury = oak.paymentTreasury(
  process.env.PAYMENT_TREASURY_ADDRESS! as `0x${string}`,
);

const platformHash = await paymentTreasury.getPlatformHash();
console.log("Treasury's platform:", platformHash);

const feePercent = await paymentTreasury.getPlatformFeePercent();
console.log("Platform fee:", Number(feePercent), "bps");
