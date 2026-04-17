import { decodeEventLog } from "../../lib";
import type { Address, Hex, PublicClient } from "../../lib";
import { ALL_OR_NOTHING_ABI } from "./abi";
import type { DecodedEventLog, EventFilterOptions, EventWatchHandler } from "../../types/events";
import type { AllOrNothingEvents } from "./types";

type AbiEventName = Extract<(typeof ALL_OR_NOTHING_ABI)[number], { type: "event" }>["name"];

/**
 * Decodes a raw log using the AllOrNothing ABI.
 * @param log - Raw log with topics and data
 * @returns Decoded event name and arguments
 */
function decode(log: { topics: Hex[]; data: Hex }): DecodedEventLog {
  const decoded = decodeEventLog({ abi: ALL_OR_NOTHING_ABI, topics: log.topics as [Hex, ...Hex[]], data: log.data });
  return {
    eventName: decoded.eventName,
    args: decoded.args as Record<string, unknown>,
  };
}

/**
 * Fetches and decodes event logs for a specific event name.
 * @param publicClient - Viem PublicClient
 * @param address - Contract address
 * @param eventName - ABI event name to filter by
 * @param options - Optional block range
 * @returns Array of decoded event logs
 */
async function fetchEventLogs(
  publicClient: PublicClient,
  address: Address,
  eventName: AbiEventName,
  options?: EventFilterOptions,
): Promise<readonly DecodedEventLog[]> {
  const logs = await publicClient.getContractEvents({
    address,
    abi: ALL_OR_NOTHING_ABI,
    eventName,
    fromBlock: options?.fromBlock,
    toBlock: options?.toBlock,
  });
  return logs.map((log) =>
    decode({ topics: [...log.topics] as Hex[], data: log.data }),
  );
}

/**
 * Creates a watcher for a specific event name using watchContractEvent.
 * @param publicClient - Viem PublicClient
 * @param address - Contract address
 * @param eventName - ABI event name to watch
 * @param onLogs - Handler invoked with decoded logs
 * @returns Unwatch function
 */
function createWatcher(
  publicClient: PublicClient,
  address: Address,
  eventName: AbiEventName,
  onLogs: EventWatchHandler,
): () => void {
  return publicClient.watchContractEvent({
    address,
    abi: ALL_OR_NOTHING_ABI,
    eventName,
    onLogs: (logs) => {
      onLogs(
        logs.map((log) => decode({ topics: [...log.topics] as Hex[], data: log.data })),
      );
    },
  });
}

/**
 * Builds event helpers for an AllOrNothing treasury contract instance.
 * @param address - Deployed AllOrNothing contract address
 * @param publicClient - Viem PublicClient used to call getLogs
 * @returns Event helpers bound to the given contract address
 */
export function createAllOrNothingEvents(
  address: Address,
  publicClient: PublicClient,
): AllOrNothingEvents {
  return {
    async getReceiptLogs(options) {
      return fetchEventLogs(publicClient, address, "Receipt", options);
    },
    async getRefundClaimedLogs(options) {
      return fetchEventLogs(publicClient, address, "RefundClaimed", options);
    },
    async getWithdrawalSuccessfulLogs(options) {
      return fetchEventLogs(publicClient, address, "WithdrawalSuccessful", options);
    },
    async getFeesDisbursedLogs(options) {
      return fetchEventLogs(publicClient, address, "FeesDisbursed", options);
    },
    async getRewardsAddedLogs(options) {
      return fetchEventLogs(publicClient, address, "RewardsAdded", options);
    },
    async getRewardRemovedLogs(options) {
      return fetchEventLogs(publicClient, address, "RewardRemoved", options);
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
    async getSuccessConditionNotFulfilledLogs(options) {
      return fetchEventLogs(publicClient, address, "SuccessConditionNotFulfilled", options);
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
    watchWithdrawalSuccessful(onLogs) {
      return createWatcher(publicClient, address, "WithdrawalSuccessful", onLogs);
    },
    watchFeesDisbursed(onLogs) {
      return createWatcher(publicClient, address, "FeesDisbursed", onLogs);
    },
    watchRewardsAdded(onLogs) {
      return createWatcher(publicClient, address, "RewardsAdded", onLogs);
    },
    watchRewardRemoved(onLogs) {
      return createWatcher(publicClient, address, "RewardRemoved", onLogs);
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
    watchSuccessConditionNotFulfilled(onLogs) {
      return createWatcher(publicClient, address, "SuccessConditionNotFulfilled", onLogs);
    },
    watchApproval(onLogs) {
      return createWatcher(publicClient, address, "Approval", onLogs);
    },
    watchApprovalForAll(onLogs) {
      return createWatcher(publicClient, address, "ApprovalForAll", onLogs);
    },
  };
}
