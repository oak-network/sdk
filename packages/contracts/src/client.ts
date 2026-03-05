import type {
  ChainIdentifier,
  OakContractsClient,
  OakContractsClientConfig,
  PublicOakContractsClientConfig,
  Chain,
} from "./types";
import { DEFAULT_CLIENT_OPTIONS, type OakContractsClientOptions } from "./types";
import { getChainFromId } from "./utils/chain-registry";

/**
 * Resolves chain identifier to Chain object
 * Supports both Chain objects and chain ID numbers
 */
function resolveChain(chain: ChainIdentifier): Chain {
  if (typeof chain === "number") {
    return getChainFromId(chain);
  }
  return chain;
}

/**
 * Creates a new Oak Contracts SDK client instance.
 *
 * @param config - Client configuration including chain, provider, signer, and optional options
 * @returns Configured OakContractsClient instance
 *
 * @example
 * ```typescript
 * import { 
 *   createOakContractsClient, 
 *   createJsonRpcProvider, 
 *   createWallet, 
 *   createBrowserProvider, 
 *   getSigner,
 *   mainnet,
 *   type Chain
 * } from '@oaknetwork/contracts'
 *
 * // Backend with default timeout (3000ms) - using Chain object
 * const provider = createJsonRpcProvider(rpcUrl, mainnet)
 * const signer = createWallet(privateKey, provider, rpcUrl)
 * const contractSdk = createOakContractsClient({ chain: mainnet, provider, signer })
 *
 * // Backend with chain ID number (automatically converted to Chain object)
 * const contractSdk = createOakContractsClient({ chain: 1, provider, signer })
 *
 * // Backend with custom timeout
 * const contractSdk = createOakContractsClient({ 
 *   chain: 1, 
 *   provider, 
 *   signer,
 *   options: { timeout: 5000 }
 * })
 *
 * // Frontend (MetaMask, or any wallet via Web3Modal)
 * const provider = createBrowserProvider(window.ethereum, mainnet)
 * const signer = await getSigner(window.ethereum, mainnet)
 * const contractSdk = createOakContractsClient({ chain: mainnet, provider, signer })
 * ```
 */
export function createOakContractsClient(
  config: OakContractsClientConfig,
): OakContractsClient {
  const resolvedChain = resolveChain(config.chain);

  const publicConfig: PublicOakContractsClientConfig = {
    chain: resolvedChain,
  };

  const options: OakContractsClientOptions = {
    ...DEFAULT_CLIENT_OPTIONS,
    ...config?.options,
  };

  return {
    config: publicConfig,
    options,
  };
}
