import type { Address, PublicClient, WalletClient, Chain } from "../../lib";
import { createKeepWhatsRaisedReads } from "./reads";
import { createKeepWhatsRaisedWrites } from "./writes";
import { createKeepWhatsRaisedSimulate } from "./simulate";
import { createKeepWhatsRaisedEvents } from "./events";
import type { KeepWhatsRaisedTreasuryEntity } from "./types";

/**
 * Creates a fully composed KeepWhatsRaised treasury entity combining reads, writes, simulate, and events.
 * @param address - Deployed KeepWhatsRaised contract address
 * @param publicClient - Viem PublicClient used for reads and simulation
 * @param walletClient - Viem WalletClient used for writes; must have an account attached
 * @param chain - Chain passed to writeContract and simulateContract
 * @returns Composed entity exposing all KeepWhatsRaised methods under a single object
 */
export function createKeepWhatsRaisedEntity(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
  chain: Chain,
): KeepWhatsRaisedTreasuryEntity {
  return {
    ...createKeepWhatsRaisedReads(address, publicClient),
    ...createKeepWhatsRaisedWrites(address, walletClient, chain),
    simulate: createKeepWhatsRaisedSimulate(address, publicClient, walletClient, chain),
    events: createKeepWhatsRaisedEvents(address, publicClient),
  };
}

export type { KeepWhatsRaisedTreasuryEntity } from "./types";
