import type { Address, PublicClient } from "../../lib";
import type { TreasuryFactoryReads } from "./types";

/**
 * Builds read methods for a TreasuryFactory contract instance.
 * TreasuryFactory has no public read functions in the ABI; returns an empty object.
 * @param _address - Deployed TreasuryFactory contract address
 * @param _publicClient - Viem PublicClient (unused; reserved for future reads)
 * @returns Read methods bound to the given contract address
 */
export function createTreasuryFactoryReads(
  _address: Address,
  _publicClient: PublicClient,
): TreasuryFactoryReads {
  return {};
}
