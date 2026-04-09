/**
 * Step 5: Verify Full Platform Setup (Platform Admin)
 *
 * Before going live, NovaPay's admin runs a final check to confirm
 * every piece of the onboarding is in place:
 *
 *   1. Platform is enlisted on GlobalParams
 *   2. Admin address and fee percent match the agreed terms
 *   3. Treasury implementations are registered and approved
 *
 * Once everything checks out, NovaPay is fully onboarded and can
 * begin creating campaigns and deploying treasuries through the SDK.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
});

const globalParams = oak.globalParams(
  process.env.GLOBAL_PARAMS_ADDRESS! as `0x${string}`,
);

const treasuryFactory = oak.treasuryFactory(
  process.env.TREASURY_FACTORY_ADDRESS! as `0x${string}`,
);

const platformHash = keccak256(toHex("NOVAPAY"));

// 1. Confirm platform state on GlobalParams
const isListed = await globalParams.checkIfPlatformIsListed(platformHash);
const adminAddress = await globalParams.getPlatformAdminAddress(platformHash);
const feePercent = await globalParams.getPlatformFeePercent(platformHash);
const claimDelay = await globalParams.getPlatformClaimDelay(platformHash);

console.log("=== GlobalParams ===");
console.log("Listed:", isListed);
console.log("Admin:", adminAddress);
console.log("Fee:", Number(feePercent), "bps");
console.log("Claim delay:", Number(claimDelay), "seconds");

// 2. Confirm treasury registrations via events
const registeredLogs = await treasuryFactory.events.getImplementationRegisteredLogs();
const approvalLogs = await treasuryFactory.events.getImplementationApprovalLogs();

console.log("\n=== TreasuryFactory ===");
console.log("Registered implementations:", registeredLogs.length);
console.log("Approval events:", approvalLogs.length);

// 3. Confirm enlistment event was emitted
const enlistmentLogs = await globalParams.events.getPlatformEnlistedLogs();
const novaPayLog = enlistmentLogs.find(
  (log) => log.args?.platformHash === platformHash,
);

if (novaPayLog) {
  console.log("\n=== Enlistment Confirmed ===");
  console.log("Event:", novaPayLog.eventName);
  console.log("Platform hash:", novaPayLog.args?.platformHash);
  console.log("NovaPay is fully onboarded and ready to launch campaigns.");
} else {
  console.error("Enlistment event not found — check the transaction.");
}
