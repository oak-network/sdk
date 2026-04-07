import { decodeEventLog } from "../../lib";
import type { Address, Hex, PublicClient } from "../../lib";
import { CAMPAIGN_INFO_ABI } from "./abi";
import type { DecodedEventLog, EventFilterOptions, EventWatchHandler } from "../../types/events";
import type { CampaignInfoEvents } from "./types";

type AbiEventName = Extract<(typeof CAMPAIGN_INFO_ABI)[number], { type: "event" }>["name"];

function decode(log: { topics: Hex[]; data: Hex }): DecodedEventLog {
  const decoded = decodeEventLog({ abi: CAMPAIGN_INFO_ABI, topics: log.topics as [Hex, ...Hex[]], data: log.data });
  return { eventName: decoded.eventName, args: decoded.args as Record<string, unknown> };
}

async function fetchEventLogs(
  publicClient: PublicClient,
  address: Address,
  eventName: AbiEventName,
  options?: EventFilterOptions,
): Promise<readonly DecodedEventLog[]> {
  const logs = await publicClient.getContractEvents({
    address, abi: CAMPAIGN_INFO_ABI, eventName,
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
    address, abi: CAMPAIGN_INFO_ABI, eventName,
    onLogs: (logs) => {
      onLogs(logs.map((log) => decode({ topics: [...log.topics] as Hex[], data: log.data })));
    },
  });
}

/**
 * Builds event helpers for a CampaignInfo contract instance.
 * @param address - Deployed CampaignInfo contract address
 * @param publicClient - Viem PublicClient used to call getLogs
 * @returns Event helpers bound to the given contract address
 */
export function createCampaignInfoEvents(
  address: Address,
  publicClient: PublicClient,
): CampaignInfoEvents {
  return {
    async getDeadlineUpdatedLogs(options) {
      return fetchEventLogs(publicClient, address, "CampaignInfoDeadlineUpdated", options);
    },
    async getGoalAmountUpdatedLogs(options) {
      return fetchEventLogs(publicClient, address, "CampaignInfoGoalAmountUpdated", options);
    },
    async getLaunchTimeUpdatedLogs(options) {
      return fetchEventLogs(publicClient, address, "CampaignInfoLaunchTimeUpdated", options);
    },
    async getPlatformInfoUpdatedLogs(options) {
      return fetchEventLogs(publicClient, address, "CampaignInfoPlatformInfoUpdated", options);
    },
    async getSelectedPlatformUpdatedLogs(options) {
      return fetchEventLogs(publicClient, address, "CampaignInfoSelectedPlatformUpdated", options);
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
    watchDeadlineUpdated(onLogs) {
      return createWatcher(publicClient, address, "CampaignInfoDeadlineUpdated", onLogs);
    },
    watchGoalAmountUpdated(onLogs) {
      return createWatcher(publicClient, address, "CampaignInfoGoalAmountUpdated", onLogs);
    },
    watchLaunchTimeUpdated(onLogs) {
      return createWatcher(publicClient, address, "CampaignInfoLaunchTimeUpdated", onLogs);
    },
    watchPlatformInfoUpdated(onLogs) {
      return createWatcher(publicClient, address, "CampaignInfoPlatformInfoUpdated", onLogs);
    },
    watchSelectedPlatformUpdated(onLogs) {
      return createWatcher(publicClient, address, "CampaignInfoSelectedPlatformUpdated", onLogs);
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
