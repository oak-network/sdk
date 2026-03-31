import type { Address, PublicClient } from "../../lib";
import type { PaymentTreasuryEvents } from "./types";

// TODO: Add event filter factories (filterPaymentMade), log decoder (decodeLog),
// and watcher factories using getLogs / watchEvent.

/**
 * Builds event helpers for a PaymentTreasury contract instance.
 * @param _address - Deployed PaymentTreasury contract address
 * @param _publicClient - Viem PublicClient used to call getLogs
 * @returns Event helpers bound to the given contract address
 */
export function createPaymentTreasuryEvents(
  _address: Address,
  _publicClient: PublicClient,
): PaymentTreasuryEvents {
  return {};
}
