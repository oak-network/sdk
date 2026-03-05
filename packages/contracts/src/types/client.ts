import type {
  Account,
  Address,
  PublicClient,
  WalletClient,
  Chain,
} from "../viem";
import type { OakContractsClientOptions } from "./config-options";

// Re-export Chain for convenience
export type { Chain };

/**
 * Chain identifier - can be a chain ID number or a Chain object from viem
 */
export type ChainIdentifier = number | Chain;

/**
 * Provider interface - wraps viem's PublicClient
 * This is a type alias for viem's PublicClient to provide a familiar API
 */
export type JsonRpcProvider = PublicClient;

/**
 * Signer interface - wraps viem's WalletClient with Account
 * This is a type alias for viem's WalletClient with Account to provide a familiar API
 */
export interface Wallet extends WalletClient {
  account: Account;
}

/**
 * Configuration for creating an Oak Contracts SDK client
 */
export interface OakContractsClientConfig {
  /** Chain identifier (chain ID number or Chain object) */
  chain: ChainIdentifier;
  /** Provider instance (wrapped viem PublicClient) */
  provider: JsonRpcProvider;
  /** Signer instance (wrapped viem WalletClient with Account) */
  signer: Wallet;
  /** Optional client options */
  options?: Partial<OakContractsClientOptions>;
}

/**
 * Resolved client configuration with resolved chain
 */
export interface ResolvedOakContractsClientConfig extends Omit<OakContractsClientConfig, "chain"> {
  chain: Chain;
}

/**
 * Public client configuration (without sensitive data)
 */
export interface PublicOakContractsClientConfig {
  chain: Chain;
}

/**
 * Oak Contracts SDK Client interface
 */
export interface OakContractsClient {
  readonly config: PublicOakContractsClientConfig;
  readonly options: OakContractsClientOptions;
}
