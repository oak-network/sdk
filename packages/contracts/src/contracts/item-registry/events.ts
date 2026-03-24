import type { Address, PublicClient } from "../../lib";
import type { ItemRegistryEvents } from "./types";

// TODO: Add event filter factories (filterItemAdded), log decoder (decodeLog),
// and watcher factories using getLogs / watchEvent.

/**
 * Builds event helpers for an ItemRegistry contract instance.
 * @param _address - Deployed ItemRegistry contract address
 * @param _publicClient - Viem PublicClient used to call getLogs
 * @returns Event helpers bound to the given contract address
 */
export function createItemRegistryEvents(
  _address: Address,
  _publicClient: PublicClient,
): ItemRegistryEvents {
  return {};
}
