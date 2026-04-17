import type { Address, Hex } from "../../lib";
import type { DecodedEventLog, EventFilterOptions, EventWatchHandler, RawLog, SimulationResult } from "../../types/events";
import type { CallSignerOptions } from "../../client/types";

/** Read-only methods for TreasuryFactory (none in ABI). */
export interface TreasuryFactoryReads {}

/** Write methods for a TreasuryFactory contract instance. */
export interface TreasuryFactoryWrites {
  /** Deploys a new treasury clone for the given platform, info address, and implementation ID. */
  deploy(platformHash: Hex, infoAddress: Address, implementationId: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Registers a treasury implementation for a platform and implementation ID. */
  registerTreasuryImplementation(platformHash: Hex, implementationId: bigint, implementation: Address, options?: CallSignerOptions): Promise<Hex>;
  /** Approves a registered treasury implementation for use. */
  approveTreasuryImplementation(platformHash: Hex, implementationId: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Disapproves a treasury implementation by address. */
  disapproveTreasuryImplementation(implementation: Address, options?: CallSignerOptions): Promise<Hex>;
  /** Removes a treasury implementation registration for a platform and implementation ID. */
  removeTreasuryImplementation(platformHash: Hex, implementationId: bigint, options?: CallSignerOptions): Promise<Hex>;
}

/** Simulate counterparts for TreasuryFactory write methods. */
export interface TreasuryFactorySimulate {
  /** Simulates deploy; returns a SimulationResult on success, throws a typed error on revert. */
  deploy(platformHash: Hex, infoAddress: Address, implementationId: bigint, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates registerTreasuryImplementation; returns a SimulationResult on success, throws a typed error on revert. */
  registerTreasuryImplementation(platformHash: Hex, implementationId: bigint, implementation: Address, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates approveTreasuryImplementation; returns a SimulationResult on success, throws a typed error on revert. */
  approveTreasuryImplementation(platformHash: Hex, implementationId: bigint, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates disapproveTreasuryImplementation; returns a SimulationResult on success, throws a typed error on revert. */
  disapproveTreasuryImplementation(implementation: Address, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates removeTreasuryImplementation; returns a SimulationResult on success, throws a typed error on revert. */
  removeTreasuryImplementation(platformHash: Hex, implementationId: bigint, options?: CallSignerOptions): Promise<SimulationResult>;
}

/** Event helpers for a TreasuryFactory contract instance. */
export interface TreasuryFactoryEvents {
  /** Returns decoded TreasuryFactoryTreasuryDeployed event logs. */
  getTreasuryDeployedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded TreasuryImplementationRegistered event logs. */
  getImplementationRegisteredLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded TreasuryImplementationRemoved event logs. */
  getImplementationRemovedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded TreasuryImplementationApproval event logs. */
  getImplementationApprovalLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Decodes a raw log entry against all known TreasuryFactory events. */
  decodeLog(log: RawLog): DecodedEventLog;
  /** Watches for TreasuryFactoryTreasuryDeployed events in real time. Returns an unwatch function. */
  watchTreasuryDeployed(onLogs: EventWatchHandler): () => void;
  /** Watches for TreasuryImplementationRegistered events in real time. Returns an unwatch function. */
  watchImplementationRegistered(onLogs: EventWatchHandler): () => void;
  /** Watches for TreasuryImplementationRemoved events in real time. Returns an unwatch function. */
  watchImplementationRemoved(onLogs: EventWatchHandler): () => void;
  /** Watches for TreasuryImplementationApproval events in real time. Returns an unwatch function. */
  watchImplementationApproval(onLogs: EventWatchHandler): () => void;
}

/** Full TreasuryFactory entity combining reads, writes, simulate, and events. */
export type TreasuryFactoryEntity = TreasuryFactoryReads &
  TreasuryFactoryWrites & {
  /** Simulation counterparts for every write method. */
  simulate: TreasuryFactorySimulate;
  /** Event helpers for filtering and watching logs. */
  events: TreasuryFactoryEvents;
};
