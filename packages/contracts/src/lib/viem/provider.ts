import {
  createPublicClient,
  createWalletClient,
  http,
  custom,
  type Account,
  type EIP1193Provider,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { Chain } from "viem/chains";
import type { JsonRpcProvider, Wallet } from "../../client/types";

/**
 * Creates a JsonRpcProvider (wrapped viem PublicClient) from an RPC URL.
 *
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
  timeout?: number,
): JsonRpcProvider {
  return createPublicClient({
    chain,
    transport: http(rpcUrl, { timeout }),
  }) as JsonRpcProvider;
}

/**
 * Creates a Wallet (wrapped viem WalletClient) from a private key.
 *
 * @param privateKey - Private key as hex string
 * @param provider - Provider instance (PublicClient) — used to get chain config
 * @param rpcUrl - Optional RPC URL. If omitted, uses the provider's transport
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
  rpcUrl: string,
  chain: Chain,
  timeout?: number,
): Wallet {
  const account = privateKeyToAccount(privateKey);

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl, { timeout }),
  });

  return {
    ...walletClient,
    account,
  } as Wallet;
}

/**
 * Creates a BrowserProvider (wrapped viem PublicClient) from window.ethereum.
 * This is a helper for frontend usage with MetaMask or other injected wallets.
 *
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
  ethereum: EIP1193Provider,
  chain: Chain,
): JsonRpcProvider {
  return createPublicClient({
    chain,
    transport: custom(ethereum),
  }) as JsonRpcProvider;
}

/**
 * Gets a signer from a browser provider (for use with MetaMask, etc.).
 * Requests accounts from the injected wallet and returns a WalletClient.
 *
 * @param ethereum - window.ethereum object (EIP-1193 provider)
 * @param chain - Chain configuration
 * @returns Promise resolving to a Wallet instance
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
  ethereum: EIP1193Provider,
  chain: Chain,
): Promise<Wallet> {
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
