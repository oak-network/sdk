import type { Account, Address, Chain, Hex, PublicClient, WalletClient } from "../lib";
import type { GlobalParamsEntity } from "../contracts/global-params/types";
import type { CampaignInfoFactoryEntity } from "../contracts/campaign-info-factory/types";
import type { TreasuryFactoryEntity } from "../contracts/treasury-factory/types";
import type { CampaignInfoEntity } from "../contracts/campaign-info/types";
import type { PaymentTreasuryEntity } from "../contracts/payment-treasury/types";
import type { AllOrNothingTreasuryEntity } from "../contracts/all-or-nothing/types";
import type { KeepWhatsRaisedTreasuryEntity } from "../contracts/keep-whats-raised/types";
import type { ItemRegistryEntity } from "../contracts/item-registry/types";

/** Chain identifier — numeric chain ID or viem Chain. */
export type ChainIdentifier = number | Chain;

/** Provider — type alias for viem PublicClient. */
export type JsonRpcProvider = PublicClient;

/** Wallet — WalletClient with a guaranteed attached account. */
export interface Wallet extends WalletClient {
  account: Account;
}

/** Read-only simple configuration: chainId + RPC URL, no private key. Writes and simulations will throw. */
export interface SimpleReadOnlyOakContractsClientConfig {
  /** Numeric chain ID (e.g. CHAIN_IDS.CELO_TESTNET_SEPOLIA). */
  chainId: number;
  /** RPC URL for the chain. */
  rpcUrl: string;
  /** Optional client-level overrides. */
  options?: Partial<OakContractsClientOptions>;
}

/** Simple configuration: chainId + RPC URL + private key. */
export interface SimpleOakContractsClientConfig {
  /** Numeric chain ID (e.g. CHAIN_IDS.CELO_TESTNET_SEPOLIA). */
  chainId: number;
  /** RPC URL for the chain. */
  rpcUrl: string;
  /** 0x-prefixed private key for the signer account. */
  privateKey: `0x${string}`;
  /** Optional client-level overrides. */
  options?: Partial<OakContractsClientOptions>;
}

/** Full configuration: explicit viem chain, provider, and signer. */
export interface FullOakContractsClientConfig {
  /** Chain identifier (numeric ID or Chain object). */
  chain: ChainIdentifier;
  /** PublicClient for on-chain reads. */
  provider: JsonRpcProvider;
  /** WalletClient with account for sending transactions. */
  signer: Wallet;
  /** Optional client-level overrides. */
  options?: Partial<OakContractsClientOptions>;
}

/** Optional per-entity signer override passed as the second argument to entity factory methods. */
export interface EntitySignerOptions {
  /** WalletClient to use for writes and simulations on this entity. Overrides the client-level signer. */
  signer: WalletClient;
}

/** Optional per-call signer override. When provided, overrides the entity-level and client-level signer for a single call. */
export interface CallSignerOptions {
  /** WalletClient to use for this specific call. Overrides the entity-level and client-level signer. */
  signer?: WalletClient;
}

/** Union of all supported client configurations. */
export type OakContractsClientConfig =
  | SimpleReadOnlyOakContractsClientConfig
  | SimpleOakContractsClientConfig
  | FullOakContractsClientConfig;

/** Public client configuration — contains no sensitive data. */
export interface PublicOakContractsClientConfig {
  /** The resolved viem Chain object. */
  chain: Chain;
}

/** Client-level behavioural options. */
export interface OakContractsClientOptions {
  /**
   * Request timeout in milliseconds applied to transport calls and waitForTransactionReceipt.
   * @default 30000
   */
  timeout?: number;
}

/** Default client options applied when none are provided. */
export const DEFAULT_CLIENT_OPTIONS: OakContractsClientOptions = {
  timeout: 30000,
};

/** Minimal transaction receipt returned by waitForReceipt. */
export interface TransactionReceipt {
  /** Block in which the transaction was mined. */
  blockNumber: bigint;
  /** Total gas used by the transaction. */
  gasUsed: bigint;
  /** Raw log entries (topics + data). */
  logs: readonly { topics: readonly Hex[]; data: Hex }[];
}

