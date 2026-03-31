import type { Address, Hex } from "../../lib";
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
  /** Simulates deploy; throws a typed error on revert. */
  deploy(platformHash: Hex, infoAddress: Address, implementationId: bigint, options?: CallSignerOptions): Promise<void>;
  /** Simulates registerTreasuryImplementation; throws a typed error on revert. */
  registerTreasuryImplementation(platformHash: Hex, implementationId: bigint, implementation: Address, options?: CallSignerOptions): Promise<void>;
  /** Simulates approveTreasuryImplementation; throws a typed error on revert. */
  approveTreasuryImplementation(platformHash: Hex, implementationId: bigint, options?: CallSignerOptions): Promise<void>;
  /** Simulates disapproveTreasuryImplementation; throws a typed error on revert. */
  disapproveTreasuryImplementation(implementation: Address, options?: CallSignerOptions): Promise<void>;
  /** Simulates removeTreasuryImplementation; throws a typed error on revert. */
  removeTreasuryImplementation(platformHash: Hex, implementationId: bigint, options?: CallSignerOptions): Promise<void>;
}

/** Event helpers for a TreasuryFactory contract instance. */
export interface TreasuryFactoryEvents {}

/** Full TreasuryFactory entity combining reads, writes, simulate, and events. */
export type TreasuryFactoryEntity = TreasuryFactoryReads &
  TreasuryFactoryWrites & {
  /** Simulation counterparts for every write method. */
  simulate: TreasuryFactorySimulate;
  /** Event helpers for filtering and watching logs. */
  events: TreasuryFactoryEvents;
};
