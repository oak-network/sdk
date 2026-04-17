/**
 * Step 2: Fetch Treasury-Specific Events (Platform)
 *
 * Each campaign has its own treasury contract, and each treasury
 * emits events for every financial action: pledges, refunds, and
 * withdrawals. ArtFund queries these events to build a detailed
 * activity feed for each campaign on their dashboard.
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
});

const treasuryAddress = process.env.ALL_OR_NOTHING_ADDRESS! as `0x${string}`;
const treasury = oak.allOrNothingTreasury(treasuryAddress);

const pledgeLogs = await treasury.events.getReceiptLogs({ fromBlock: 0n });
console.log(`${pledgeLogs.length} backers have pledged`);

const refundLogs = await treasury.events.getRefundClaimedLogs({ fromBlock: 0n });
console.log(`${refundLogs.length} refunds claimed`);

const withdrawalLogs = await treasury.events.getWithdrawalSuccessfulLogs({ fromBlock: 0n });
console.log(`${withdrawalLogs.length} withdrawals made`);
