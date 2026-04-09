/**
 * Step 2: Per-Entity Signer Override
 *
 * In a browser dApp, the signer is resolved after the user connects
 * their wallet. Pass it when creating the entity — all writes on
 * that entity automatically use it.
 */

import {
  createOakContractsClient,
  createWallet,
  CHAIN_IDS,
} from "@oaknetwork/contracts-sdk";

// Start with a read-only client
const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
});

// User connects their wallet — resolve the signer
const userPrivateKey = process.env.USER_PRIVATE_KEY! as `0x${string}`;
const userSigner = createWallet(userPrivateKey, process.env.RPC_URL!, oak.config.chain);

// Create an entity with the user's signer
const treasuryAddress = process.env.ALL_OR_NOTHING_ADDRESS! as `0x${string}`;
const treasury = oak.allOrNothingTreasury(treasuryAddress, { signer: userSigner });

// Reads — no signer needed
const raised = await treasury.getRaisedAmount();
console.log("Raised:", raised);

// Writes — automatically use userSigner
// await treasury.pledgeForAReward(backerAddr, pledgeToken, 0n, [rewardHash]);
// await treasury.claimRefund(tokenId);
