import type { Address, Hex } from "../../lib";
import type { CreateCampaignParams } from "../../types/params";
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
}

/** Event helpers for a CampaignInfoFactory contract instance. */
export interface CampaignInfoFactoryEvents {}

/** Full CampaignInfoFactory entity combining reads, writes, simulate, and events. */
export type CampaignInfoFactoryEntity = CampaignInfoFactoryReads & CampaignInfoFactoryWrites & {
  /** Simulation counterparts for every write method. */
  simulate: CampaignInfoFactorySimulate;
  /** Event helpers for filtering and watching logs. */
  events: CampaignInfoFactoryEvents;
};
