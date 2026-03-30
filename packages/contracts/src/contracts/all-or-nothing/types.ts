import type { Address, Hex } from "../../lib";
import type { TieredReward } from "../../types/structs";
import type { CallSignerOptions } from "../../client/types";

/** Read-only methods for an AllOrNothing treasury contract instance. */
export interface AllOrNothingReads {
  /** Returns the current raised amount (total pledges minus refunds). */
  getRaisedAmount(): Promise<bigint>;
  /** Returns the lifetime raised amount including refunded pledges. */
  getLifetimeRaisedAmount(): Promise<bigint>;
  /** Returns the total amount refunded to backers. */
  getRefundedAmount(): Promise<bigint>;
  /** Returns the reward configuration for a given reward name. */
  getReward(rewardName: Hex): Promise<TieredReward>;
  /** Returns the bytes32 platform hash for this treasury. */
  getPlatformHash(): Promise<Hex>;
  /** Returns the platform fee percent in basis points. */
  getPlatformFeePercent(): Promise<bigint>;
  /** Returns true if the treasury is paused. */
  paused(): Promise<boolean>;
  /** Returns true if the treasury has been cancelled. */
  cancelled(): Promise<boolean>;
  /** Returns the NFT balance for the given owner address. */
  balanceOf(owner: Address): Promise<bigint>;
  /** Returns the owner of a pledge NFT by token ID. */
  ownerOf(tokenId: bigint): Promise<Address>;
  /** Returns the token URI for a pledge NFT. */
  tokenURI(tokenId: bigint): Promise<string>;
  /** Returns the ERC-721 collection name. */
  name(): Promise<string>;
  /** Returns the ERC-721 collection symbol. */
  symbol(): Promise<string>;
  /** Returns the approved address for a token ID. */
  getApproved(tokenId: bigint): Promise<Address>;
  /** Returns true if operator is approved for all tokens of owner. */
  isApprovedForAll(owner: Address, operator: Address): Promise<boolean>;
  /** Returns true if the contract implements the given ERC-165 interface. */
  supportsInterface(interfaceId: Hex): Promise<boolean>;
}

/** Write methods for an AllOrNothing treasury contract instance. */
export interface AllOrNothingWrites {
  /** Pauses the treasury. */
  pauseTreasury(message: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Unpauses the treasury. */
  unpauseTreasury(message: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Cancels the treasury permanently. */
  cancelTreasury(message: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Adds one or more reward tiers. */
  addRewards(rewardNames: readonly Hex[], rewards: readonly TieredReward[], options?: CallSignerOptions): Promise<Hex>;
  /** Removes a reward tier by name. */
  removeReward(rewardName: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Pledges for a reward; mints a pledge NFT. */
  pledgeForAReward(backer: Address, pledgeToken: Address, shippingFee: bigint, rewardNames: readonly Hex[], options?: CallSignerOptions): Promise<Hex>;
  /** Pledges without selecting a reward tier. */
  pledgeWithoutAReward(backer: Address, pledgeToken: Address, pledgeAmount: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Claims a refund for a pledge NFT (campaign did not reach goal). */
  claimRefund(tokenId: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Disburses accumulated fees to protocol and platform. */
  disburseFees(options?: CallSignerOptions): Promise<Hex>;
  /** Withdraws raised funds (campaign succeeded). */
  withdraw(options?: CallSignerOptions): Promise<Hex>;
  /** Burns a pledge NFT. */
  burn(tokenId: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Approves an address to transfer a specific pledge NFT. */
  approve(to: Address, tokenId: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Sets or revokes operator approval for all tokens. */
  setApprovalForAll(operator: Address, approved: boolean, options?: CallSignerOptions): Promise<Hex>;
  /** Safely transfers a pledge NFT. */
  safeTransferFrom(from: Address, to: Address, tokenId: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Transfers a pledge NFT without ERC-721 receiver check. */
  transferFrom(from: Address, to: Address, tokenId: bigint, options?: CallSignerOptions): Promise<Hex>;
}

/** Simulate counterparts for AllOrNothing write methods. */
export interface AllOrNothingSimulate {
  /** Simulates pledgeForAReward; throws a typed error on revert. */
  pledgeForAReward(backer: Address, pledgeToken: Address, shippingFee: bigint, rewardNames: readonly Hex[], options?: CallSignerOptions): Promise<void>;
  /** Simulates pledgeWithoutAReward; throws a typed error on revert. */
  pledgeWithoutAReward(backer: Address, pledgeToken: Address, pledgeAmount: bigint, options?: CallSignerOptions): Promise<void>;
  /** Simulates claimRefund; throws a typed error on revert. */
  claimRefund(tokenId: bigint, options?: CallSignerOptions): Promise<void>;
  /** Simulates disburseFees; throws a typed error on revert. */
  disburseFees(options?: CallSignerOptions): Promise<void>;
  /** Simulates withdraw; throws a typed error on revert. */
  withdraw(options?: CallSignerOptions): Promise<void>;
}

/** Event helpers for an AllOrNothing treasury contract instance. */
export interface AllOrNothingEvents {}

/** Full AllOrNothing treasury entity combining reads, writes, simulate, and events. */
export type AllOrNothingTreasuryEntity = AllOrNothingReads & AllOrNothingWrites & {
  /** Simulation counterparts for every write method. */
  simulate: AllOrNothingSimulate;
  /** Event helpers for filtering and watching logs. */
  events: AllOrNothingEvents;
};
