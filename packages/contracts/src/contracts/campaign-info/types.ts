import type { Address, Hex } from "../../lib";
import type { LineItemTypeInfo, CampaignConfig } from "../../types/structs";
import type { CallSignerOptions } from "../../client/types";

/** Read-only methods for a CampaignInfo contract instance. */
export interface CampaignInfoReads {
  /** Returns the campaign launch timestamp in seconds. */
  getLaunchTime(): Promise<bigint>;
  /** Returns the campaign deadline timestamp in seconds. */
  getDeadline(): Promise<bigint>;
  /** Returns the campaign funding goal amount. */
  getGoalAmount(): Promise<bigint>;
  /** Returns the bytes32 campaign currency identifier. */
  getCampaignCurrency(): Promise<Hex>;
  /** Returns the bytes32 identifier hash for this campaign. */
  getIdentifierHash(): Promise<Hex>;
  /** Returns true if the platform is selected for this campaign. */
  checkIfPlatformSelected(platformBytes: Hex): Promise<boolean>;
  /** Returns true if the platform is approved for this campaign. */
  checkIfPlatformApproved(platformHash: Hex): Promise<boolean>;
  /** Returns the platform admin address. */
  getPlatformAdminAddress(platformBytes: Hex): Promise<Address>;
  /** Returns a platform-scoped data value by key. */
  getPlatformData(platformDataKey: Hex): Promise<Hex>;
  /** Returns the platform fee percent in basis points. */
  getPlatformFeePercent(platformBytes: Hex): Promise<bigint>;
  /** Returns the platform claim delay in seconds. */
  getPlatformClaimDelay(platformHash: Hex): Promise<bigint>;
  /** Returns the protocol admin address. */
  getProtocolAdminAddress(): Promise<Address>;
  /** Returns the protocol fee percent in basis points. */
  getProtocolFeePercent(): Promise<bigint>;
  /** Returns the list of accepted token addresses for this campaign. */
  getAcceptedTokens(): Promise<readonly Address[]>;
  /** Returns true if the given token is accepted. */
  isTokenAccepted(token: Address): Promise<boolean>;
  /** Returns the cumulative amount raised across all treasuries. */
  getTotalRaisedAmount(): Promise<bigint>;
  /** Returns the lifetime raised amount including refunded funds. */
  getTotalLifetimeRaisedAmount(): Promise<bigint>;
  /** Returns the total amount refunded to backers. */
  getTotalRefundedAmount(): Promise<bigint>;
  /** Returns the available (non-refunded) raised amount. */
  getTotalAvailableRaisedAmount(): Promise<bigint>;
  /** Returns the total cancelled payment amount. */
  getTotalCancelledAmount(): Promise<bigint>;
  /** Returns the total expected payment amount. */
  getTotalExpectedAmount(): Promise<bigint>;
  /** Returns a value from the campaign data registry by key. */
  getDataFromRegistry(key: Hex): Promise<Hex>;
  /** Returns the buffer time in seconds between deadline and claim window. */
  getBufferTime(): Promise<bigint>;
  /** Returns the line item type config for a platform + typeId pair. */
  getLineItemType(platformHash: Hex, typeId: Hex): Promise<LineItemTypeInfo>;
  /** Returns the campaign config struct (treasuryFactory, protocolFeePercent, identifierHash). */
  getCampaignConfig(): Promise<CampaignConfig>;
  /** Returns the list of approved platform hashes for this campaign. */
  getApprovedPlatformHashes(): Promise<readonly Hex[]>;
  /** Returns true if the campaign info is locked against modifications. */
  isLocked(): Promise<boolean>;
  /** Returns true if the campaign has been cancelled. */
  cancelled(): Promise<boolean>;
  /** Returns the contract owner address. */
  owner(): Promise<Address>;
  /** Returns true if the campaign is paused. */
  paused(): Promise<boolean>;
}

