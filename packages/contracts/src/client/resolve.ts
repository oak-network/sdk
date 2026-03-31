import type { PublicClient, WalletClient } from "../lib";
import type { Chain } from "../lib";
import { createJsonRpcProvider, createWallet } from "../lib";
import { isSimpleConfig, isReadOnlySimpleConfig } from "./guard";
import { getChainFromId } from "../utils";
import type {
  OakContractsClientConfig,
  OakContractsClientOptions,
  FullOakContractsClientConfig,
} from "./types";

/**
 * Resolves a chain identifier (number or Chain object) to a Chain object.
 * @param chainIdOrChain - Numeric chain ID or viem Chain
 * @returns Viem Chain
 */
function resolveChain(chainIdOrChain: number | Chain): Chain {
  if (typeof chainIdOrChain === "number") {
    return getChainFromId(chainIdOrChain);
  }
  return chainIdOrChain;
}

/**
 * Builds viem publicClient and walletClient from the given config.
 * Delegates to lib/provider.ts for all viem client construction.
 * No transport or account logic of its own.
 *
 * @param config - Simple or full client config
 * @param options - Resolved client options (timeout etc.)
 * @returns chain, publicClient, walletClient
 */
export function buildClients(
  config: OakContractsClientConfig,
  options: OakContractsClientOptions,
): { chain: Chain; publicClient: PublicClient; walletClient: WalletClient | null } {
  if (isReadOnlySimpleConfig(config)) {
    const chain = getChainFromId(config.chainId);
    const publicClient = createJsonRpcProvider(config.rpcUrl, chain, options.timeout);
    return { chain, publicClient, walletClient: null };
  }

  if (isSimpleConfig(config)) {
    const chain = getChainFromId(config.chainId);
    const publicClient = createJsonRpcProvider(config.rpcUrl, chain, options.timeout);
    const walletClient = createWallet(config.privateKey, config.rpcUrl, chain, options.timeout);
    return { chain, publicClient, walletClient };
  }

  const fullConfig = config as FullOakContractsClientConfig;
  const chain = resolveChain(fullConfig.chain);
  return {
    chain,
    publicClient: fullConfig.provider as PublicClient,
    walletClient: fullConfig.signer as WalletClient,
  };
}
