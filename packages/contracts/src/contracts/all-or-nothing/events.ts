import type { Address, PublicClient } from "../../lib";
import type { AllOrNothingEvents } from "./types";

/**
 * TODO: Add event filter factories, log decoder (decodeLog), and watcher factories
 * using getLogs / watchEvent. Currently stub.
 */

/**
 * Builds event helpers for an AllOrNothing treasury contract instance.
 * @param _address - Contract address (reserved for filter factories)
 * @param _publicClient - PublicClient (reserved for getLogs)
 * @returns AllOrNothingEvents
 */
export function createAllOrNothingEvents(
  _address: Address,
  _publicClient: PublicClient,
): AllOrNothingEvents {
  return {};
}
