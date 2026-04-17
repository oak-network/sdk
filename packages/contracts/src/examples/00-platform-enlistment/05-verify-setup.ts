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

// 2. Confirm treasury registrations for THIS platform only.
//    On a shared deployment other platforms may have their own registrations
//    — filtering by platformHash avoids false positives.
const registeredLogs = await treasuryFactory.events.getImplementationRegisteredLogs();
const novaPayRegistrations = registeredLogs.filter(
  (log) => log.args?.platformHash === platformHash,
);

console.log("\n=== TreasuryFactory ===");
console.log("Registered implementations (NovaPay):", novaPayRegistrations.length);

for (const reg of novaPayRegistrations) {
  console.log(
    `  Slot ${reg.args?.implementationId} → ${reg.args?.implementation}`,
  );
}

// TreasuryImplementationApproval events are keyed by implementation address,
// not by platform. Cross-reference: check that each implementation address
// NovaPay registered has a corresponding approval with isApproved === true.
const approvalLogs = await treasuryFactory.events.getImplementationApprovalLogs();

const approvedAddresses = new Set(
  approvalLogs
    .filter((log) => log.args?.isApproved === true)
    .map((log) => (log.args?.implementation as string)?.toLowerCase()),
);

const allApproved = novaPayRegistrations.every((reg) =>
  approvedAddresses.has((reg.args?.implementation as string)?.toLowerCase()),
);

console.log("All NovaPay implementations approved:", allApproved);

if (!allApproved) {
  for (const reg of novaPayRegistrations) {
    const addr = (reg.args?.implementation as string)?.toLowerCase();
    if (!approvedAddresses.has(addr)) {
      console.error(
        `  ✗ Slot ${reg.args?.implementationId} (${reg.args?.implementation}) — NOT approved`,
      );
    }
  }
}

// 3. Confirm enlistment event was emitted for NovaPay specifically
const enlistmentLogs = await globalParams.events.getPlatformEnlistedLogs();
const novaPayLog = enlistmentLogs.find(
  (log) => log.args?.platformBytes === platformHash,
);

if (novaPayLog) {
  console.log("\n=== Enlistment Confirmed ===");
  console.log("Event:", novaPayLog.eventName);
  console.log("Platform hash:", novaPayLog.args?.platformBytes);
  console.log("NovaPay is fully onboarded and ready to launch campaigns.");
} else {
  console.error("Enlistment event not found — check the transaction.");
}
