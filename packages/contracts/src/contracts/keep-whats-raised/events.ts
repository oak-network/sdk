import { decodeEventLog } from "../../lib";
import type { Address, Hex, PublicClient } from "../../lib";
import { KEEP_WHATS_RAISED_ABI } from "./abi";
import type { DecodedEventLog, EventFilterOptions, EventWatchHandler } from "../../types/events";
import type { KeepWhatsRaisedEvents } from "./types";

type AbiEventName = Extract<(typeof KEEP_WHATS_RAISED_ABI)[number], { type: "event" }>["name"];

function decode(log: { topics: Hex[]; data: Hex }): DecodedEventLog {
  const decoded = decodeEventLog({ abi: KEEP_WHATS_RAISED_ABI, topics: log.topics as [Hex, ...Hex[]], data: log.data });
  return { eventName: decoded.eventName, args: decoded.args as Record<string, unknown> };
}

async function fetchEventLogs(
  publicClient: PublicClient,
  address: Address,
  eventName: AbiEventName,
  options?: EventFilterOptions,
): Promise<readonly DecodedEventLog[]> {
  const logs = await publicClient.getContractEvents({
    address, abi: KEEP_WHATS_RAISED_ABI, eventName,
    fromBlock: options?.fromBlock ?? 0n, toBlock: options?.toBlock,
  });
  return logs.map((log) => decode({ topics: [...log.topics] as Hex[], data: log.data }));
}

function createWatcher(
  publicClient: PublicClient,
  address: Address,
  eventName: AbiEventName,
  onLogs: EventWatchHandler,
): () => void {
  return publicClient.watchContractEvent({
    address, abi: KEEP_WHATS_RAISED_ABI, eventName,
    onLogs: (logs) => {
      onLogs(logs.map((log) => decode({ topics: [...log.topics] as Hex[], data: log.data })));
    },
  });
}

/**
 * Builds event helpers for a KeepWhatsRaised treasury contract instance.
 * @param address - Deployed KeepWhatsRaised contract address
 * @param publicClient - Viem PublicClient used to call getLogs
 * @returns Event helpers bound to the given contract address
 */
export function createKeepWhatsRaisedEvents(
  address: Address,
  publicClient: PublicClient,
): KeepWhatsRaisedEvents {
  return {
    async getReceiptLogs(options) {
      return fetchEventLogs(publicClient, address, "Receipt", options);
    },
    async getRefundClaimedLogs(options) {
      return fetchEventLogs(publicClient, address, "RefundClaimed", options);
    },
    async getWithdrawalWithFeeSuccessfulLogs(options) {
      return fetchEventLogs(publicClient, address, "WithdrawalWithFeeSuccessful", options);
    },
    async getWithdrawalApprovedLogs(options) {
      return fetchEventLogs(publicClient, address, "WithdrawalApproved", options);
    },
    async getFeesDisbursedLogs(options) {
      return fetchEventLogs(publicClient, address, "FeesDisbursed", options);
    },
    async getTreasuryConfiguredLogs(options) {
      return fetchEventLogs(publicClient, address, "TreasuryConfigured", options);
    },
    async getRewardsAddedLogs(options) {
      return fetchEventLogs(publicClient, address, "RewardsAdded", options);
    },
    async getRewardRemovedLogs(options) {
      return fetchEventLogs(publicClient, address, "RewardRemoved", options);
    },
    async getTipClaimedLogs(options) {
      return fetchEventLogs(publicClient, address, "TipClaimed", options);
    },
    async getFundClaimedLogs(options) {
      return fetchEventLogs(publicClient, address, "FundClaimed", options);
    },
    async getDeadlineUpdatedLogs(options) {
      return fetchEventLogs(publicClient, address, "KeepWhatsRaisedDeadlineUpdated", options);
    },
    async getGoalAmountUpdatedLogs(options) {
      return fetchEventLogs(publicClient, address, "KeepWhatsRaisedGoalAmountUpdated", options);
    },
    async getPaymentGatewayFeeSetLogs(options) {
      return fetchEventLogs(publicClient, address, "KeepWhatsRaisedPaymentGatewayFeeSet", options);
    },
    async getPausedLogs(options) {
      return fetchEventLogs(publicClient, address, "Paused", options);
    },
    async getUnpausedLogs(options) {
      return fetchEventLogs(publicClient, address, "Unpaused", options);
    },
    async getTransferLogs(options) {
      return fetchEventLogs(publicClient, address, "Transfer", options);
    },
    async getApprovalLogs(options) {
      return fetchEventLogs(publicClient, address, "Approval", options);
    },
    async getApprovalForAllLogs(options) {
      return fetchEventLogs(publicClient, address, "ApprovalForAll", options);
    },
    decodeLog(log) {
      return decode({ topics: [...log.topics] as Hex[], data: log.data });
    },
    watchReceipt(onLogs) {
      return createWatcher(publicClient, address, "Receipt", onLogs);
    },
    watchRefundClaimed(onLogs) {
      return createWatcher(publicClient, address, "RefundClaimed", onLogs);
    },
    watchWithdrawalWithFeeSuccessful(onLogs) {
      return createWatcher(publicClient, address, "WithdrawalWithFeeSuccessful", onLogs);
    },
    watchWithdrawalApproved(onLogs) {
      return createWatcher(publicClient, address, "WithdrawalApproved", onLogs);
    },
    watchFeesDisbursed(onLogs) {
      return createWatcher(publicClient, address, "FeesDisbursed", onLogs);
    },
    watchTreasuryConfigured(onLogs) {
      return createWatcher(publicClient, address, "TreasuryConfigured", onLogs);
    },
    watchRewardsAdded(onLogs) {
      return createWatcher(publicClient, address, "RewardsAdded", onLogs);
    },
    watchRewardRemoved(onLogs) {
      return createWatcher(publicClient, address, "RewardRemoved", onLogs);
    },
    watchTipClaimed(onLogs) {
      return createWatcher(publicClient, address, "TipClaimed", onLogs);
    },
    watchFundClaimed(onLogs) {
      return createWatcher(publicClient, address, "FundClaimed", onLogs);
    },
    watchDeadlineUpdated(onLogs) {
      return createWatcher(publicClient, address, "KeepWhatsRaisedDeadlineUpdated", onLogs);
    },
    watchGoalAmountUpdated(onLogs) {
      return createWatcher(publicClient, address, "KeepWhatsRaisedGoalAmountUpdated", onLogs);
    },
    watchPaymentGatewayFeeSet(onLogs) {
      return createWatcher(publicClient, address, "KeepWhatsRaisedPaymentGatewayFeeSet", onLogs);
    },
    watchPaused(onLogs) {
      return createWatcher(publicClient, address, "Paused", onLogs);
    },
    watchUnpaused(onLogs) {
      return createWatcher(publicClient, address, "Unpaused", onLogs);
    },
    watchTransfer(onLogs) {
      return createWatcher(publicClient, address, "Transfer", onLogs);
    },
    watchApproval(onLogs) {
      return createWatcher(publicClient, address, "Approval", onLogs);
    },
    watchApprovalForAll(onLogs) {
      return createWatcher(publicClient, address, "ApprovalForAll", onLogs);
    },
  };
}
