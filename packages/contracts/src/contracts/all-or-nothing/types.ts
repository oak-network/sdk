import type { Address, Hex } from "../../lib";
import type { TieredReward } from "../../types/structs";
import type { DecodedEventLog, EventFilterOptions, EventWatchHandler, RawLog, SimulationResult } from "../../types/events";
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
}

/** Simulate counterparts for AllOrNothing write methods. */
export interface AllOrNothingSimulate {
  /** Simulates pauseTreasury; returns a SimulationResult on success, throws a typed error on revert. */
  pauseTreasury(message: Hex, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates unpauseTreasury; returns a SimulationResult on success, throws a typed error on revert. */
  unpauseTreasury(message: Hex, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates cancelTreasury; returns a SimulationResult on success, throws a typed error on revert. */
  cancelTreasury(message: Hex, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates addRewards; returns a SimulationResult on success, throws a typed error on revert. */
  addRewards(rewardNames: readonly Hex[], rewards: readonly TieredReward[], options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates removeReward; returns a SimulationResult on success, throws a typed error on revert. */
  removeReward(rewardName: Hex, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates pledgeForAReward; returns a SimulationResult on success, throws a typed error on revert. */
  pledgeForAReward(backer: Address, pledgeToken: Address, shippingFee: bigint, rewardNames: readonly Hex[], options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates pledgeWithoutAReward; returns a SimulationResult on success, throws a typed error on revert. */
  pledgeWithoutAReward(backer: Address, pledgeToken: Address, pledgeAmount: bigint, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates claimRefund; returns a SimulationResult on success, throws a typed error on revert. */
  claimRefund(tokenId: bigint, options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates disburseFees; returns a SimulationResult on success, throws a typed error on revert. */
  disburseFees(options?: CallSignerOptions): Promise<SimulationResult>;
  /** Simulates withdraw; returns a SimulationResult on success, throws a typed error on revert. */
  withdraw(options?: CallSignerOptions): Promise<SimulationResult>;
}

/** Event helpers for an AllOrNothing treasury contract instance. */
export interface AllOrNothingEvents {
  /** Returns decoded Receipt event logs (pledge events). */
  getReceiptLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded RefundClaimed event logs. */
  getRefundClaimedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded WithdrawalSuccessful event logs. */
  getWithdrawalSuccessfulLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded FeesDisbursed event logs. */
  getFeesDisbursedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded RewardsAdded event logs. */
  getRewardsAddedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded RewardRemoved event logs. */
  getRewardRemovedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded Paused event logs. */
  getPausedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded Unpaused event logs. */
  getUnpausedLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded Cancelled event logs. */
  getCancelledLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Returns decoded SuccessConditionNotFulfilled event logs. */
  getSuccessConditionNotFulfilledLogs(options?: EventFilterOptions): Promise<readonly DecodedEventLog[]>;
  /** Decodes a raw log entry against all known AllOrNothing events. */
  decodeLog(log: RawLog): DecodedEventLog;
  /** Watches for Receipt events in real time. Returns an unwatch function. */
  watchReceipt(onLogs: EventWatchHandler): () => void;
  /** Watches for RefundClaimed events in real time. Returns an unwatch function. */
  watchRefundClaimed(onLogs: EventWatchHandler): () => void;
  /** Watches for WithdrawalSuccessful events in real time. Returns an unwatch function. */
  watchWithdrawalSuccessful(onLogs: EventWatchHandler): () => void;
  /** Watches for FeesDisbursed events in real time. Returns an unwatch function. */
  watchFeesDisbursed(onLogs: EventWatchHandler): () => void;
  /** Watches for RewardsAdded events in real time. Returns an unwatch function. */
  watchRewardsAdded(onLogs: EventWatchHandler): () => void;
  /** Watches for RewardRemoved events in real time. Returns an unwatch function. */
  watchRewardRemoved(onLogs: EventWatchHandler): () => void;
  /** Watches for Paused events in real time. Returns an unwatch function. */
  watchPaused(onLogs: EventWatchHandler): () => void;
  /** Watches for Unpaused events in real time. Returns an unwatch function. */
  watchUnpaused(onLogs: EventWatchHandler): () => void;
  /** Watches for Cancelled events in real time. Returns an unwatch function. */
  watchCancelled(onLogs: EventWatchHandler): () => void;
  /** Watches for SuccessConditionNotFulfilled events in real time. Returns an unwatch function. */
  watchSuccessConditionNotFulfilled(onLogs: EventWatchHandler): () => void;
}

/** Full AllOrNothing treasury entity combining reads, writes, simulate, and events. */
export type AllOrNothingTreasuryEntity = AllOrNothingReads & AllOrNothingWrites & {
  /** Simulation counterparts for every write method. */
  simulate: AllOrNothingSimulate;
  /** Event helpers for filtering and watching logs. */
  events: AllOrNothingEvents;
};
