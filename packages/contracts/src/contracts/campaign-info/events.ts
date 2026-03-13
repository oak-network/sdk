import type { Address, PublicClient } from "../../lib";
import type { CampaignInfoEvents } from "./types";

/**
 * Builds event helpers for a CampaignInfo contract instance.
 *
 * TODO: Add event filter factories, log decoder (decodeLog), and watcher factories.
 *
 * @param _address - Contract address
 * @param _publicClient - Viem PublicClient for logs/watchers
 * @returns CampaignInfoEvents
 */
export function createCampaignInfoEvents(
  _address: Address,
  _publicClient: PublicClient,
): CampaignInfoEvents {
  return {};
}
