/**
 * Step 5: Aggregate with the Metrics Module (Platform)
 *
 * For high-level dashboard statistics — total platforms, campaign
 * health, treasury financials — the SDK provides a dedicated metrics
 * module. Instead of manually querying events and summing values,
 * you call pre-built aggregation functions that read directly from
 * the contracts and return structured reports.
 *
 * The metrics module is imported from a separate subpath:
 * `@oaknetwork/contracts-sdk/metrics`
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";
import {
  getPlatformStats,
  getCampaignSummary,
  getTreasuryReport,
} from "@oaknetwork/contracts-sdk/metrics";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
});

// Platform overview
const platformStats = await getPlatformStats({
  globalParamsAddress: process.env.GLOBAL_PARAMS_ADDRESS! as `0x${string}`,
  publicClient: oak.publicClient,
});
console.log("Total listed platforms:", platformStats.platformCount);

// Campaign health check
const campaignInfoAddress = process.env.CAMPAIGN_INFO_ADDRESS! as `0x${string}`;
const campaignSummary = await getCampaignSummary({
  campaignInfoAddress,
  publicClient: oak.publicClient,
});
console.log("Total raised:", campaignSummary.totalRaised);
console.log("Goal reached:", campaignSummary.goalReached);

// Treasury financial report
const treasuryAddress = process.env.ALL_OR_NOTHING_ADDRESS! as `0x${string}`;
const treasuryReport = await getTreasuryReport({
  treasuryAddress,
  treasuryType: "all-or-nothing",
  publicClient: oak.publicClient,
});
console.log("Raised:", treasuryReport.raisedAmount);
console.log("Refunded:", treasuryReport.refundedAmount);
console.log("Fee percent:", treasuryReport.platformFeePercent);
