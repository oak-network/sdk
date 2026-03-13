import type { Address, PublicClient } from "../../lib";
import type { GlobalParamsEvents } from "./types";

// TODO: Add event filter factories (filterPlatformEnlisted, filterPlatformDelisted), log decoder (decodeLog),
// and watcher factories using getLogs / watchEvent.

/**
 * Builds event helpers for a GlobalParams contract instance.
 * @param _address - Deployed GlobalParams contract address
 * @param _publicClient - Viem PublicClient used to call getLogs
 * @returns Event helpers bound to the given contract address
 */
export function createGlobalParamsEvents(
  _address: Address,
  _publicClient: PublicClient,
): GlobalParamsEvents {
  return {};
}
