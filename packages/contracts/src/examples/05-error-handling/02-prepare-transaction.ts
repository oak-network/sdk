/**
 * Step 2: Prepare Transactions for External Signing
 *
 * For account-abstraction wallets, Safe multisig, or custom signing
 * flows, use toPreparedTransaction to extract raw transaction
 * parameters from a simulation result.
 */

import {
  createOakContractsClient,
  keccak256,
  toHex,
  CHAIN_IDS,
  toPreparedTransaction,
} from "@oaknetwork/contracts-sdk";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PRIVATE_KEY! as `0x${string}`,
});

const gp = oak.globalParams(process.env.GLOBAL_PARAMS_ADDRESS! as `0x${string}`);
const platformHash = keccak256(toHex("artfund"));

const simulation = await gp.simulate.updatePlatformClaimDelay(
  platformHash,
  604800n, // 7 days
);

// Convert to raw transaction params for external signing
const preparedTx = toPreparedTransaction(simulation);

console.log("To:", preparedTx.to);
console.log("Data:", preparedTx.data);
console.log("Value:", preparedTx.value);
console.log("Gas:", preparedTx.gas);

// Send this to your multisig, bundler, or external signer
