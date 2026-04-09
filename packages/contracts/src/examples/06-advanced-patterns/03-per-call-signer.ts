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

// Admin disburses fees — wait for mining before withdrawing,
// because withdraw reverts if fees have not been disbursed yet
const feeTxHash = await treasury.disburseFees({ signer: adminSigner });
await oak.waitForReceipt(feeTxHash);

// Creator withdraws funds (safe now — fees are confirmed on-chain)
const withdrawTxHash = await treasury.withdraw({ signer: creatorSigner });
await oak.waitForReceipt(withdrawTxHash);
