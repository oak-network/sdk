import { defineChain } from "../viem";
import { mainnet, sepolia, goerli } from "../viem";
import type { Chain } from "../viem";

/**
 * Registry mapping chain IDs to Chain objects
 * Contains common Ethereum chains
 */
const CHAIN_REGISTRY: Record<number, Chain> = {
  1: mainnet,
  11155111: sepolia,
  5: goerli,
};

/**
 * Resolves a chain ID number to a Chain object
 * @param chainId - Chain ID number
 * @returns Chain object
 */
export function getChainFromId(chainId: number): Chain {
  // Check if we have a predefined chain for this ID
  const predefinedChain = CHAIN_REGISTRY[chainId];
  if (predefinedChain) {
    return predefinedChain;
  }

  // For unknown chain IDs, create a minimal chain object
  // This allows the SDK to work with any chain ID, though some features
  // may require a full chain definition
  return defineChain({
    id: chainId,
    name: `Chain ${chainId}`,
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    rpcUrls: {
      default: {
        http: [],
      },
    },
  });
}
