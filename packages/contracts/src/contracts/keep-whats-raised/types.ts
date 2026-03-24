import type { Address, Hex } from "../../lib";
import type { TieredReward } from "../../types/structs";
import type { KeepWhatsRaisedConfig, KeepWhatsRaisedFeeKeys, KeepWhatsRaisedFeeValues } from "../../types/params";
import type { CampaignData } from "../../types/structs";

/** Read-only methods for KeepWhatsRaised treasury. */
export interface KeepWhatsRaisedReads {
  /** Returns the current total amount raised in the treasury (excludes refunds). */
  getRaisedAmount(): Promise<bigint>;
  /** Returns the all-time total raised, including amounts that were later refunded. */
  getLifetimeRaisedAmount(): Promise<bigint>;
  /** Returns the total amount that has been refunded to backers. */
  getRefundedAmount(): Promise<bigint>;
  /** Returns the amount available for withdrawal (raised minus refunded and fees). */
  getAvailableRaisedAmount(): Promise<bigint>;
  /** Returns the TieredReward struct for the given reward name. */
  getReward(rewardName: Hex): Promise<TieredReward>;
  /** Returns the bytes32 platform hash associated with this treasury. */
  getPlatformHash(): Promise<Hex>;
  /** Returns the platform fee percent in basis points. */
  getPlatformFeePercent(): Promise<bigint>;
  /** Returns true if a withdrawal has been approved by the platform admin. */
  getWithdrawalApprovalStatus(): Promise<boolean>;
  /** Returns the campaign launch time as a Unix timestamp in seconds. */
  getLaunchTime(): Promise<bigint>;
  /** Returns the campaign deadline as a Unix timestamp in seconds. */
  getDeadline(): Promise<bigint>;
  /** Returns the campaign funding goal in currency units. */
  getGoalAmount(): Promise<bigint>;
  /** Returns the payment gateway fee associated with the given pledge ID. */
  getPaymentGatewayFee(pledgeId: Hex): Promise<bigint>;
  /** Returns the fee value stored under the given registry fee key. */
  getFeeValue(feeKey: Hex): Promise<bigint>;
  /** Returns true if the treasury is currently paused. */
  paused(): Promise<boolean>;
  /** Returns true if the treasury has been cancelled. */
  cancelled(): Promise<boolean>;
  /** Returns the number of pledge NFT tokens held by the given owner. */
  balanceOf(owner: Address): Promise<bigint>;
  /** Returns the owner address of the pledge NFT with the given token ID. */
  ownerOf(tokenId: bigint): Promise<Address>;
  /** Returns the metadata URI for the pledge NFT with the given token ID. */
  tokenURI(tokenId: bigint): Promise<string>;
  /** Returns the ERC-721 collection name. */
  name(): Promise<string>;
  /** Returns the ERC-721 collection symbol. */
  symbol(): Promise<string>;
  /** Returns the address approved to transfer the given token ID. */
  getApproved(tokenId: bigint): Promise<Address>;
  /** Returns true if the operator is approved to manage all tokens of the given owner. */
  isApprovedForAll(owner: Address, operator: Address): Promise<boolean>;
  /** Returns true if the contract implements the given ERC-165 interface ID. */
  supportsInterface(interfaceId: Hex): Promise<boolean>;
}

/** Write methods for KeepWhatsRaised treasury. */
export interface KeepWhatsRaisedWrites {
  /** Pauses the treasury, halting pledges and withdrawals; emits a pause message. */
  pauseTreasury(message: Hex): Promise<Hex>;
  /** Unpauses the treasury, resuming normal operation; emits an unpause message. */
  unpauseTreasury(message: Hex): Promise<Hex>;
  /** Cancels the treasury permanently; emits a cancellation message. */
  cancelTreasury(message: Hex): Promise<Hex>;
  /** Configures the treasury with campaign data, fee keys, and fee values. */
  configureTreasury(
    config: KeepWhatsRaisedConfig,
    campaignData: CampaignData,
    feeKeys: KeepWhatsRaisedFeeKeys,
    feeValues: KeepWhatsRaisedFeeValues,
  ): Promise<Hex>;
  /** Registers one or more tiered rewards by name. */
  addRewards(rewardNames: readonly Hex[], rewards: readonly TieredReward[]): Promise<Hex>;
  /** Removes a previously registered reward by name. */
  removeReward(rewardName: Hex): Promise<Hex>;
  /** Marks the withdrawal as approved by the platform admin. */
  approveWithdrawal(): Promise<Hex>;
  /** Sets the payment gateway fee for a specific pledge ID. */
  setPaymentGatewayFee(pledgeId: Hex, fee: bigint): Promise<Hex>;
  /** Records a pledge amount and fee together in a single transaction. */
  setFeeAndPledge(
    pledgeId: Hex,
    backer: Address,
    pledgeToken: Address,
    pledgeAmount: bigint,
    tip: bigint,
    fee: bigint,
    reward: readonly Hex[],
    isPledgeForAReward: boolean,
  ): Promise<Hex>;
  /** Processes a backer pledge for one or more reward tiers. */
  pledgeForAReward(
    pledgeId: Hex,
    backer: Address,
    pledgeToken: Address,
    tip: bigint,
    rewardNames: readonly Hex[],
  ): Promise<Hex>;
  /** Processes a backer pledge with no reward tier selected. */
  pledgeWithoutAReward(
    pledgeId: Hex,
    backer: Address,
    pledgeToken: Address,
    pledgeAmount: bigint,
    tip: bigint,
  ): Promise<Hex>;
  /** Burns the pledge NFT and issues a refund for the given token ID. */
  claimRefund(tokenId: bigint): Promise<Hex>;
  /** Transfers accumulated tips to the platform tip recipient. */
  claimTip(): Promise<Hex>;
  /** Transfers raised funds to the campaign creator after successful campaign. */
  claimFund(): Promise<Hex>;
  /** Disburses protocol and platform fees to their respective recipients. */
  disburseFees(): Promise<Hex>;
  /** Withdraws a specific token amount from the treasury to the caller. */
  withdraw(token: Address, amount: bigint): Promise<Hex>;
  /** Updates the campaign deadline to a new Unix timestamp in seconds. */
  updateDeadline(deadline: bigint): Promise<Hex>;
  /** Updates the campaign funding goal amount. */
  updateGoalAmount(goalAmount: bigint): Promise<Hex>;
  /** Approves an address to transfer a specific pledge NFT token. */
  approve(to: Address, tokenId: bigint): Promise<Hex>;
  /** Grants or revokes operator approval for all tokens owned by the caller. */
  setApprovalForAll(operator: Address, approved: boolean): Promise<Hex>;
  /** Safely transfers a pledge NFT, calling onERC721Received on the recipient. */
  safeTransferFrom(from: Address, to: Address, tokenId: bigint): Promise<Hex>;
  /** Transfers a pledge NFT without the ERC-721 receiver check. */
  transferFrom(from: Address, to: Address, tokenId: bigint): Promise<Hex>;
}

