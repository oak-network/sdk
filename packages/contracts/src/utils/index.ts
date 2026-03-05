// Re-export viem utility functions directly
export {
  parseEther,
  formatEther,
  parseUnits,
  isAddress,
  getAddress,
  stringToHex,
} from "../viem";

import {
  keccak256 as viemKeccak256,
  stringToHex,
  type Hex,
  createPublicClient,
  createWalletClient,
  http,
  custom,
  type Account,
  type PublicClient,
  type WalletClient,
  type Chain,
} from "../viem";
import type { JsonRpcProvider, Wallet } from "../types";

/**
 * Hash data using keccak256
 * @param data - String (will be converted to hex) or Uint8Array to hash
 * @returns Hex string hash
 */
export function keccak256(data: string | Uint8Array): `0x${string}` {
  if (typeof data === "string") {
    // If it's already a hex string, use it directly; otherwise convert
    if (data.startsWith("0x")) {
      return viemKeccak256(data as Hex) as `0x${string}`;
    }
    return viemKeccak256(stringToHex(data)) as `0x${string}`;
  }
  return viemKeccak256(data) as `0x${string}`;
}

/**
 * Hash a string using keccak256 (alias for id)
 * This is equivalent to keccak256(stringToHex(input))
 * @param input - String to hash
 * @returns Hex string hash
 */
export function id(input: string): `0x${string}` {
  return keccak256(stringToHex(input));
}

/**
 * Get current Unix timestamp in seconds
 * @returns Current timestamp as bigint
 */
export function getCurrentTimestamp(): bigint {
  return BigInt(Math.floor(Date.now() / 1000));
}

/**
 * Add days to a timestamp
 * @param timestamp - Unix timestamp in seconds
 * @param days - Number of days to add
 * @returns New timestamp as bigint
 */
export function addDays(timestamp: bigint, days: number): bigint {
  const secondsPerDay = BigInt(86400);
  return timestamp + BigInt(days) * secondsPerDay;
}

// Export chain registry utility
export { getChainFromId } from "./chain-registry";

/**
 * Creates a JsonRpcProvider (wrapped viem PublicClient) from an RPC URL
 * @param rpcUrl - RPC URL string
 * @param chain - Chain configuration
 * @returns JsonRpcProvider instance
 *
 * @example
 * ```typescript
 * import { createJsonRpcProvider, mainnet } from '@oaknetwork/contracts'
 *
 * const provider = createJsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY', mainnet)
 * ```
 */
export function createJsonRpcProvider(
  rpcUrl: string,
  chain: Chain,
): JsonRpcProvider {
  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  }) as JsonRpcProvider;
}

/**
 * Creates a Wallet (wrapped viem WalletClient) from a private key
 * @param privateKey - Private key as hex string
 * @param provider - Provider instance (PublicClient) - used to get chain config
 * @param rpcUrl - Optional RPC URL. If not provided, will attempt to use the provider's transport
 * @returns Wallet instance
 *
 * @example
 * ```typescript
 * import { createWallet, createJsonRpcProvider, mainnet } from '@oaknetwork/contracts'
 *
 * const provider = createJsonRpcProvider(rpcUrl, mainnet)
 * const signer = createWallet(privateKey, provider, rpcUrl)
 * ```
 */
export function createWallet(
  privateKey: `0x${string}`,
  provider: PublicClient,
  rpcUrl?: string,
): Wallet {
  // Use the provided RPC URL or try to extract from provider's transport
  // For http transports, we need the URL; for custom transports, we reuse the transport
  const transport = rpcUrl
    ? http(rpcUrl)
    : (provider as any).transport || http();

  const walletClient = createWalletClient({
    account: privateKey as `0x${string}`,
    chain: provider.chain,
    transport,
  });

  // Get the account from the wallet client
  const account = walletClient.account as Account;

  return {
    ...walletClient,
    account,
  } as Wallet;
}

/**
 * Creates a BrowserProvider (wrapped viem PublicClient) from window.ethereum
 * This is a helper for frontend usage with MetaMask or other injected wallets
 * @param ethereum - window.ethereum object (EIP-1193 provider)
 * @param chain - Chain configuration
 * @returns JsonRpcProvider instance
 *
 * @example
 * ```typescript
 * import { createBrowserProvider, mainnet } from '@oaknetwork/contracts'
 *
 * const provider = createBrowserProvider(window.ethereum, mainnet)
 * ```
 */
export function createBrowserProvider(
  ethereum: any,
  chain: Chain,
): JsonRpcProvider {
  return createPublicClient({
    chain,
    transport: custom(ethereum),
  }) as JsonRpcProvider;
}

/**
 * Gets a signer from a browser provider (for use with MetaMask, etc.)
 * This creates a WalletClient from the browser provider's ethereum object
 * @param ethereum - window.ethereum object (EIP-1193 provider)
 * @param chain - Chain configuration
 * @returns Promise that resolves to a Wallet instance
 *
 * @example
 * ```typescript
 * import { createBrowserProvider, getSigner, mainnet } from '@oaknetwork/contracts'
 *
 * const provider = createBrowserProvider(window.ethereum, mainnet)
 * const signer = await getSigner(window.ethereum, mainnet)
 * ```
 */
export async function getSigner(
  ethereum: any,
  chain: Chain,
): Promise<Wallet> {
  // Request accounts from the provider
  const accounts = await ethereum.request({
    method: "eth_requestAccounts",
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts found. Please connect your wallet.");
  }

  const walletClient = createWalletClient({
    account: accounts[0] as `0x${string}`,
    chain,
    transport: custom(ethereum),
  });

  return {
    ...walletClient,
    account: walletClient.account as Account,
  } as Wallet;
}
