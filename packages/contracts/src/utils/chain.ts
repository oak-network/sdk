import { defineChain } from "../lib";
import { mainnet, sepolia, goerli } from "../lib";
import type { Chain } from "../lib";

/** Celo Mainnet chain definition. */
const celoMainnet = defineChain({
  id: 42220,
  name: "Celo",
  nativeCurrency: { decimals: 18, name: "CELO", symbol: "CELO" },
  rpcUrls: { default: { http: ["https://forno.celo.org"] } },
});

/** Celo Sepolia testnet chain definition. */
const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: { decimals: 18, name: "CELO", symbol: "CELO" },
  rpcUrls: { default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] } },
});

const CHAIN_REGISTRY: Record<number, Chain> = {
  1: mainnet,
  42220: celoMainnet,
  11155111: sepolia,
  5: goerli,
  11142220: celoSepolia,
};

/**
 * Resolves a numeric chain ID to a viem Chain object.
 * Falls back to a minimal chain definition for unknown IDs.
 * @param chainId - Numeric chain ID
 * @returns Viem Chain object
 */
export function getChainFromId(chainId: number): Chain {
  const predefinedChain = CHAIN_REGISTRY[chainId];
  if (predefinedChain) return predefinedChain;
  return defineChain({
    id: chainId,
    name: `Chain ${chainId}`,
    nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
    rpcUrls: { default: { http: [] } },
  });
}
