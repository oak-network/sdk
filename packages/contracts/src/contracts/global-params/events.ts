import type { Address, PublicClient } from "../../lib";
import type { GlobalParamsEvents } from "./types";

/**
 * TODO: Add event filter factories (e.g. filterPlatformEnlisted), log decoder,
 * and watcher factories using getLogs / watchEvent. Currently stub.
 */

/**
 * Builds event helpers for a GlobalParams contract instance.
 * @param _address - Contract address (reserved for filter factories)
 * @param _publicClient - PublicClient (reserved for getLogs)
 * @returns GlobalParamsEvents
 */
export function createGlobalParamsEvents(
  _address: Address,
  _publicClient: PublicClient,
): GlobalParamsEvents {
  return {};
}
