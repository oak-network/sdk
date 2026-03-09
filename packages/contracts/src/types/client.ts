import type {
  Account,
  Address,
  Hex,
  PublicClient,
  WalletClient,
} from "viem";
import type { Chain } from "viem/chains";
import type { OakContractsClientOptions } from "./config-options";

// Re-export Chain for convenience
export type { Chain };

// ─── Shared protocol struct types ─────────────────────────────────────────────

/** ICampaignData.CampaignData -- used by CampaignInfo and CampaignInfoFactory */
export interface CampaignData {
  launchTime: bigint;
  deadline: bigint;
  goalAmount: bigint;
  /** bytes32 currency identifier (e.g. keccak256("USD")) */
  currency: Hex;
}

/**
 * Reward struct for AllOrNothing and KeepWhatsRaised treasuries.
 * Includes the `isRewardTier` flag to distinguish tiers from flat rewards.
 */
export interface TieredReward {
  rewardValue: bigint;
  isRewardTier: boolean;
  itemId: readonly Hex[];
  itemValue: readonly bigint[];
  itemQuantity: readonly bigint[];
}

/** ICampaignPaymentTreasury.LineItem -- line item in a payment (typeId + amount). */
export interface LineItem {
  typeId: Hex;
  amount: bigint;
}

/** IItem.Item -- used by ItemRegistry */
export interface Item {
  actualWeight: bigint;
  height: bigint;
  width: bigint;
  length: bigint;
  /** bytes32 category identifier */
  category: Hex;
  /** bytes32 declared currency identifier */
  declaredCurrency: Hex;
}

/**
 * ICampaignPaymentTreasury.PaymentLineItem -- stored with configuration snapshot.
 * All uint256 values are bigint; bytes32 are hex strings.
 */
export interface PaymentLineItem {
  typeId: Hex;
  amount: bigint;
  label: string;
  countsTowardGoal: boolean;
  applyProtocolFee: boolean;
  canRefund: boolean;
  instantTransfer: boolean;
}

/** ICampaignPaymentTreasury.ExternalFees -- informational external fee metadata. */
export interface ExternalFees {
  feeType: Hex;
  feeAmount: bigint;
}

/**
 * ICampaignPaymentTreasury.PaymentData -- comprehensive payment snapshot.
 * Mirrors the on-chain struct; lineItems and externalFees include config snapshots.
 */
export interface PaymentData {
  buyerAddress: Address;
  buyerId: Hex;
  itemId: Hex;
  amount: bigint;
  expiration: bigint;
  isConfirmed: boolean;
  isCryptoPayment: boolean;
  lineItemCount: bigint;
  paymentToken: Address;
  lineItems: readonly PaymentLineItem[];
  externalFees: readonly ExternalFees[];
}

/** EIP-2612 permit parameters */
export interface PermitParams {
  owner: Address;
  spender: Address;
  value: bigint;
  deadline: bigint;
  v: number;
  r: Hex;
  s: Hex;
}

/**
 * Return type for getLineItemType / getPlatformLineItemType.
 */
export interface LineItemTypeInfo {
  exists: boolean;
  label: string;
  countsTowardGoal: boolean;
  applyProtocolFee: boolean;
  canRefund: boolean;
  instantTransfer: boolean;
}

/** Return type for CampaignInfo.getCampaignConfig. */
export interface CampaignConfig {
  treasuryFactory: Address;
  protocolFeePercent: bigint;
  identifierHash: Hex;
}

/** Config struct for KeepWhatsRaised.configureTreasury. */
export interface KeepWhatsRaisedConfig {
  minimumWithdrawalForFeeExemption: bigint;
  withdrawalDelay: bigint;
  refundDelay: bigint;
  configLockPeriod: bigint;
  isColombianCreator: boolean;
}

/** FeeKeys struct for KeepWhatsRaised.configureTreasury. */
export interface KeepWhatsRaisedFeeKeys {
  flatFeeKey: Hex;
  cumulativeFlatFeeKey: Hex;
  grossPercentageFeeKeys: readonly Hex[];
}