/** Re-exported entity types for SDK consumers. */
export type {
  GlobalParamsEntity,
  CampaignInfoFactoryEntity,
  TreasuryFactoryEntity,
  CampaignInfoEntity,
  PaymentTreasuryEntity,
  AllOrNothingTreasuryEntity,
  KeepWhatsRaisedTreasuryEntity,
  ItemRegistryEntity,
};

/** Oak Contracts SDK client; entity factories and receipt helper. */
export interface OakContractsClient {
  /** Public chain configuration (no secrets). */
  readonly config: PublicOakContractsClientConfig;
  /** Resolved client options. */
  readonly options: OakContractsClientOptions;
  /** Viem PublicClient for reads and receipt polling. */
  readonly publicClient: PublicClient;
  /** Viem WalletClient for sending transactions. Null for read-only clients. */
  readonly walletClient: WalletClient | null;
  /**
   * Waits for a transaction to be mined and returns a minimal receipt.
   * @param txHash - Transaction hash to wait for
   * @returns TransactionReceipt with blockNumber, gasUsed, and logs
   */
  waitForReceipt(txHash: Hex): Promise<TransactionReceipt>;
  /**
   * Fetches the receipt for an already-mined transaction without waiting.
   * Use this when you already have a tx hash (e.g. from a webhook, indexer,
   * or previous session) and don't need to block until mining completes.
   *
   * @param txHash - Transaction hash to look up
   * @returns TransactionReceipt, or null if the transaction is not yet mined
   */
  getReceipt(txHash: Hex): Promise<TransactionReceipt | null>;
  /**
   * Batches multiple entity read calls into a single RPC round-trip via the
   * on-chain Multicall3 contract. Accepts an array of lazy read closures —
   * the same calls you would normally `await` individually.
   *
   * @param calls - Array of zero-argument functions that each return a Promise
   * @returns Tuple of resolved values in the same order as the input calls
   *
   * @example
   * ```typescript
   * const gp = oak.globalParams(address);
   * const [count, fee] = await oak.multicall([
   *   () => gp.getNumberOfListedPlatforms(),
   *   () => gp.getProtocolFeePercent(),
   * ]);
   * ```
   */
  multicall<T extends readonly (() => Promise<unknown>)[]>(
    calls: [...T],
  ): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }>;
  /** Returns a GlobalParams entity for the given contract address. */
  globalParams(address: Address, options?: EntitySignerOptions): GlobalParamsEntity;
  /** Returns a CampaignInfoFactory entity for the given contract address. */
  campaignInfoFactory(address: Address, options?: EntitySignerOptions): CampaignInfoFactoryEntity;
  /** Returns a TreasuryFactory entity for the given contract address. */
  treasuryFactory(address: Address, options?: EntitySignerOptions): TreasuryFactoryEntity;
  /** Returns a CampaignInfo entity for the given contract address. */
  campaignInfo(address: Address, options?: EntitySignerOptions): CampaignInfoEntity;
  /**
   * Returns a PaymentTreasury entity for the given contract address.
   *
   * This method is compatible with **both** on-chain treasury variants:
   * - **PaymentTreasury** — standard payment treasury with no time restrictions.
   * - **TimeConstrainedPaymentTreasury** — payment treasury that enforces launch-time
   *   and deadline constraints on-chain (e.g. payments can only be created within the
   *   campaign window, refunds/withdrawals only after launch).
   *
   * Both contracts share the same ABI and the same SDK interface. Time enforcement
   * is handled entirely on-chain, so no client-side configuration is needed — simply
   * pass the deployed contract address regardless of which variant was deployed.
   *
   * @param address - Deployed PaymentTreasury or TimeConstrainedPaymentTreasury contract address
   * @param options - Optional per-entity signer override
   * @returns PaymentTreasuryEntity with read, write, simulate, and event methods
   */
  paymentTreasury(address: Address, options?: EntitySignerOptions): PaymentTreasuryEntity;
  /** Returns an AllOrNothing treasury entity for the given contract address. */
  allOrNothingTreasury(address: Address, options?: EntitySignerOptions): AllOrNothingTreasuryEntity;
  /** Returns a KeepWhatsRaised treasury entity for the given contract address. */
  keepWhatsRaisedTreasury(address: Address, options?: EntitySignerOptions): KeepWhatsRaisedTreasuryEntity;
  /** Returns an ItemRegistry entity for the given contract address. */
  itemRegistry(address: Address, options?: EntitySignerOptions): ItemRegistryEntity;
}
