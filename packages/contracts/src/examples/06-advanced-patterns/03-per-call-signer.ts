/**
 * Step 3: Per-Call Signer Override
 *
 * Different operations on the same contract require different signers.
 * For example, the protocol admin disburses fees but the creator
 * withdraws funds. Pass the signer as the last argument on each call.
 */

import { createOakContractsClient, createWallet, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
});

const adminSigner = createWallet(
  process.env.ADMIN_PRIVATE_KEY! as `0x${string}`,
  process.env.RPC_URL!,
  oak.config.chain,
);

const creatorSigner = createWallet(
  process.env.CREATOR_PRIVATE_KEY! as `0x${string}`,
  process.env.RPC_URL!,
  oak.config.chain,
);

// No entity-level signer — override per call
const treasuryAddress = process.env.ALL_OR_NOTHING_ADDRESS! as `0x${string}`;
const treasury = oak.allOrNothingTreasury(treasuryAddress);

// Admin disburses fees
await treasury.disburseFees({ signer: adminSigner });

// Creator withdraws funds
await treasury.withdraw({ signer: creatorSigner });
