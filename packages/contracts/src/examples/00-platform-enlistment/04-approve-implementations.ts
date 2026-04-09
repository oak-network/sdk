/**
 * Step 4: Approve a Treasury Implementation (Protocol Admin)
 *
 * The Platform Admin registered an AllOrNothing implementation at
 * slot 0 in Step 3. It cannot be used until the Protocol Admin
 * explicitly approves it. This is a safety gate — the protocol
 * team verifies the implementation contract before allowing the
 * platform to deploy treasuries from it.
 *
 * Each registered slot requires its own approval call. If the
 * platform registered multiple slots, approve each one separately.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PROTOCOL_ADMIN_PRIVATE_KEY! as `0x${string}`,
});

const treasuryFactory = oak.treasuryFactory(
  process.env.TREASURY_FACTORY_ADDRESS! as `0x${string}`,
);

const platformHash = keccak256(toHex("NOVAPAY"));

// Approve the AllOrNothing implementation at slot 0
const txHash = await treasuryFactory.approveTreasuryImplementation(platformHash, 0n);
console.log("AllOrNothing approved (slot 0):", txHash);
console.log("NovaPay can now deploy AllOrNothing treasuries.");

// --- If additional slots were registered, approve each one ---
//
//   await treasuryFactory.approveTreasuryImplementation(platformHash, 1n);
//   await treasuryFactory.approveTreasuryImplementation(platformHash, 2n);
