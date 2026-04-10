/**
 * Step 1: Batch Reads with Multicall
 *
 * Instead of making 5 separate RPC calls, batch them into one
 * round-trip using oak.multicall(). Each read is wrapped in a
 * lazy function so they execute together.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
});

const gp = oak.globalParams(process.env.GLOBAL_PARAMS_ADDRESS! as `0x${string}`);
const campaign = oak.campaignInfo(process.env.CAMPAIGN_INFO_ADDRESS! as `0x${string}`);

const [platformCount, protocolFee, goalAmount, totalRaised, deadline] = await oak.multicall([
  () => gp.getNumberOfListedPlatforms(),
  () => gp.getProtocolFeePercent(),
  () => campaign.getGoalAmount(),
  () => campaign.getTotalRaisedAmount(),
  () => campaign.getDeadline(),
]);

console.log("Platforms:", platformCount);
console.log("Protocol fee:", protocolFee, "bps");
console.log("Goal: $", Number(goalAmount) / 1_000_000);
console.log("Raised: $", Number(totalRaised) / 1_000_000);
console.log("Deadline:", new Date(Number(deadline) * 1000));
