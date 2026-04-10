import type { Address, Hex } from "../../lib";
import type { TieredReward, CampaignData } from "../../types/structs";
import type { KeepWhatsRaisedConfig, KeepWhatsRaisedFeeKeys, KeepWhatsRaisedFeeValues } from "../../types/params";
import type { DecodedEventLog, EventFilterOptions, EventWatchHandler, RawLog, SimulationResult } from "../../types/events";
import type { CallSignerOptions } from "../../client/types";

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
  pauseTreasury(message: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Unpauses the treasury, resuming normal operation; emits an unpause message. */
  unpauseTreasury(message: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Cancels the treasury permanently; emits a cancellation message. */
  cancelTreasury(message: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Configures the treasury with campaign data, fee keys, and fee values. */
  configureTreasury(
    config: KeepWhatsRaisedConfig,
    campaignData: CampaignData,
    feeKeys: KeepWhatsRaisedFeeKeys,
    feeValues: KeepWhatsRaisedFeeValues,
    options?: CallSignerOptions,
  ): Promise<Hex>;
  /** Registers one or more tiered rewards by name. */
  addRewards(rewardNames: readonly Hex[], rewards: readonly TieredReward[], options?: CallSignerOptions): Promise<Hex>;
  /** Removes a previously registered reward by name. */
  removeReward(rewardName: Hex, options?: CallSignerOptions): Promise<Hex>;
  /** Marks the withdrawal as approved by the platform admin. */
  approveWithdrawal(options?: CallSignerOptions): Promise<Hex>;
  /** Sets the payment gateway fee for a specific pledge ID. */
  setPaymentGatewayFee(pledgeId: Hex, fee: bigint, options?: CallSignerOptions): Promise<Hex>;
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
    options?: CallSignerOptions,
  ): Promise<Hex>;
  /** Processes a backer pledge for one or more reward tiers. */
  pledgeForAReward(
    pledgeId: Hex,
    backer: Address,
    pledgeToken: Address,
    tip: bigint,
    rewardNames: readonly Hex[],
    options?: CallSignerOptions,
  ): Promise<Hex>;
  /** Processes a backer pledge with no reward tier selected. */
  pledgeWithoutAReward(
    pledgeId: Hex,
    backer: Address,
    pledgeToken: Address,
    pledgeAmount: bigint,
    tip: bigint,
    options?: CallSignerOptions,
  ): Promise<Hex>;
  /** Burns the pledge NFT and issues a refund for the given token ID. */
  claimRefund(tokenId: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Transfers accumulated tips to the platform tip recipient. */
  claimTip(options?: CallSignerOptions): Promise<Hex>;
  /** Transfers raised funds to the campaign creator after successful campaign. */
  claimFund(options?: CallSignerOptions): Promise<Hex>;
  /** Disburses protocol and platform fees to their respective recipients. */
  disburseFees(options?: CallSignerOptions): Promise<Hex>;
  /** Withdraws a specific token amount from the treasury to the caller. */
  withdraw(token: Address, amount: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Updates the campaign deadline to a new Unix timestamp in seconds. */
  updateDeadline(deadline: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Updates the campaign funding goal amount. */
  updateGoalAmount(goalAmount: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Approves an address to transfer a specific pledge NFT token. */
  approve(to: Address, tokenId: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Grants or revokes operator approval for all tokens owned by the caller. */
  setApprovalForAll(operator: Address, approved: boolean, options?: CallSignerOptions): Promise<Hex>;
  /** Safely transfers a pledge NFT, calling onERC721Received on the recipient. */
  safeTransferFrom(from: Address, to: Address, tokenId: bigint, options?: CallSignerOptions): Promise<Hex>;
  /** Transfers a pledge NFT without the ERC-721 receiver check. */
  transferFrom(from: Address, to: Address, tokenId: bigint, options?: CallSignerOptions): Promise<Hex>;
}

/** Simulate counterparts for KeepWhatsRaised write methods. */
export interface KeepWhatsRaisedSimulate {
  /** Simulates pauseTreasury; returns a SimulationResult on success, throws a typed error on revert. */
  pauseTreasury(message: Hex, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates unpauseTreasury; returns a SimulationResult on success, throws a typed error on revert. */
  unpauseTreasury(message: Hex, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates cancelTreasury; returns a SimulationResult on success, throws a typed error on revert. */
  cancelTreasury(message: Hex, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates configureTreasury; returns a SimulationResult on success, throws a typed error on revert. */
  configureTreasury(
    config: KeepWhatsRaisedConfig,
    campaignData: CampaignData,
    feeKeys: KeepWhatsRaisedFeeKeys,
    feeValues: KeepWhatsRaisedFeeValues,
    options?: CallSignerOptions,
  ): Promise<SimulationResult>;
  /** Simulates addRewards; returns a SimulationResult on success, throws a typed error on revert. */
  addRewards(rewardNames: readonly Hex[], rewards: readonly TieredReward[], options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates removeReward; returns a SimulationResult on success, throws a typed error on revert. */
  removeReward(rewardName: Hex, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates approveWithdrawal; returns a SimulationResult on success, throws a typed error on revert. */
  approveWithdrawal(options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates setPaymentGatewayFee; returns a SimulationResult on success, throws a typed error on revert. */
  setPaymentGatewayFee(pledgeId: Hex, fee: bigint, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates setFeeAndPledge; returns a SimulationResult on success, throws a typed error on revert. */
  setFeeAndPledge(
    pledgeId: Hex,
    backer: Address,
    pledgeToken: Address,
    pledgeAmount: bigint,
    tip: bigint,
    fee: bigint,
    reward: readonly Hex[],
    isPledgeForAReward: boolean,
    options?: CallSignerOptions,
  ): Promise<SimulationResult>;
  /** Simulates pledgeForAReward; returns a SimulationResult on success, throws a typed error on revert. */
  pledgeForAReward(
    pledgeId: Hex,
    backer: Address,
    pledgeToken: Address,
    tip: bigint,
    rewardNames: readonly Hex[],
    options?: CallSignerOptions,
  ): Promise<SimulationResult>;
  /** Simulates pledgeWithoutAReward; returns a SimulationResult on success, throws a typed error on revert. */
  pledgeWithoutAReward(
    pledgeId: Hex,
    backer: Address,
    pledgeToken: Address,
    pledgeAmount: bigint,
    tip: bigint,
    options?: CallSignerOptions,
  ): Promise<SimulationResult>;
  /** Simulates claimRefund; returns a SimulationResult on success, throws a typed error on revert. */
  claimRefund(tokenId: bigint, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates claimTip; returns a SimulationResult on success, throws a typed error on revert. */
  claimTip(options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates claimFund; returns a SimulationResult on success, throws a typed error on revert. */
  claimFund(options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates disburseFees; returns a SimulationResult on success, throws a typed error on revert. */
  disburseFees(options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates withdraw; returns a SimulationResult on success, throws a typed error on revert. */
  withdraw(token: Address, amount: bigint, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates updateDeadline; returns a SimulationResult on success, throws a typed error on revert. */
  updateDeadline(deadline: bigint, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates updateGoalAmount; returns a SimulationResult on success, throws a typed error on revert. */
  updateGoalAmount(goalAmount: bigint, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates approve; returns a SimulationResult on success, throws a typed error on revert. */
  approve(to: Address, tokenId: bigint, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates setApprovalForAll; returns a SimulationResult on success, throws a typed error on revert. */
  setApprovalForAll(operator: Address, approved: boolean, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates safeTransferFrom; returns a SimulationResult on success, throws a typed error on revert. */
  safeTransferFrom(from: Address, to: Address, tokenId: bigint, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates transferFrom; returns a SimulationResult on success, throws a typed error on revert. */
  transferFrom(from: Address, to: Address, tokenId: bigint, options?: CallSignerOptions): Promise<SimulationResult>;
}

/** Event helpers for KeepWhatsRaised. */
export interface KeepWhatsRaisedEvents {
  /** Returns decoded Receipt event logs (pledge events). */
  getReceiptLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded RefundClaimed event logs. */
  getRefundClaimedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded WithdrawalWithFeeSuccessful event logs. */
  getWithdrawalWithFeeSuccessfulLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded WithdrawalApproved event logs. */
  getWithdrawalApprovedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded FeesDisbursed event logs. */
  getFeesDisbursedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded TreasuryConfigured event logs. */
  getTreasuryConfiguredLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded RewardsAdded event logs. */
  getRewardsAddedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded RewardRemoved event logs. */
  getRewardRemovedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded TipClaimed event logs. */
  getTipClaimedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded FundClaimed event logs. */
  getFundClaimedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded KeepWhatsRaisedDeadlineUpdated event logs. */
  getDeadlineUpdatedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded KeepWhatsRaisedGoalAmountUpdated event logs. */
  getGoalAmountUpdatedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded KeepWhatsRaisedPaymentGatewayFeeSet event logs. */
  getPaymentGatewayFeeSetLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded Paused event logs. */
  getPausedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded Unpaused event logs. */
  getUnpausedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded Cancelled event logs. */
  getCancelledLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded Transfer event logs. */
  getTransferLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded Approval event logs. */
  getApprovalLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded ApprovalForAll event logs. */
  getApprovalForAllLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Decodes a raw log entry against all known KeepWhatsRaised events. */
  decodeLog(log: RawLog): DecodedEventLog;
  /** Watches for Receipt events in real time. Returns an unwatch function. */
  watchReceipt(onLogs: EventWatchHandler): () => void;
  /** Watches for RefundClaimed events in real time. Returns an unwatch function. */
  watchRefundClaimed(onLogs: EventWatchHandler): () => void;
  /** Watches for WithdrawalWithFeeSuccessful events in real time. Returns an unwatch function. */
  watchWithdrawalWithFeeSuccessful(onLogs: EventWatchHandler): () => void;
  /** Watches for FeesDisbursed events in real time. Returns an unwatch function. */
  watchFeesDisbursed(onLogs: EventWatchHandler): () => void;
  /** Watches for WithdrawalApproved events in real time. Returns an unwatch function. */
  watchWithdrawalApproved(onLogs: EventWatchHandler): () => void;
  /** Watches for TreasuryConfigured events in real time. Returns an unwatch function. */
  watchTreasuryConfigured(onLogs: EventWatchHandler): () => void;
  /** Watches for RewardsAdded events in real time. Returns an unwatch function. */
  watchRewardsAdded(onLogs: EventWatchHandler): () => void;
  /** Watches for RewardRemoved events in real time. Returns an unwatch function. */
  watchRewardRemoved(onLogs: EventWatchHandler): () => void;
  /** Watches for TipClaimed events in real time. Returns an unwatch function. */
  watchTipClaimed(onLogs: EventWatchHandler): () => void;
  /** Watches for FundClaimed events in real time. Returns an unwatch function. */
  watchFundClaimed(onLogs: EventWatchHandler): () => void;
  /** Watches for KeepWhatsRaisedDeadlineUpdated events in real time. Returns an unwatch function. */
  watchDeadlineUpdated(onLogs: EventWatchHandler): () => void;
  /** Watches for KeepWhatsRaisedGoalAmountUpdated events in real time. Returns an unwatch function. */
  watchGoalAmountUpdated(onLogs: EventWatchHandler): () => void;
  /** Watches for KeepWhatsRaisedPaymentGatewayFeeSet events in real time. Returns an unwatch function. */
  watchPaymentGatewayFeeSet(onLogs: EventWatchHandler): () => void;
  /** Watches for Paused events in real time. Returns an unwatch function. */
  watchPaused(onLogs: EventWatchHandler): () => void;
  /** Watches for Unpaused events in real time. Returns an unwatch function. */
  watchUnpaused(onLogs: EventWatchHandler): () => void;
  /** Watches for Cancelled events in real time. Returns an unwatch function. */
  watchCancelled(onLogs: EventWatchHandler): () => void;
  /** Watches for Transfer events in real time. Returns an unwatch function. */
  watchTransfer(onLogs: EventWatchHandler): () => void;
  /** Watches for Approval events in real time. Returns an unwatch function. */
  watchApproval(onLogs: EventWatchHandler): () => void;
  /** Watches for ApprovalForAll events in real time. Returns an unwatch function. */
  watchApprovalForAll(onLogs: EventWatchHandler): () => void;
}

/** Full KeepWhatsRaised treasury entity (reads, writes, simulate, events). */
export type KeepWhatsRaisedTreasuryEntity = KeepWhatsRaisedReads &
  KeepWhatsRaisedWrites & {
    simulate: KeepWhatsRaisedSimulate;
    events: KeepWhatsRaisedEvents;
  };
