import type { Address, PublicClient } from "../../lib";
import type { AllOrNothingEvents } from "./types";

// TODO: Add event filter factories (filterPledgeForAReward, filterWithdrawn), log decoder (decodeLog),
// and watcher factories using getLogs / watchEvent.

/**
 * Builds event helpers for an AllOrNothing treasury contract instance.
 * @param _address - Deployed AllOrNothing contract address
 * @param _publicClient - Viem PublicClient used to call getLogs
 * @returns Event helpers bound to the given contract address
 */
export function createAllOrNothingEvents(
  _address: Address,
  _publicClient: PublicClient,
): AllOrNothingEvents {
  return {};
}