/** FeeValues struct for KeepWhatsRaised.configureTreasury. */
export interface KeepWhatsRaisedFeeValues {
  flatFeeValue: bigint;
  cumulativeFlatFeeValue: bigint;
  grossPercentageFeeValues: readonly bigint[];
}

// ─── Client config types ───────────────────────────────────────────────────────

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
 * Simple configuration for creating an Oak Contracts SDK client from chainId + RPC + private key.
 * Use this for backend scripts or when you have a single signer.
 */
export interface SimpleOakContractsClientConfig {
  /** Chain ID (e.g. CHAIN_IDS.CELO_SEPOLIA) */
  chainId: number;
  /** RPC URL for the chain */
  rpcUrl: string;
  /** Private key as hex string (0x-prefixed) */
  privateKey: `0x${string}`;
  /** Optional client options */
  options?: Partial<OakContractsClientOptions>;
}

/**
 * Configuration for creating an Oak Contracts SDK client with explicit provider and signer.
 */
export interface FullOakContractsClientConfig {
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
 * Configuration for creating an Oak Contracts SDK client.
 * Either simple (chainId, rpcUrl, privateKey) or full (chain, provider, signer).
 */
export type OakContractsClientConfig =
  | SimpleOakContractsClientConfig
  | FullOakContractsClientConfig;

/**
 * Public client configuration (without sensitive data)
 */
export interface PublicOakContractsClientConfig {
  chain: Chain;
}

// ─── Entity interfaces ─────────────────────────────────────────────────────────

/**
 * GlobalParams entity — read and write methods for a GlobalParams contract instance.
 */
export interface GlobalParamsEntity {
  // Reads
  getProtocolAdminAddress(): Promise<Address>;
  getProtocolFeePercent(): Promise<bigint>;
  getNumberOfListedPlatforms(): Promise<bigint>;
  checkIfPlatformIsListed(platformBytes: Hex): Promise<boolean>;
  checkIfPlatformDataKeyValid(platformDataKey: Hex): Promise<boolean>;
  getPlatformAdminAddress(platformBytes: Hex): Promise<Address>;
  getPlatformFeePercent(platformBytes: Hex): Promise<bigint>;
  getPlatformClaimDelay(platformBytes: Hex): Promise<bigint>;
  getPlatformAdapter(platformBytes: Hex): Promise<Address>;
  getPlatformDataOwner(platformDataKey: Hex): Promise<Hex>;
  getPlatformLineItemType(platformHash: Hex, typeId: Hex): Promise<LineItemTypeInfo>;
  getTokensForCurrency(currency: Hex): Promise<readonly Address[]>;
  getFromRegistry(key: Hex): Promise<Hex>;
  owner(): Promise<Address>;
  paused(): Promise<boolean>;
  // Writes
  enlistPlatform(platformHash: Hex, platformAdminAddress: Address, platformFeePercent: bigint, platformAdapter: Address): Promise<Hex>;
  delistPlatform(platformBytes: Hex): Promise<Hex>;
  updatePlatformAdminAddress(platformBytes: Hex, platformAdminAddress: Address): Promise<Hex>;
  updatePlatformClaimDelay(platformBytes: Hex, claimDelay: bigint): Promise<Hex>;
  updateProtocolAdminAddress(protocolAdminAddress: Address): Promise<Hex>;
  updateProtocolFeePercent(protocolFeePercent: bigint): Promise<Hex>;
  setPlatformAdapter(platformBytes: Hex, platformAdapter: Address): Promise<Hex>;
  setPlatformLineItemType(platformHash: Hex, typeId: Hex, label: string, countsTowardGoal: boolean, applyProtocolFee: boolean, canRefund: boolean, instantTransfer: boolean): Promise<Hex>;
  removePlatformLineItemType(platformHash: Hex, typeId: Hex): Promise<Hex>;
  addTokenToCurrency(currency: Hex, token: Address): Promise<Hex>;
  removeTokenFromCurrency(currency: Hex, token: Address): Promise<Hex>;
  addPlatformData(platformBytes: Hex, platformDataKey: Hex): Promise<Hex>;
  removePlatformData(platformBytes: Hex, platformDataKey: Hex): Promise<Hex>;
  addToRegistry(key: Hex, value: Hex): Promise<Hex>;
  transferOwnership(newOwner: Address): Promise<Hex>;
  renounceOwnership(): Promise<Hex>;
}

/**
 * Campaign data shape for createCampaign (matches ICampaignData.CampaignData).
 */
export interface CreateCampaignData {
  launchTime: bigint;
  deadline: bigint;
  goalAmount: bigint;
  currency: Hex;
}

/**
 * Parameters for createCampaign on CampaignInfoFactory.
 */
export interface CreateCampaignParams {
  creator: Address;
  identifierHash: Hex;
  selectedPlatformHash: readonly Hex[];
  /** Optional platform-specific data keys (parallel array with platformDataValue) */
  platformDataKey?: readonly Hex[];
  /** Optional platform-specific data values (parallel array with platformDataKey) */
  platformDataValue?: readonly Hex[];
  campaignData: CreateCampaignData;
  nftName: string;
  nftSymbol: string;
  nftImageURI: string;
  contractURI: string;
}

/**
 * CampaignInfoFactory entity — createCampaign (write) and identifier/ownership reads.
 */
export interface CampaignInfoFactoryEntity {
  createCampaign(params: CreateCampaignParams): Promise<Hex>;
  identifierToCampaignInfo(identifierHash: Hex): Promise<Address>;
  isValidCampaignInfo(campaignInfo: Address): Promise<boolean>;
  owner(): Promise<Address>;
  updateImplementation(newImplementation: Address): Promise<Hex>;
  transferOwnership(newOwner: Address): Promise<Hex>;
  renounceOwnership(): Promise<Hex>;
}

/**
 * TreasuryFactory entity — deploy and manage treasury implementations.
 */
export interface TreasuryFactoryEntity {
  deploy(platformHash: Hex, infoAddress: Address, implementationId: bigint): Promise<Hex>;
  registerTreasuryImplementation(platformHash: Hex, implementationId: bigint, implementation: Address): Promise<Hex>;
  approveTreasuryImplementation(platformHash: Hex, implementationId: bigint): Promise<Hex>;
  disapproveTreasuryImplementation(implementation: Address): Promise<Hex>;
  removeTreasuryImplementation(platformHash: Hex, implementationId: bigint): Promise<Hex>;
}

/**
 * CampaignInfo entity — full reads and writes for a deployed CampaignInfo contract.
 */
export interface CampaignInfoEntity {
  // Reads
  getLaunchTime(): Promise<bigint>;
  getDeadline(): Promise<bigint>;
  getGoalAmount(): Promise<bigint>;
  getCampaignCurrency(): Promise<Hex>;
  getIdentifierHash(): Promise<Hex>;
  checkIfPlatformSelected(platformBytes: Hex): Promise<boolean>;
  checkIfPlatformApproved(platformHash: Hex): Promise<boolean>;
  getPlatformAdminAddress(platformBytes: Hex): Promise<Address>;
  getPlatformData(platformDataKey: Hex): Promise<Hex>;
  getPlatformFeePercent(platformBytes: Hex): Promise<bigint>;
  getPlatformClaimDelay(platformHash: Hex): Promise<bigint>;
  getProtocolAdminAddress(): Promise<Address>;
  getProtocolFeePercent(): Promise<bigint>;
  getAcceptedTokens(): Promise<readonly Address[]>;
  isTokenAccepted(token: Address): Promise<boolean>;
  getTotalRaisedAmount(): Promise<bigint>;
  getTotalLifetimeRaisedAmount(): Promise<bigint>;
  getTotalRefundedAmount(): Promise<bigint>;
  getTotalAvailableRaisedAmount(): Promise<bigint>;
  getTotalCancelledAmount(): Promise<bigint>;
  getTotalExpectedAmount(): Promise<bigint>;
  getDataFromRegistry(key: Hex): Promise<Hex>;
  getBufferTime(): Promise<bigint>;
  getLineItemType(platformHash: Hex, typeId: Hex): Promise<LineItemTypeInfo>;
  getCampaignConfig(): Promise<CampaignConfig>;
  getApprovedPlatformHashes(): Promise<readonly Hex[]>;
  isLocked(): Promise<boolean>;
  cancelled(): Promise<boolean>;
  owner(): Promise<Address>;
  paused(): Promise<boolean>;
  // Writes
  updateDeadline(deadline: bigint): Promise<Hex>;
  updateGoalAmount(goalAmount: bigint): Promise<Hex>;
  updateLaunchTime(launchTime: bigint): Promise<Hex>;
  updateSelectedPlatform(platformHash: Hex, selection: boolean, platformDataKey: readonly Hex[], platformDataValue: readonly Hex[]): Promise<Hex>;
  setImageURI(newImageURI: string): Promise<Hex>;
  updateContractURI(newContractURI: string): Promise<Hex>;
  /** Mints an NFT for a pledge; returns the tx hash (tokenId is in the receipt events). */
  mintNFTForPledge(backer: Address, reward: Hex, tokenAddress: Address, amount: bigint, shippingFee: bigint, tipAmount: bigint): Promise<Hex>;
  burn(tokenId: bigint): Promise<Hex>;
  pauseCampaign(message: Hex): Promise<Hex>;
  unpauseCampaign(message: Hex): Promise<Hex>;
  cancelCampaign(message: Hex): Promise<Hex>;
  setPlatformInfo(platformBytes: Hex, platformTreasuryAddress: Address): Promise<Hex>;
  transferOwnership(newOwner: Address): Promise<Hex>;
  renounceOwnership(): Promise<Hex>;
}

/**
 * PaymentTreasury entity — full reads and writes for a deployed PaymentTreasury contract.
 */
export interface PaymentTreasuryEntity {
  // Reads
  getPlatformHash(): Promise<Hex>;
  getPlatformFeePercent(): Promise<bigint>;
  getRaisedAmount(): Promise<bigint>;
  getAvailableRaisedAmount(): Promise<bigint>;
  getLifetimeRaisedAmount(): Promise<bigint>;
  getRefundedAmount(): Promise<bigint>;
  getExpectedAmount(): Promise<bigint>;
  getPaymentData(paymentId: Hex): Promise<PaymentData>;
  cancelled(): Promise<boolean>;
  // Writes
  createPayment(paymentId: Hex, buyerId: Hex, itemId: Hex, paymentToken: Address, amount: bigint, expiration: bigint, lineItems: readonly LineItem[], externalFees: readonly ExternalFees[]): Promise<Hex>;
  createPaymentBatch(paymentIds: readonly Hex[], buyerIds: readonly Hex[], itemIds: readonly Hex[], paymentTokens: readonly Address[], amounts: readonly bigint[], expirations: readonly bigint[], lineItemsArray: readonly (readonly LineItem[])[], externalFeesArray: readonly (readonly ExternalFees[])[]): Promise<Hex>;
  processCryptoPayment(paymentId: Hex, itemId: Hex, buyerAddress: Address, paymentToken: Address, amount: bigint, lineItems: readonly LineItem[], externalFees: readonly ExternalFees[]): Promise<Hex>;
  cancelPayment(paymentId: Hex): Promise<Hex>;
  confirmPayment(paymentId: Hex, buyerAddress: Address): Promise<Hex>;
  confirmPaymentBatch(paymentIds: readonly Hex[], buyerAddresses: readonly Address[]): Promise<Hex>;
  disburseFees(): Promise<Hex>;
  withdraw(): Promise<Hex>;
  /** Claim refund to a specific address. */
  claimRefund(paymentId: Hex, refundAddress: Address): Promise<Hex>;
  /** Claim refund to the caller's address. */
  claimRefundSelf(paymentId: Hex): Promise<Hex>;
  claimExpiredFunds(): Promise<Hex>;
  claimNonGoalLineItems(token: Address): Promise<Hex>;
  pauseTreasury(message: Hex): Promise<Hex>;
  unpauseTreasury(message: Hex): Promise<Hex>;
  cancelTreasury(message: Hex): Promise<Hex>;
}

/**
 * AllOrNothing treasury entity — full reads and writes including ERC721 and pledge operations.
 */
export interface AllOrNothingTreasuryEntity {
  // Reads
  getRaisedAmount(): Promise<bigint>;
  getLifetimeRaisedAmount(): Promise<bigint>;
  getRefundedAmount(): Promise<bigint>;
  getReward(rewardName: Hex): Promise<TieredReward>;
  getPlatformHash(): Promise<Hex>;
  getPlatformFeePercent(): Promise<bigint>;
  paused(): Promise<boolean>;
  cancelled(): Promise<boolean>;
  balanceOf(owner: Address): Promise<bigint>;
  ownerOf(tokenId: bigint): Promise<Address>;
  tokenURI(tokenId: bigint): Promise<string>;
  name(): Promise<string>;
  symbol(): Promise<string>;
  getApproved(tokenId: bigint): Promise<Address>;
  isApprovedForAll(owner: Address, operator: Address): Promise<boolean>;
  supportsInterface(interfaceId: Hex): Promise<boolean>;
  // Writes
  pauseTreasury(message: Hex): Promise<Hex>;
  unpauseTreasury(message: Hex): Promise<Hex>;
  cancelTreasury(message: Hex): Promise<Hex>;
  addRewards(rewardNames: readonly Hex[], rewards: readonly TieredReward[]): Promise<Hex>;
  removeReward(rewardName: Hex): Promise<Hex>;
  pledgeForAReward(backer: Address, pledgeToken: Address, shippingFee: bigint, rewardNames: readonly Hex[]): Promise<Hex>;
  pledgeWithoutAReward(backer: Address, pledgeToken: Address, pledgeAmount: bigint): Promise<Hex>;
  claimRefund(tokenId: bigint): Promise<Hex>;
  disburseFees(): Promise<Hex>;
  withdraw(): Promise<Hex>;
  burn(tokenId: bigint): Promise<Hex>;
  approve(to: Address, tokenId: bigint): Promise<Hex>;
  setApprovalForAll(operator: Address, approved: boolean): Promise<Hex>;
  safeTransferFrom(from: Address, to: Address, tokenId: bigint): Promise<Hex>;
  transferFrom(from: Address, to: Address, tokenId: bigint): Promise<Hex>;
}

/**
 * KeepWhatsRaised treasury entity — full reads and writes including pledge-based operations.
 */
export interface KeepWhatsRaisedTreasuryEntity {
  // Reads
  getRaisedAmount(): Promise<bigint>;
  getLifetimeRaisedAmount(): Promise<bigint>;
  getRefundedAmount(): Promise<bigint>;
  getAvailableRaisedAmount(): Promise<bigint>;
  getReward(rewardName: Hex): Promise<TieredReward>;
  getPlatformHash(): Promise<Hex>;
  getPlatformFeePercent(): Promise<bigint>;
  getWithdrawalApprovalStatus(): Promise<boolean>;
  getLaunchTime(): Promise<bigint>;
  getDeadline(): Promise<bigint>;
  getGoalAmount(): Promise<bigint>;
  getPaymentGatewayFee(pledgeId: Hex): Promise<bigint>;
  getFeeValue(feeKey: Hex): Promise<bigint>;
  paused(): Promise<boolean>;
  cancelled(): Promise<boolean>;
  balanceOf(owner: Address): Promise<bigint>;
  ownerOf(tokenId: bigint): Promise<Address>;
  tokenURI(tokenId: bigint): Promise<string>;
  name(): Promise<string>;
  symbol(): Promise<string>;
  getApproved(tokenId: bigint): Promise<Address>;
  isApprovedForAll(owner: Address, operator: Address): Promise<boolean>;
  supportsInterface(interfaceId: Hex): Promise<boolean>;
  // Writes
  pauseTreasury(message: Hex): Promise<Hex>;
  unpauseTreasury(message: Hex): Promise<Hex>;
  cancelTreasury(message: Hex): Promise<Hex>;
  configureTreasury(config: KeepWhatsRaisedConfig, campaignData: CampaignData, feeKeys: KeepWhatsRaisedFeeKeys, feeValues: KeepWhatsRaisedFeeValues): Promise<Hex>;
  addRewards(rewardNames: readonly Hex[], rewards: readonly TieredReward[]): Promise<Hex>;
  removeReward(rewardName: Hex): Promise<Hex>;
  approveWithdrawal(): Promise<Hex>;
  setPaymentGatewayFee(pledgeId: Hex, fee: bigint): Promise<Hex>;
  setFeeAndPledge(pledgeId: Hex, backer: Address, pledgeToken: Address, pledgeAmount: bigint, tip: bigint, fee: bigint, reward: readonly Hex[], isPledgeForAReward: boolean): Promise<Hex>;
  pledgeForAReward(pledgeId: Hex, backer: Address, pledgeToken: Address, tip: bigint, rewardNames: readonly Hex[]): Promise<Hex>;
  pledgeWithoutAReward(pledgeId: Hex, backer: Address, pledgeToken: Address, pledgeAmount: bigint, tip: bigint): Promise<Hex>;
  claimRefund(tokenId: bigint): Promise<Hex>;
  claimTip(): Promise<Hex>;
  claimFund(): Promise<Hex>;
  disburseFees(): Promise<Hex>;
  withdraw(token: Address, amount: bigint): Promise<Hex>;
  updateDeadline(deadline: bigint): Promise<Hex>;
  updateGoalAmount(goalAmount: bigint): Promise<Hex>;
  approve(to: Address, tokenId: bigint): Promise<Hex>;
  setApprovalForAll(operator: Address, approved: boolean): Promise<Hex>;
  safeTransferFrom(from: Address, to: Address, tokenId: bigint): Promise<Hex>;
  transferFrom(from: Address, to: Address, tokenId: bigint): Promise<Hex>;
}

/**
 * ItemRegistry entity — add and retrieve items.
 */
export interface ItemRegistryEntity {
  getItem(owner: Address, itemId: Hex): Promise<Item>;
  addItem(itemId: Hex, item: Item): Promise<Hex>;
  addItemsBatch(itemIds: readonly Hex[], items: readonly Item[]): Promise<Hex>;
}

// ─── Receipt type ──────────────────────────────────────────────────────────────

/**
 * Transaction receipt returned by waitForReceipt.
 */
export interface TransactionReceipt {
  blockNumber: bigint;
  gasUsed: bigint;
  logs: readonly { topics: readonly Hex[]; data: Hex }[];
}

// ─── Main client interface ─────────────────────────────────────────────────────

/**
 * Oak Contracts SDK Client interface.
 * Supports both simple (chainId/rpcUrl/privateKey) and full (chain/provider/signer) config.
 */
export interface OakContractsClient {
  readonly config: PublicOakContractsClientConfig;
  readonly options: OakContractsClientOptions;
  /** Viem public client for reads and waitForTransactionReceipt */
  readonly publicClient: PublicClient;
  /** Viem wallet client (with account when using privateKey or signer) */
  readonly walletClient: WalletClient;
  /** Wait for a transaction to be mined; returns receipt with blockNumber, gasUsed, logs */
  waitForReceipt(txHash: Hex): Promise<TransactionReceipt>;
  /** Get a GlobalParams entity for the given contract address */
  globalParams(address: Address): GlobalParamsEntity;
  /** Get a CampaignInfoFactory entity for the given contract address */
  campaignInfoFactory(address: Address): CampaignInfoFactoryEntity;
  /** Get a TreasuryFactory entity for the given contract address */
  treasuryFactory(address: Address): TreasuryFactoryEntity;
  /** Get a CampaignInfo entity for the given contract address */
  campaignInfo(address: Address): CampaignInfoEntity;
  /** Get a PaymentTreasury entity for the given contract address */
  paymentTreasury(address: Address): PaymentTreasuryEntity;
  /** Get an AllOrNothing treasury entity for the given contract address */
  allOrNothingTreasury(address: Address): AllOrNothingTreasuryEntity;
  /** Get a KeepWhatsRaised treasury entity for the given contract address */
  keepWhatsRaisedTreasury(address: Address): KeepWhatsRaisedTreasuryEntity;
  /** Get an ItemRegistry entity for the given contract address */
  itemRegistry(address: Address): ItemRegistryEntity;
}
