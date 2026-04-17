/**
 * Shared client setup used across all examples.
 *
 * Environment variables required:
 *   RPC_URL                        — JSON-RPC endpoint (e.g. Celo Sepolia)
 *   PRIVATE_KEY                    — 0x-prefixed private key for write operations
 *   GLOBAL_PARAMS_ADDRESS          — GlobalParams contract address
 *   CAMPAIGN_INFO_FACTORY_ADDRESS  — CampaignInfoFactory contract address
 *   TREASURY_FACTORY_ADDRESS       — TreasuryFactory contract address
 *   ITEM_REGISTRY_ADDRESS          — ItemRegistry contract address
 */

import { createOakContractsClient, CHAIN_IDS } from "@oaknetwork/contracts-sdk";

export function createClient(privateKey?: `0x${string}`) {
  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) throw new Error("RPC_URL environment variable is required");

  if (privateKey) {
    return createOakContractsClient({
      chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
      rpcUrl,
      privateKey,
    });
  }

  return createOakContractsClient({
    chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
    rpcUrl,
  });
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} environment variable is required`);
  return value;
}

export function requireAddress(name: string): `0x${string}` {
  return requireEnv(name) as `0x${string}`;
}
