import type { Address, Hex } from "../../lib";
import type { CreateCampaignParams } from "../../types/params";

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
  createCampaign(params: CreateCampaignParams): Promise<Hex>;
  /** Updates the CampaignInfo implementation address. */
  updateImplementation(newImplementation: Address): Promise<Hex>;
  /** Transfers contract ownership to a new address. */
  transferOwnership(newOwner: Address): Promise<Hex>;
  /** Renounces contract ownership permanently. */
  renounceOwnership(): Promise<Hex>;
}

/** Simulate counterparts for CampaignInfoFactory write methods. */
export interface CampaignInfoFactorySimulate {
  /** Simulates createCampaign; throws a typed error on revert. */
  createCampaign(params: CreateCampaignParams): Promise<void>;
  /** Simulates updateImplementation; throws a typed error on revert. */
  updateImplementation(newImplementation: Address): Promise<void>;
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
