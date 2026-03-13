import type { Address, PublicClient } from "../../lib";
import type { CampaignInfoFactoryEvents } from "./types";

/**
 * TODO: Add event filter factories, log decoder (decodeLog), and watcher factories
 * using getLogs / watchEvent. Currently stub.
 */

/**
 * Builds event helpers for a CampaignInfoFactory contract instance.
 * @param _address - Contract address (reserved for filter factories)
 * @param _publicClient - PublicClient (reserved for getLogs)
 * @returns CampaignInfoFactoryEvents
 */
export function createCampaignInfoFactoryEvents(
  _address: Address,
  _publicClient: PublicClient,
): CampaignInfoFactoryEvents {
  return {};
}
