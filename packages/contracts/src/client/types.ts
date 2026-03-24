import type { Account, Address, Hex, PublicClient, WalletClient } from "../lib";
import type { Chain } from "../lib";
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

/** Union of simple and full client configurations. */
export type OakContractsClientConfig =
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
  /** Viem WalletClient for sending transactions. */
  readonly walletClient: WalletClient;
  /**
   * Waits for a transaction to be mined and returns a minimal receipt.
   * @param txHash - Transaction hash to wait for
   * @returns TransactionReceipt with blockNumber, gasUsed, and logs
   */
  waitForReceipt(txHash: Hex): Promise<TransactionReceipt>;
  /** Returns a GlobalParams entity for the given contract address. */
  globalParams(address: Address): GlobalParamsEntity;
  /** Returns a CampaignInfoFactory entity for the given contract address. */
  campaignInfoFactory(address: Address): CampaignInfoFactoryEntity;
  /** Returns a TreasuryFactory entity for the given contract address. */
  treasuryFactory(address: Address): TreasuryFactoryEntity;
  /** Returns a CampaignInfo entity for the given contract address. */
  campaignInfo(address: Address): CampaignInfoEntity;
  /** Returns a PaymentTreasury entity for the given contract address. */
  paymentTreasury(address: Address): PaymentTreasuryEntity;
  /** Returns an AllOrNothing treasury entity for the given contract address. */
  allOrNothingTreasury(address: Address): AllOrNothingTreasuryEntity;
  /** Returns a KeepWhatsRaised treasury entity for the given contract address. */
  keepWhatsRaisedTreasury(address: Address): KeepWhatsRaisedTreasuryEntity;
  /** Returns an ItemRegistry entity for the given contract address. */
  itemRegistry(address: Address): ItemRegistryEntity;
}
