import { decodeEventLog } from "../../lib";
import type { Address, Hex, PublicClient } from "../../lib";
import { TREASURY_FACTORY_ABI } from "./abi";
import type { DecodedEventLog, EventFilterOptions, EventWatchHandler } from "../../types/events";
import type { TreasuryFactoryEvents } from "./types";

type AbiEventName = Extract<(typeof TREASURY_FACTORY_ABI)[number], { type: "event" }>["name"];

function decode(log: { topics: Hex[]; data: Hex }): DecodedEventLog {
  const decoded = decodeEventLog({ abi: TREASURY_FACTORY_ABI, topics: log.topics as [Hex, ...Hex[]], data: log.data });
  return { eventName: decoded.eventName, args: decoded.args as Record<string, unknown> };
}

async function fetchEventLogs(
  publicClient: PublicClient,
  address: Address,
  eventName: AbiEventName,
  options?: EventFilterOptions,
): Promise<readonly DecodedEventLog[]> {
  const logs = await publicClient.getContractEvents({
    address, abi: TREASURY_FACTORY_ABI, eventName,
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
    address, abi: TREASURY_FACTORY_ABI, eventName,
    onLogs: (logs) => {
      onLogs(logs.map((log) => decode({ topics: [...log.topics] as Hex[], data: log.data })));
    },
  });
}

/**
 * Builds event helpers for a TreasuryFactory contract instance.
 * @param address - Deployed TreasuryFactory contract address
 * @param publicClient - Viem PublicClient used to call getLogs
 * @returns Event helpers bound to the given contract address
 */
export function createTreasuryFactoryEvents(
  address: Address,
  publicClient: PublicClient,
): TreasuryFactoryEvents {
  return {
    async getTreasuryDeployedLogs(options) {
      return fetchEventLogs(publicClient, address, "TreasuryFactoryTreasuryDeployed", options);
    },
    async getImplementationRegisteredLogs(options) {
      return fetchEventLogs(publicClient, address, "TreasuryImplementationRegistered", options);
    },
    async getImplementationRemovedLogs(options) {
      return fetchEventLogs(publicClient, address, "TreasuryImplementationRemoved", options);
    },
    async getImplementationApprovalLogs(options) {
      return fetchEventLogs(publicClient, address, "TreasuryImplementationApproval", options);
    },
    decodeLog(log) {
      return decode({ topics: [...log.topics] as Hex[], data: log.data });
    },
    watchTreasuryDeployed(onLogs) {
      return createWatcher(publicClient, address, "TreasuryFactoryTreasuryDeployed", onLogs);
    },
    watchImplementationRegistered(onLogs) {
      return createWatcher(publicClient, address, "TreasuryImplementationRegistered", onLogs);
    },
    watchImplementationRemoved(onLogs) {
      return createWatcher(publicClient, address, "TreasuryImplementationRemoved", onLogs);
    },
    watchImplementationApproval(onLogs) {
      return createWatcher(publicClient, address, "TreasuryImplementationApproval", onLogs);
    },
  };
}
