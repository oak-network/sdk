import type { Address, Hex } from "../../lib";
import type { CreateCampaignParams } from "../../types/params";
import type { DecodedEventLog, EventFilterOptions, EventWatchHandler, RawLog } from "../../types/events";
import type { CallSignerOptions } from "../../client/types";

/** Read-only methods for a CampaignInfoFactory contract instance. */
export interface CampaignInfoFactoryReads {
  /** Returns the CampaignInfo address for a given identifier hash. */
  identifierToCampaignInfo(identifierHash: Hex): Promise<Address>;
  /** Returns true if the given address is a valid campaign info clone. */
  isValidCampaignInfo(campaignInfo: Address): Promise<boolean>;
  /** Returns the contract owner address. */
  owner(): Promise<Address>;
}

/** Write methods for a CampaignInfoFactory contract instance. */
export interface CampaignInfoFactoryWrites {
  /**
   * Deploys a new CampaignInfo clone and registers it.
   * @param params - Full campaign creation parameters
   * @returns Transaction hash
   */
  createCampaign(params: CreateCampaignParams, options?: CallSignerOptions): Promise<Hex>;
  /** Updates the CampaignInfo implementation address. */
  updateImplementation(newImplementation: Address, options?: CallSignerOptions): Promise<Hex>;
  /** Transfers contract ownership to a new address. */
  transferOwnership(newOwner: Address, options?: CallSignerOptions): Promise<Hex>;
  /** Renounces contract ownership permanently. */
  renounceOwnership(options?: CallSignerOptions): Promise<Hex>;
}

/** Simulate counterparts for CampaignInfoFactory write methods. */
export interface CampaignInfoFactorySimulate {
  /** Simulates createCampaign; throws a typed error on revert. */
  createCampaign(params: CreateCampaignParams, options?: CallSignerOptions): Promise<void>;
  /** Simulates updateImplementation; throws a typed error on revert. */
  updateImplementation(newImplementation: Address, options?: CallSignerOptions): Promise<void>;
  /** Simulates transferOwnership; throws a typed error on revert. */
  transferOwnership(newOwner: Address, options?: CallSignerOptions): Promise<void>;
  /** Simulates renounceOwnership; throws a typed error on revert. */
  renounceOwnership(options?: CallSignerOptions): Promise<void>;
}

/** Event helpers for a CampaignInfoFactory contract instance. */
export interface CampaignInfoFactoryEvents {
  /** Returns decoded CampaignInfoFactoryCampaignCreated event logs. */
  getCampaignCreatedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded CampaignInfoFactoryCampaignInitialized event logs. */
  getCampaignInitializedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded OwnershipTransferred event logs. */
  getOwnershipTransferredLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Decodes a raw log entry against all known CampaignInfoFactory events. */
  decodeLog(log: RawLog): DecodedEventLog;
  /** Watches for CampaignInfoFactoryCampaignCreated events in real time. Returns an unwatch function. */
  watchCampaignCreated(onLogs: EventWatchHandler): () => void;
  /** Watches for CampaignInfoFactoryCampaignInitialized events in real time. Returns an unwatch function. */
  watchCampaignInitialized(onLogs: EventWatchHandler): () => void;
  /** Watches for OwnershipTransferred events in real time. Returns an unwatch function. */
  watchOwnershipTransferred(onLogs: EventWatchHandler): () => void;
}

/** Full CampaignInfoFactory entity combining reads, writes, simulate, and events. */
export type CampaignInfoFactoryEntity = CampaignInfoFactoryReads & CampaignInfoFactoryWrites & {
  /** Simulation counterparts for every write method. */
  simulate: CampaignInfoFactorySimulate;
  /** Event helpers for filtering and watching logs. */
  events: CampaignInfoFactoryEvents;
};
