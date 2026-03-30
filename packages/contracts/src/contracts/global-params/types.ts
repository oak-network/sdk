import type { Address, Hex } from "../../lib";
import type { LineItemTypeInfo } from "../../types/structs";
import type { CallSignerOptions } from "../../client/types";

/** Read-only methods for a GlobalParams contract instance. */
export interface GlobalParamsReads {
  /** Returns the protocol admin address. */
  getProtocolAdminAddress(): Promise<Address>;
  /** Returns the protocol fee percent (basis points). */
  getProtocolFeePercent(): Promise<bigint>;
  /** Returns the total number of enlisted platforms. */
  getNumberOfListedPlatforms(): Promise<bigint>;
  /** Returns true if the platform identified by platformBytes is enlisted. */
  checkIfPlatformIsListed(platformBytes: Hex): Promise<boolean>;
  /** Returns true if platformDataKey is a valid registered data key. */
  checkIfPlatformDataKeyValid(platformDataKey: Hex): Promise<boolean>;
  /** Returns the admin address for the given platform. */
  getPlatformAdminAddress(platformBytes: Hex): Promise<Address>;
  /** Returns the fee percent for the given platform (basis points). */
  getPlatformFeePercent(platformBytes: Hex): Promise<bigint>;
  /** Returns the claim delay for the given platform in seconds. */
  getPlatformClaimDelay(platformBytes: Hex): Promise<bigint>;
  /** Returns the adapter contract address for the given platform. */
  getPlatformAdapter(platformBytes: Hex): Promise<Address>;
  /** Returns the platform that owns the given data key. */
  getPlatformDataOwner(platformDataKey: Hex): Promise<Hex>;
  /** Returns the line item type configuration for a platform + typeId pair. */
  getPlatformLineItemType(platformHash: Hex, typeId: Hex): Promise<LineItemTypeInfo>;
  /** Returns the list of accepted token addresses for the given currency. */
  getTokensForCurrency(currency: Hex): Promise<readonly Address[]>;
  /** Returns a value from the global data registry by key. */
  getFromRegistry(key: Hex): Promise<Hex>;
  /** Returns the contract owner address. */
  owner(): Promise<Address>;
}

