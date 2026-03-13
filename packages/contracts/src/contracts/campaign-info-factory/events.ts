import type { Address, PublicClient } from "../../lib";
import type { CampaignInfoFactoryEvents } from "./types";

// TODO: Add event filter factories (filterCampaignCreated), log decoder (decodeLog),
// and watcher factories using getLogs / watchEvent.

/**
 * Builds event helpers for a CampaignInfoFactory contract instance.
 * @param _address - Deployed CampaignInfoFactory contract address
 * @param _publicClient - Viem PublicClient used to call getLogs
 * @returns Event helpers bound to the given contract address
 */
export function createCampaignInfoFactoryEvents(
  _address: Address,
  _publicClient: PublicClient,
): CampaignInfoFactoryEvents {
  return {};
}
