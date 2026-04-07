import { decodeEventLog } from "../../lib";
import type { Address, Hex, PublicClient } from "../../lib";
import { ITEM_REGISTRY_ABI } from "./abi";
import type { DecodedEventLog, EventFilterOptions, EventWatchHandler } from "../../types/events";
import type { ItemRegistryEvents } from "./types";

type AbiEventName = Extract<(typeof ITEM_REGISTRY_ABI)[number], { type: "event" }>["name"];

function decode(log: { topics: Hex[]; data: Hex }): DecodedEventLog {
  const decoded = decodeEventLog({ abi: ITEM_REGISTRY_ABI, topics: log.topics as [Hex, ...Hex[]], data: log.data });
  return { eventName: decoded.eventName, args: decoded.args as Record<string, unknown> };
}

async function fetchEventLogs(
  publicClient: PublicClient,
  address: Address,
  eventName: AbiEventName,
  options?: EventFilterOptions,
): Promise<readonly DecodedEventLog[]> {
  const logs = await publicClient.getContractEvents({
    address, abi: ITEM_REGISTRY_ABI, eventName,
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
    address, abi: ITEM_REGISTRY_ABI, eventName,
    onLogs: (logs) => {
      onLogs(logs.map((log) => decode({ topics: [...log.topics] as Hex[], data: log.data })));
    },
  });
}

/**
 * Builds event helpers for an ItemRegistry contract instance.
 * @param address - Deployed ItemRegistry contract address
 * @param publicClient - Viem PublicClient used to call getLogs
 * @returns Event helpers bound to the given contract address
 */
export function createItemRegistryEvents(
  address: Address,
  publicClient: PublicClient,
): ItemRegistryEvents {
  return {
    async getItemAddedLogs(options) {
      return fetchEventLogs(publicClient, address, "ItemAdded", options);
    },
    decodeLog(log) {
      return decode({ topics: [...log.topics] as Hex[], data: log.data });
    },
    watchItemAdded(onLogs) {
      return createWatcher(publicClient, address, "ItemAdded", onLogs);
    },
  };
}
