import type { Address, PublicClient } from "../../lib";
import type { TreasuryFactoryEvents } from "./types";

// TODO: Add event filter factories (filterTreasuryDeployed), log decoder (decodeLog),
// and watcher factories using getLogs / watchEvent.

/**
 * Builds event helpers for a TreasuryFactory contract instance.
 * @param _address - Deployed TreasuryFactory contract address
 * @param _publicClient - Viem PublicClient used to call getLogs
 * @returns Event helpers bound to the given contract address
 */
export function createTreasuryFactoryEvents(
  _address: Address,
  _publicClient: PublicClient,
): TreasuryFactoryEvents {
  return {};
}
