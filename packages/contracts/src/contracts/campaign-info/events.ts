import type { Address, PublicClient } from "../../lib";
import type { CampaignInfoEvents } from "./types";

// TODO: Add event filter factories (filterDeadlineUpdated, filterMintNFTForPledge), log decoder (decodeLog),
// and watcher factories using getLogs / watchEvent.

/**
 * Builds event helpers for a CampaignInfo contract instance.
 * @param _address - Deployed CampaignInfo contract address
 * @param _publicClient - Viem PublicClient used to call getLogs
 * @returns Event helpers bound to the given contract address
 */
export function createCampaignInfoEvents(
  _address: Address,
  _publicClient: PublicClient,
): CampaignInfoEvents {
  return {};
}