/** Write methods for a CampaignInfo contract instance. */
export interface CampaignInfoWrites {
  /** Updates the campaign deadline timestamp. */
  updateDeadline(deadline: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Updates the campaign funding goal amount. */
  updateGoalAmount(goalAmount: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Updates the campaign launch timestamp. */
  updateLaunchTime(launchTime: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Updates whether a platform is selected for this campaign. */
  updateSelectedPlatform(platformHash: Hex, selection: boolean, platformDataKey: readonly Hex[], platformDataValue: readonly Hex[], options?: CallSignerOptions): Promise<Hex>;
  /** Updates the NFT image URI for pledge tokens. */
  setImageURI(newImageURI: string, options?: CallSignerOptions): Promise<Hex>;
  /** Updates the ERC-721 contract metadata URI. */
  updateContractURI(newContractURI: string, options?: CallSignerOptions): Promise<Hex>;
  /** Mints a pledge NFT for a backer; returns the tx hash (tokenId is in receipt events). */
  mintNFTForPledge(backer: Address, reward: Hex, tokenAddress: Address, amount: bigint, shippingFee: bigint, tipAmount: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Burns a pledge NFT. */
  burn(tokenId: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Pauses the campaign. */
  pauseCampaign(message: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Unpauses the campaign. */
  unpauseCampaign(message: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Cancels the campaign permanently. */
  cancelCampaign(message: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Sets the platform treasury address for a platform. */
  setPlatformInfo(platformBytes: Hex, platformTreasuryAddress: Address, options?: CallSignerOptions): Promise<Hex>;
  /** Transfers contract ownership to a new address. */
  transferOwnership(newOwner: Address, options?: CallSignerOptions): Promise<Hex>;
  /** Renounces contract ownership permanently. */
  renounceOwnership(options?: CallSignerOptions): Promise<Hex>;
}

/** Simulate counterparts for CampaignInfo write methods. */
export interface CampaignInfoSimulate {
  /** Simulates updateDeadline; throws a typed error on revert. */
  updateDeadline(deadline: bigint, options?: CallSignerOptions): Promise<void>;
  /** Simulates updateGoalAmount; throws a typed error on revert. */
  updateGoalAmount(goalAmount: bigint, options?: CallSignerOptions): Promise<void>;
  /** Simulates updateLaunchTime; throws a typed error on revert. */
  updateLaunchTime(launchTime: bigint, options?: CallSignerOptions): Promise<void>;
  /** Simulates updateSelectedPlatform; throws a typed error on revert. */
  updateSelectedPlatform(platformHash: Hex, selection: boolean, platformDataKey: readonly Hex[], platformDataValue: readonly Hex[], options?: CallSignerOptions): Promise<void>;
  /** Simulates setImageURI; throws a typed error on revert. */
  setImageURI(newImageURI: string, options?: CallSignerOptions): Promise<void>;
  /** Simulates updateContractURI; throws a typed error on revert. */
  updateContractURI(newContractURI: string, options?: CallSignerOptions): Promise<void>;
  /** Simulates mintNFTForPledge; throws a typed error on revert. */
  mintNFTForPledge(backer: Address, reward: Hex, tokenAddress: Address, amount: bigint, shippingFee: bigint, tipAmount: bigint, options?: CallSignerOptions): Promise<void>;
  /** Simulates burn; throws a typed error on revert. */
  burn(tokenId: bigint, options?: CallSignerOptions): Promise<void>;
  /** Simulates pauseCampaign; throws a typed error on revert. */
  pauseCampaign(message: Hex, options?: CallSignerOptions): Promise<void>;
  /** Simulates unpauseCampaign; throws a typed error on revert. */
  unpauseCampaign(message: Hex, options?: CallSignerOptions): Promise<void>;
  /** Simulates cancelCampaign; throws a typed error on revert. */
  cancelCampaign(message: Hex, options?: CallSignerOptions): Promise<void>;
  /** Simulates setPlatformInfo; throws a typed error on revert. */
  setPlatformInfo(platformBytes: Hex, platformTreasuryAddress: Address, options?: CallSignerOptions): Promise<void>;
  /** Simulates transferOwnership; throws a typed error on revert. */
  transferOwnership(newOwner: Address, options?: CallSignerOptions): Promise<void>;
  /** Simulates renounceOwnership; throws a typed error on revert. */
  renounceOwnership(options?: CallSignerOptions): Promise<void>;
}

/** Event helpers for a CampaignInfo contract instance. */
export interface CampaignInfoEvents {}

/** Full CampaignInfo entity combining reads, writes, simulate, and events. */
export type CampaignInfoEntity = CampaignInfoReads & CampaignInfoWrites & {
  /** Simulation counterparts for every write method. */
  simulate: CampaignInfoSimulate;
  /** Event helpers for filtering and watching logs. */
  events: CampaignInfoEvents;
};