/** Simulate counterparts for KeepWhatsRaised write methods. */
export interface KeepWhatsRaisedSimulate {
  /** Simulates pauseTreasury; throws a typed error on revert. */
  pauseTreasury(message: Hex): Promise<void>;
  /** Simulates unpauseTreasury; throws a typed error on revert. */
  unpauseTreasury(message: Hex): Promise<void>;
  /** Simulates cancelTreasury; throws a typed error on revert. */
  cancelTreasury(message: Hex): Promise<void>;
  /** Simulates configureTreasury; throws a typed error on revert. */
  configureTreasury(
    config: KeepWhatsRaisedConfig,
    campaignData: CampaignData,
    feeKeys: KeepWhatsRaisedFeeKeys,
    feeValues: KeepWhatsRaisedFeeValues,
  ): Promise<void>;
  /** Simulates addRewards; throws a typed error on revert. */
  addRewards(rewardNames: readonly Hex[], rewards: readonly TieredReward[]): Promise<void>;
  /** Simulates removeReward; throws a typed error on revert. */
  removeReward(rewardName: Hex): Promise<void>;
  /** Simulates approveWithdrawal; throws a typed error on revert. */
  approveWithdrawal(): Promise<void>;
  /** Simulates setPaymentGatewayFee; throws a typed error on revert. */
  setPaymentGatewayFee(pledgeId: Hex, fee: bigint): Promise<void>;
  /** Simulates setFeeAndPledge; throws a typed error on revert. */
  setFeeAndPledge(
    pledgeId: Hex,
    backer: Address,
    pledgeToken: Address,
    pledgeAmount: bigint,
    tip: bigint,
    fee: bigint,
    reward: readonly Hex[],
    isPledgeForAReward: boolean,
  ): Promise<void>;
  /** Simulates pledgeForAReward; throws a typed error on revert. */
  pledgeForAReward(
    pledgeId: Hex,
    backer: Address,
    pledgeToken: Address,
    tip: bigint,
    rewardNames: readonly Hex[],
  ): Promise<void>;
  /** Simulates pledgeWithoutAReward; throws a typed error on revert. */
  pledgeWithoutAReward(
    pledgeId: Hex,
    backer: Address,
    pledgeToken: Address,
    pledgeAmount: bigint,
    tip: bigint,
  ): Promise<void>;
  /** Simulates claimRefund; throws a typed error on revert. */
  claimRefund(tokenId: bigint): Promise<void>;
  /** Simulates claimTip; throws a typed error on revert. */
  claimTip(): Promise<void>;
  /** Simulates claimFund; throws a typed error on revert. */
  claimFund(): Promise<void>;
  /** Simulates disburseFees; throws a typed error on revert. */
  disburseFees(): Promise<void>;
  /** Simulates withdraw; throws a typed error on revert. */
  withdraw(token: Address, amount: bigint): Promise<void>;
  /** Simulates updateDeadline; throws a typed error on revert. */
  updateDeadline(deadline: bigint): Promise<void>;
  /** Simulates updateGoalAmount; throws a typed error on revert. */
  updateGoalAmount(goalAmount: bigint): Promise<void>;
  /** Simulates approve; throws a typed error on revert. */
  approve(to: Address, tokenId: bigint): Promise<void>;
  /** Simulates setApprovalForAll; throws a typed error on revert. */
  setApprovalForAll(operator: Address, approved: boolean): Promise<void>;
  /** Simulates safeTransferFrom; throws a typed error on revert. */
  safeTransferFrom(from: Address, to: Address, tokenId: bigint): Promise<void>;
  /** Simulates transferFrom; throws a typed error on revert. */
  transferFrom(from: Address, to: Address, tokenId: bigint): Promise<void>;
}

/** Event helpers for KeepWhatsRaised. */
export interface KeepWhatsRaisedEvents {}

/** Full KeepWhatsRaised treasury entity (reads, writes, simulate, events). */
export type KeepWhatsRaisedTreasuryEntity = KeepWhatsRaisedReads &
  KeepWhatsRaisedWrites & {
    simulate: KeepWhatsRaisedSimulate;
    events: KeepWhatsRaisedEvents;
  };
