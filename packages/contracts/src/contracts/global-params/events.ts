import { decodeEventLog } from "../../lib";
import type { Address, Hex, PublicClient } from "../../lib";
import { GLOBAL_PARAMS_ABI } from "./abi";
import type { DecodedEventLog, EventFilterOptions, EventWatchHandler } from "../../types/events";
import type { GlobalParamsEvents } from "./types";

type AbiEventName = Extract<(typeof GLOBAL_PARAMS_ABI)[number], { type: "event" }>["name"];

function decode(log: { topics: Hex[]; data: Hex }): DecodedEventLog {
  const decoded = decodeEventLog({ abi: GLOBAL_PARAMS_ABI, topics: log.topics as [Hex, ...Hex[]], data: log.data });
  return { eventName: decoded.eventName, args: decoded.args as Record<string, unknown> };
}

async function fetchEventLogs(
  publicClient: PublicClient,
  address: Address,
  eventName: AbiEventName,
  options?: EventFilterOptions,
): Promise<readonly DecodedEventLog[]> {
  const logs = await publicClient.getContractEvents({
    address, abi: GLOBAL_PARAMS_ABI, eventName,
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
    address, abi: GLOBAL_PARAMS_ABI, eventName,
    onLogs: (logs) => {
      onLogs(logs.map((log) => decode({ topics: [...log.topics] as Hex[], data: log.data })));
    },
  });
}

/**
 * Builds event helpers for a GlobalParams contract instance.
 * @param address - Deployed GlobalParams contract address
 * @param publicClient - Viem PublicClient used to call getLogs
 * @returns Event helpers bound to the given contract address
 */
export function createGlobalParamsEvents(
  address: Address,
  publicClient: PublicClient,
): GlobalParamsEvents {
  return {
    async getPlatformEnlistedLogs(options) {
      return fetchEventLogs(publicClient, address, "PlatformEnlisted", options);
    },
    async getPlatformDelistedLogs(options) {
      return fetchEventLogs(publicClient, address, "PlatformDelisted", options);
    },
    async getPlatformAdminAddressUpdatedLogs(options) {
      return fetchEventLogs(publicClient, address, "PlatformAdminAddressUpdated", options);
    },
    async getPlatformDataAddedLogs(options) {
      return fetchEventLogs(publicClient, address, "PlatformDataAdded", options);
    },
    async getPlatformDataRemovedLogs(options) {
      return fetchEventLogs(publicClient, address, "PlatformDataRemoved", options);
    },
    async getPlatformAdapterSetLogs(options) {
      return fetchEventLogs(publicClient, address, "PlatformAdapterSet", options);
    },
    async getPlatformClaimDelayUpdatedLogs(options) {
      return fetchEventLogs(publicClient, address, "PlatformClaimDelayUpdated", options);
    },
    async getProtocolAdminAddressUpdatedLogs(options) {
      return fetchEventLogs(publicClient, address, "ProtocolAdminAddressUpdated", options);
    },
    async getProtocolFeePercentUpdatedLogs(options) {
      return fetchEventLogs(publicClient, address, "ProtocolFeePercentUpdated", options);
    },
    async getTokenAddedToCurrencyLogs(options) {
      return fetchEventLogs(publicClient, address, "TokenAddedToCurrency", options);
    },
    async getTokenRemovedFromCurrencyLogs(options) {
      return fetchEventLogs(publicClient, address, "TokenRemovedFromCurrency", options);
    },
    async getOwnershipTransferredLogs(options) {
      return fetchEventLogs(publicClient, address, "OwnershipTransferred", options);
    },
    async getPausedLogs(options) {
      return fetchEventLogs(publicClient, address, "Paused", options);
    },
    async getUnpausedLogs(options) {
      return fetchEventLogs(publicClient, address, "Unpaused", options);
    },
    decodeLog(log) {
      return decode({ topics: [...log.topics] as Hex[], data: log.data });
    },
    watchPlatformEnlisted(onLogs) {
      return createWatcher(publicClient, address, "PlatformEnlisted", onLogs);
    },
    watchPlatformDelisted(onLogs) {
      return createWatcher(publicClient, address, "PlatformDelisted", onLogs);
    },
    watchPlatformAdminAddressUpdated(onLogs) {
      return createWatcher(publicClient, address, "PlatformAdminAddressUpdated", onLogs);
    },
    watchPlatformDataAdded(onLogs) {
      return createWatcher(publicClient, address, "PlatformDataAdded", onLogs);
    },
    watchPlatformDataRemoved(onLogs) {
      return createWatcher(publicClient, address, "PlatformDataRemoved", onLogs);
    },
    watchPlatformAdapterSet(onLogs) {
      return createWatcher(publicClient, address, "PlatformAdapterSet", onLogs);
    },
    watchPlatformClaimDelayUpdated(onLogs) {
      return createWatcher(publicClient, address, "PlatformClaimDelayUpdated", onLogs);
    },
    watchProtocolAdminAddressUpdated(onLogs) {
      return createWatcher(publicClient, address, "ProtocolAdminAddressUpdated", onLogs);
    },
    watchProtocolFeePercentUpdated(onLogs) {
      return createWatcher(publicClient, address, "ProtocolFeePercentUpdated", onLogs);
    },
    watchTokenAddedToCurrency(onLogs) {
      return createWatcher(publicClient, address, "TokenAddedToCurrency", onLogs);
    },
    watchTokenRemovedFromCurrency(onLogs) {
      return createWatcher(publicClient, address, "TokenRemovedFromCurrency", onLogs);
    },
    watchOwnershipTransferred(onLogs) {
      return createWatcher(publicClient, address, "OwnershipTransferred", onLogs);
    },
    watchPaused(onLogs) {
      return createWatcher(publicClient, address, "Paused", onLogs);
    },
    watchUnpaused(onLogs) {
      return createWatcher(publicClient, address, "Unpaused", onLogs);
    },
  };
}