/** Write methods for a GlobalParams contract instance. */
export interface GlobalParamsWrites {
  /** Enlists a new platform with admin address, fee percent, and adapter. */
  enlistPlatform(platformHash: Hex, platformAdminAddress: Address, platformFeePercent: bigint, platformAdapter: Address, options?: CallSignerOptions): Promise<Hex>;
  /** Removes a previously enlisted platform. */
  delistPlatform(platformBytes: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Updates the admin address for an enlisted platform. */
  updatePlatformAdminAddress(platformBytes: Hex, platformAdminAddress: Address, options?: CallSignerOptions): Promise<Hex>;
  /** Updates the claim delay for an enlisted platform. */
  updatePlatformClaimDelay(platformBytes: Hex, claimDelay: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Updates the protocol admin address. */
  updateProtocolAdminAddress(protocolAdminAddress: Address, options?: CallSignerOptions): Promise<Hex>;
  /** Updates the protocol fee percent. */
  updateProtocolFeePercent(protocolFeePercent: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Sets the adapter contract for a platform. */
  setPlatformAdapter(platformBytes: Hex, platformAdapter: Address, options?: CallSignerOptions): Promise<Hex>;
  /** Registers or updates a line item type for a platform. */
  setPlatformLineItemType(platformHash: Hex, typeId: Hex, label: string, countsTowardGoal: boolean, applyProtocolFee: boolean, canRefund: boolean, instantTransfer: boolean, options?: CallSignerOptions): Promise<Hex>;
  /** Removes a line item type for a platform. */
  removePlatformLineItemType(platformHash: Hex, typeId: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Adds a token to the accepted list for a currency. */
  addTokenToCurrency(currency: Hex, token: Address, options?: CallSignerOptions): Promise<Hex>;
  /** Removes a token from the accepted list for a currency. */
  removeTokenFromCurrency(currency: Hex, token: Address, options?: CallSignerOptions): Promise<Hex>;
  /** Associates a platform data key with a platform. */
  addPlatformData(platformBytes: Hex, platformDataKey: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Removes a platform data key association. */
  removePlatformData(platformBytes: Hex, platformDataKey: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Adds a key-value entry to the global data registry. */
  addToRegistry(key: Hex, value: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Transfers contract ownership to a new address. */
  transferOwnership(newOwner: Address, options?: CallSignerOptions): Promise<Hex>;
  /** Renounces contract ownership permanently. */
  renounceOwnership(options?: CallSignerOptions): Promise<Hex>;
}

/** Simulate counterparts for GlobalParams write methods. */
export interface GlobalParamsSimulate {
  /** Simulates enlistPlatform; throws a typed error on revert. */
  enlistPlatform(platformHash: Hex, platformAdminAddress: Address, platformFeePercent: bigint, platformAdapter: Address, options?: CallSignerOptions): Promise<void>;
  /** Simulates delistPlatform; throws a typed error on revert. */
  delistPlatform(platformBytes: Hex, options?: CallSignerOptions): Promise<void>;
  /** Simulates updatePlatformAdminAddress; throws a typed error on revert. */
  updatePlatformAdminAddress(platformBytes: Hex, platformAdminAddress: Address, options?: CallSignerOptions): Promise<void>;
  /** Simulates updatePlatformClaimDelay; throws a typed error on revert. */
  updatePlatformClaimDelay(platformBytes: Hex, claimDelay: bigint, options?: CallSignerOptions): Promise<void>;
  /** Simulates updateProtocolAdminAddress; throws a typed error on revert. */
  updateProtocolAdminAddress(protocolAdminAddress: Address, options?: CallSignerOptions): Promise<void>;
  /** Simulates updateProtocolFeePercent; throws a typed error on revert. */
  updateProtocolFeePercent(protocolFeePercent: bigint, options?: CallSignerOptions): Promise<void>;
  /** Simulates setPlatformAdapter; throws a typed error on revert. */
  setPlatformAdapter(platformBytes: Hex, platformAdapter: Address, options?: CallSignerOptions): Promise<void>;
  /** Simulates setPlatformLineItemType; throws a typed error on revert. */
  setPlatformLineItemType(platformHash: Hex, typeId: Hex, label: string, countsTowardGoal: boolean, applyProtocolFee: boolean, canRefund: boolean, instantTransfer: boolean, options?: CallSignerOptions): Promise<void>;
  /** Simulates removePlatformLineItemType; throws a typed error on revert. */
  removePlatformLineItemType(platformHash: Hex, typeId: Hex, options?: CallSignerOptions): Promise<void>;
  /** Simulates addTokenToCurrency; throws a typed error on revert. */
  addTokenToCurrency(currency: Hex, token: Address, options?: CallSignerOptions): Promise<void>;
  /** Simulates removeTokenFromCurrency; throws a typed error on revert. */
  removeTokenFromCurrency(currency: Hex, token: Address, options?: CallSignerOptions): Promise<void>;
  /** Simulates addPlatformData; throws a typed error on revert. */
  addPlatformData(platformBytes: Hex, platformDataKey: Hex, options?: CallSignerOptions): Promise<void>;
  /** Simulates removePlatformData; throws a typed error on revert. */
  removePlatformData(platformBytes: Hex, platformDataKey: Hex, options?: CallSignerOptions): Promise<void>;
  /** Simulates addToRegistry; throws a typed error on revert. */
  addToRegistry(key: Hex, value: Hex, options?: CallSignerOptions): Promise<void>;
}

/** Event helpers for a GlobalParams contract instance. */
export interface GlobalParamsEvents {}

/** Full GlobalParams entity combining reads, writes, simulate, and events. */
export type GlobalParamsEntity = GlobalParamsReads & GlobalParamsWrites & {
  /** Simulation counterparts for every write method. */
  simulate: GlobalParamsSimulate;
  /** Event helpers for filtering and watching logs. */
  events: GlobalParamsEvents;
};
