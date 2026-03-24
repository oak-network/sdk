import type { Address, PublicClient } from "../../lib";
import type { KeepWhatsRaisedEvents } from "./types";

// TODO: Add event filter factories (filterPledgeMade, filterWithdrawn), log decoder (decodeLog),
// and watcher factories using getLogs / watchEvent.

/**
 * Builds event helpers for a KeepWhatsRaised treasury contract instance.
 * @param _address - Deployed KeepWhatsRaised contract address
 * @param _publicClient - Viem PublicClient used to call getLogs
 * @returns Event helpers bound to the given contract address
 */
export function createKeepWhatsRaisedEvents(
  _address: Address,
  _publicClient: PublicClient,
): KeepWhatsRaisedEvents {
  return {};
}
