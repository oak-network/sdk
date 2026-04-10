import type { Address, Hex } from "../../lib";
import type { LineItemTypeInfo } from "../../types/structs";
import type { DecodedEventLog, EventFilterOptions, EventWatchHandler, RawLog, SimulationResult } from "../../types/events";
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
  /** Returns true if the contract is currently paused. */
  paused(): Promise<boolean>;
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
  /** Simulates enlistPlatform; returns a SimulationResult. */
  enlistPlatform(platformHash: Hex, platformAdminAddress: Address, platformFeePercent: bigint, platformAdapter: Address, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates delistPlatform; returns a SimulationResult. */
  delistPlatform(platformBytes: Hex, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates updatePlatformAdminAddress; returns a SimulationResult. */
  updatePlatformAdminAddress(platformBytes: Hex, platformAdminAddress: Address, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates updatePlatformClaimDelay; returns a SimulationResult. */
  updatePlatformClaimDelay(platformBytes: Hex, claimDelay: bigint, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates updateProtocolAdminAddress; returns a SimulationResult. */
  updateProtocolAdminAddress(protocolAdminAddress: Address, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates updateProtocolFeePercent; returns a SimulationResult. */
  updateProtocolFeePercent(protocolFeePercent: bigint, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates setPlatformAdapter; returns a SimulationResult. */
  setPlatformAdapter(platformBytes: Hex, platformAdapter: Address, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates setPlatformLineItemType; returns a SimulationResult. */
  setPlatformLineItemType(platformHash: Hex, typeId: Hex, label: string, countsTowardGoal: boolean, applyProtocolFee: boolean, canRefund: boolean, instantTransfer: boolean, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates removePlatformLineItemType; returns a SimulationResult. */
  removePlatformLineItemType(platformHash: Hex, typeId: Hex, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates addTokenToCurrency; returns a SimulationResult. */
  addTokenToCurrency(currency: Hex, token: Address, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates removeTokenFromCurrency; returns a SimulationResult. */
  removeTokenFromCurrency(currency: Hex, token: Address, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates addPlatformData; returns a SimulationResult. */
  addPlatformData(platformBytes: Hex, platformDataKey: Hex, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates removePlatformData; returns a SimulationResult. */
  removePlatformData(platformBytes: Hex, platformDataKey: Hex, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates addToRegistry; returns a SimulationResult. */
  addToRegistry(key: Hex, value: Hex, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates transferOwnership; returns a SimulationResult. */
  transferOwnership(newOwner: Address, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates renounceOwnership; returns a SimulationResult. */
  renounceOwnership(options?: CallSignerOptions): Promise<SimulationResult>;
}

/** Event helpers for a GlobalParams contract instance. */
export interface GlobalParamsEvents {
  /** Returns decoded PlatformEnlisted event logs. */
  getPlatformEnlistedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded PlatformDelisted event logs. */
  getPlatformDelistedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded PlatformAdminAddressUpdated event logs. */
  getPlatformAdminAddressUpdatedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded PlatformDataAdded event logs. */
  getPlatformDataAddedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded PlatformDataRemoved event logs. */
  getPlatformDataRemovedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded PlatformAdapterSet event logs. */
  getPlatformAdapterSetLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded PlatformClaimDelayUpdated event logs. */
  getPlatformClaimDelayUpdatedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded ProtocolAdminAddressUpdated event logs. */
  getProtocolAdminAddressUpdatedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded ProtocolFeePercentUpdated event logs. */
  getProtocolFeePercentUpdatedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded TokenAddedToCurrency event logs. */
  getTokenAddedToCurrencyLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded TokenRemovedFromCurrency event logs. */
  getTokenRemovedFromCurrencyLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded OwnershipTransferred event logs. */
  getOwnershipTransferredLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded Paused event logs. */
  getPausedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded Unpaused event logs. */
  getUnpausedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded DataAddedToRegistry event logs. */
  getDataAddedToRegistryLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded PlatformLineItemTypeSet event logs. */
  getPlatformLineItemTypeSetLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded PlatformLineItemTypeRemoved event logs. */
  getPlatformLineItemTypeRemovedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Decodes a raw log entry against all known GlobalParams events. */
  decodeLog(log: RawLog): DecodedEventLog;
  /** Watches for PlatformEnlisted events in real time. Returns an unwatch function. */
  watchPlatformEnlisted(onLogs: EventWatchHandler): () => void;
  /** Watches for PlatformDelisted events in real time. Returns an unwatch function. */
  watchPlatformDelisted(onLogs: EventWatchHandler): () => void;
  /** Watches for PlatformAdminAddressUpdated events in real time. Returns an unwatch function. */
  watchPlatformAdminAddressUpdated(onLogs: EventWatchHandler): () => void;
  /** Watches for PlatformDataAdded events in real time. Returns an unwatch function. */
  watchPlatformDataAdded(onLogs: EventWatchHandler): () => void;
  /** Watches for PlatformDataRemoved events in real time. Returns an unwatch function. */
  watchPlatformDataRemoved(onLogs: EventWatchHandler): () => void;
  /** Watches for PlatformAdapterSet events in real time. Returns an unwatch function. */
  watchPlatformAdapterSet(onLogs: EventWatchHandler): () => void;
  /** Watches for PlatformClaimDelayUpdated events in real time. Returns an unwatch function. */
  watchPlatformClaimDelayUpdated(onLogs: EventWatchHandler): () => void;
  /** Watches for ProtocolAdminAddressUpdated events in real time. Returns an unwatch function. */
  watchProtocolAdminAddressUpdated(onLogs: EventWatchHandler): () => void;
  /** Watches for ProtocolFeePercentUpdated events in real time. Returns an unwatch function. */
  watchProtocolFeePercentUpdated(onLogs: EventWatchHandler): () => void;
  /** Watches for TokenAddedToCurrency events in real time. Returns an unwatch function. */
  watchTokenAddedToCurrency(onLogs: EventWatchHandler): () => void;
  /** Watches for TokenRemovedFromCurrency events in real time. Returns an unwatch function. */
  watchTokenRemovedFromCurrency(onLogs: EventWatchHandler): () => void;
  /** Watches for OwnershipTransferred events in real time. Returns an unwatch function. */
  watchOwnershipTransferred(onLogs: EventWatchHandler): () => void;
  /** Watches for Paused events in real time. Returns an unwatch function. */
  watchPaused(onLogs: EventWatchHandler): () => void;
  /** Watches for Unpaused events in real time. Returns an unwatch function. */
  watchUnpaused(onLogs: EventWatchHandler): () => void;
  /** Watches for DataAddedToRegistry events in real time. Returns an unwatch function. */
  watchDataAddedToRegistry(onLogs: EventWatchHandler): () => void;
  /** Watches for PlatformLineItemTypeSet events in real time. Returns an unwatch function. */
  watchPlatformLineItemTypeSet(onLogs: EventWatchHandler): () => void;
  /** Watches for PlatformLineItemTypeRemoved events in real time. Returns an unwatch function. */
  watchPlatformLineItemTypeRemoved(onLogs: EventWatchHandler): () => void;
}

/** Full GlobalParams entity combining reads, writes, simulate, and events. */
export type GlobalParamsEntity = GlobalParamsReads & GlobalParamsWrites & {
  /** Simulation counterparts for every write method. */
  simulate: GlobalParamsSimulate;
  /** Event helpers for filtering and watching logs. */
  events: GlobalParamsEvents;
};
