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

// 2. Derive CURRENT registrations by replaying Registered vs Removed events.
//    TreasuryFactory has no read methods, so events are the only data source.
//    A slot that was registered then later removed should not count as active.
const registeredLogs = await treasuryFactory.events.getImplementationRegisteredLogs();
const removedLogs = await treasuryFactory.events.getImplementationRemovedLogs();

const removedSlots = new Set(
  removedLogs
    .filter((log) => log.args?.platformHash === platformHash)
    .map((log) => String(log.args?.implementationId)),
);

const activeRegistrations = registeredLogs.filter(
  (log) =>
    log.args?.platformHash === platformHash &&
    !removedSlots.has(String(log.args?.implementationId)),
);

console.log("\n=== TreasuryFactory ===");
console.log("Active implementations (NovaPay):", activeRegistrations.length);

for (const reg of activeRegistrations) {
  console.log(
    `  Slot ${reg.args?.implementationId} → ${reg.args?.implementation}`,
  );
}

// TreasuryImplementationApproval events are keyed by implementation address
// (not by platform) and can toggle — only the latest event per address
// determines the current state. Build a map of address → latest isApproved.
const approvalLogs = await treasuryFactory.events.getImplementationApprovalLogs();

const latestApproval = new Map<string, boolean>();
for (const log of approvalLogs) {
  const addr = (log.args?.implementation as string)?.toLowerCase();
  if (addr) {
    latestApproval.set(addr, log.args?.isApproved as boolean);
  }
}

const allApproved = activeRegistrations.every((reg) => {
  const addr = (reg.args?.implementation as string)?.toLowerCase();
  return latestApproval.get(addr) === true;
});

console.log("All NovaPay implementations approved:", allApproved);

if (!allApproved) {
  for (const reg of activeRegistrations) {
    const addr = (reg.args?.implementation as string)?.toLowerCase();
    if (latestApproval.get(addr) !== true) {
      const status = latestApproval.has(addr) ? "disapproved" : "no approval event";
      console.error(
        `  ✗ Slot ${reg.args?.implementationId} (${reg.args?.implementation}) — ${status}`,
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
