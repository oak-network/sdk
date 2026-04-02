import { decodeEventLog } from "../../lib";
import type { Address, Hex, PublicClient } from "../../lib";
import { CAMPAIGN_INFO_FACTORY_ABI } from "./abi";
import type { DecodedEventLog, EventFilterOptions, EventWatchHandler } from "../../types/events";
import type { CampaignInfoFactoryEvents } from "./types";

type AbiEventName = Extract<(typeof CAMPAIGN_INFO_FACTORY_ABI)[number], { type: "event" }>["name"];

function decode(log: { topics: Hex[]; data: Hex }): DecodedEventLog {
  const decoded = decodeEventLog({ abi: CAMPAIGN_INFO_FACTORY_ABI, topics: log.topics as [Hex, ...Hex[]], data: log.data });
  return { eventName: decoded.eventName, args: decoded.args as Record<string, unknown> };
}

async function fetchEventLogs(
  publicClient: PublicClient,
  address: Address,
  eventName: AbiEventName,
  options?: EventFilterOptions,
): Promise<readonly DecodedEventLog[]> {
  const logs = await publicClient.getContractEvents({
    address, abi: CAMPAIGN_INFO_FACTORY_ABI, eventName,
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
    address, abi: CAMPAIGN_INFO_FACTORY_ABI, eventName,
    onLogs: (logs) => {
      onLogs(logs.map((log) => decode({ topics: [...log.topics] as Hex[], data: log.data })));
    },
  });
}

/**
 * Builds event helpers for a CampaignInfoFactory contract instance.
 * @param address - Deployed CampaignInfoFactory contract address
 * @param publicClient - Viem PublicClient used to call getLogs
 * @returns Event helpers bound to the given contract address
 */
export function createCampaignInfoFactoryEvents(
  address: Address,
  publicClient: PublicClient,
): CampaignInfoFactoryEvents {
  return {
    async getCampaignCreatedLogs(options) {
      return fetchEventLogs(publicClient, address, "CampaignInfoFactoryCampaignCreated", options);
    },
    async getCampaignInitializedLogs(options) {
      return fetchEventLogs(publicClient, address, "CampaignInfoFactoryCampaignInitialized", options);
    },
    async getOwnershipTransferredLogs(options) {
      return fetchEventLogs(publicClient, address, "OwnershipTransferred", options);
    },
    decodeLog(log) {
      return decode({ topics: [...log.topics] as Hex[], data: log.data });
    },
    watchCampaignCreated(onLogs) {
      return createWatcher(publicClient, address, "CampaignInfoFactoryCampaignCreated", onLogs);
    },
    watchCampaignInitialized(onLogs) {
      return createWatcher(publicClient, address, "CampaignInfoFactoryCampaignInitialized", onLogs);
    },
    watchOwnershipTransferred(onLogs) {
      return createWatcher(publicClient, address, "OwnershipTransferred", onLogs);
    },
  };
}
