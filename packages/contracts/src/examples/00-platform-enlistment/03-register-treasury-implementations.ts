/**
 * Step 3: Register a Treasury Implementation (Platform Admin)
 *
 * Now that NovaPay is enlisted, their Platform Admin registers
 * the treasury model they want to use. Each model goes into a
 * numbered slot (implementationId) on TreasuryFactory.
 *
 * A platform can register as many or as few implementations as
 * they need. This example registers one (AllOrNothing at slot 0).
 * Additional models can be added later at any time.
 *
 * Registrations are NOT immediately active — they sit in a
 * "pending" state until the Protocol Admin approves them in Step 4.
 *
 * The implementation address is the deployed treasury master copy
 * provided by the protocol team during onboarding.
 */

import { createOakContractsClient, keccak256, toHex, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.NOVAPAY_ADMIN_PRIVATE_KEY! as `0x${string}`,
});

const treasuryFactory = oak.treasuryFactory(
  process.env.TREASURY_FACTORY_ADDRESS! as `0x${string}`,
);

const platformHash = keccak256(toHex("NOVAPAY"));

// --- Register one implementation ---

const allOrNothingImpl = process.env.ALL_OR_NOTHING_IMPL! as `0x${string}`;

const txHash = await treasuryFactory.registerTreasuryImplementation(
  platformHash,
  0n, // slot 0
  allOrNothingImpl,
);
console.log("AllOrNothing registered at slot 0:", txHash);
console.log("Awaiting Protocol Admin approval before it can be used.");

// --- Optional: register additional models at other slots ---
//
// A platform can fill as many slots as they need. The slot ID is
// an integer you choose; register and deploy must use the same ID.
//
//   const keepWhatsRaisedImpl = process.env.KEEP_WHATS_RAISED_IMPL! as `0x${string}`;
//   await treasuryFactory.registerTreasuryImplementation(platformHash, 1n, keepWhatsRaisedImpl);
//
//   // PaymentTreasury — standard, no time restrictions:
//   const paymentTreasuryImpl = process.env.PAYMENT_TREASURY_IMPL! as `0x${string}`;
//   await treasuryFactory.registerTreasuryImplementation(platformHash, 2n, paymentTreasuryImpl);
//
//   // TimeConstrainedPaymentTreasury — enforces launch time + deadline on-chain:
//   // Use this instead of PaymentTreasury for limited-time sales, flash deals,
//   // or seasonal storefronts. The SDK interface is identical for both variants;
//   // time constraints are enforced transparently by the contract.
//   const timeConstrainedImpl = process.env.TIME_CONSTRAINED_PAYMENT_TREASURY_IMPL! as `0x${string}`;
//   await treasuryFactory.registerTreasuryImplementation(platformHash, 3n, timeConstrainedImpl);
//
// Each slot requires a separate Protocol Admin approval.
