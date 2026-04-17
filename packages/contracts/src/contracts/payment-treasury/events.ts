import { decodeEventLog } from "../../lib";
import type { Address, Hex, PublicClient } from "../../lib";
import { PAYMENT_TREASURY_ABI } from "./abi";
import type { DecodedEventLog, EventFilterOptions, EventWatchHandler } from "../../types/events";
import type { PaymentTreasuryEvents } from "./types";

type AbiEventName = Extract<(typeof PAYMENT_TREASURY_ABI)[number], { type: "event" }>["name"];

function decode(log: { topics: Hex[]; data: Hex }): DecodedEventLog {
  const decoded = decodeEventLog({ abi: PAYMENT_TREASURY_ABI, topics: log.topics as [Hex, ...Hex[]], data: log.data });
  return { eventName: decoded.eventName, args: decoded.args as Record<string, unknown> };
}

async function fetchEventLogs(
  publicClient: PublicClient,
  address: Address,
  eventName: AbiEventName,
  options?: EventFilterOptions,
): Promise<readonly DecodedEventLog[]> {
  const logs = await publicClient.getContractEvents({
    address, abi: PAYMENT_TREASURY_ABI, eventName,
    fromBlock: options?.fromBlock, toBlock: options?.toBlock,
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
    address, abi: PAYMENT_TREASURY_ABI, eventName,
    onLogs: (logs) => {
      onLogs(logs.map((log) => decode({ topics: [...log.topics] as Hex[], data: log.data })));
    },
  });
}

/**
 * Builds event helpers for a PaymentTreasury contract instance.
 * @param address - Deployed PaymentTreasury contract address
 * @param publicClient - Viem PublicClient used to call getLogs
 * @returns Event helpers bound to the given contract address
 */
export function createPaymentTreasuryEvents(
  address: Address,
  publicClient: PublicClient,
): PaymentTreasuryEvents {
  return {
    async getPaymentCreatedLogs(options) {
      return fetchEventLogs(publicClient, address, "PaymentCreated", options);
    },
    async getPaymentCancelledLogs(options) {
      return fetchEventLogs(publicClient, address, "PaymentCancelled", options);
    },
    async getPaymentConfirmedLogs(options) {
      return fetchEventLogs(publicClient, address, "PaymentConfirmed", options);
    },
    async getPaymentBatchConfirmedLogs(options) {
      return fetchEventLogs(publicClient, address, "PaymentBatchConfirmed", options);
    },
    async getPaymentBatchCreatedLogs(options) {
      return fetchEventLogs(publicClient, address, "PaymentBatchCreated", options);
    },
    async getFeesDisbursedLogs(options) {
      return fetchEventLogs(publicClient, address, "FeesDisbursed", options);
    },
    async getWithdrawalWithFeeSuccessfulLogs(options) {
      return fetchEventLogs(publicClient, address, "WithdrawalWithFeeSuccessful", options);
    },
    async getRefundClaimedLogs(options) {
      return fetchEventLogs(publicClient, address, "RefundClaimed", options);
    },
    async getNonGoalLineItemsClaimedLogs(options) {
      return fetchEventLogs(publicClient, address, "NonGoalLineItemsClaimed", options);
    },
    async getExpiredFundsClaimedLogs(options) {
      return fetchEventLogs(publicClient, address, "ExpiredFundsClaimed", options);
    },
    async getPausedLogs(options) {
      return fetchEventLogs(publicClient, address, "Paused", options);
    },
    async getUnpausedLogs(options) {
      return fetchEventLogs(publicClient, address, "Unpaused", options);
    },
    async getCancelledLogs(options) {
      return fetchEventLogs(publicClient, address, "Cancelled", options);
    },
    decodeLog(log) {
      return decode({ topics: [...log.topics] as Hex[], data: log.data });
    },
    watchPaymentCreated(onLogs) {
      return createWatcher(publicClient, address, "PaymentCreated", onLogs);
    },
    watchPaymentConfirmed(onLogs) {
      return createWatcher(publicClient, address, "PaymentConfirmed", onLogs);
    },
    watchPaymentCancelled(onLogs) {
      return createWatcher(publicClient, address, "PaymentCancelled", onLogs);
    },
    watchPaymentBatchConfirmed(onLogs) {
      return createWatcher(publicClient, address, "PaymentBatchConfirmed", onLogs);
    },
    watchPaymentBatchCreated(onLogs) {
      return createWatcher(publicClient, address, "PaymentBatchCreated", onLogs);
    },
    watchRefundClaimed(onLogs) {
      return createWatcher(publicClient, address, "RefundClaimed", onLogs);
    },
    watchFeesDisbursed(onLogs) {
      return createWatcher(publicClient, address, "FeesDisbursed", onLogs);
    },
    watchWithdrawalWithFeeSuccessful(onLogs) {
      return createWatcher(publicClient, address, "WithdrawalWithFeeSuccessful", onLogs);
    },
    watchNonGoalLineItemsClaimed(onLogs) {
      return createWatcher(publicClient, address, "NonGoalLineItemsClaimed", onLogs);
    },
    watchExpiredFundsClaimed(onLogs) {
      return createWatcher(publicClient, address, "ExpiredFundsClaimed", onLogs);
    },
    watchPaused(onLogs) {
      return createWatcher(publicClient, address, "Paused", onLogs);
    },
    watchUnpaused(onLogs) {
      return createWatcher(publicClient, address, "Unpaused", onLogs);
    },
    watchCancelled(onLogs) {
      return createWatcher(publicClient, address, "Cancelled", onLogs);
    },
  };
}
