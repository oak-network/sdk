import type { Address, PublicClient, WalletClient, Chain } from "../../lib";
import { createAllOrNothingReads } from "./reads";
import { createAllOrNothingWrites } from "./writes";
import { createAllOrNothingSimulate } from "./simulate";
import { createAllOrNothingEvents } from "./events";
import type { AllOrNothingTreasuryEntity } from "./types";

/**
 * Creates a fully composed AllOrNothing treasury entity combining reads, writes, simulate, and events.
 * @param address - Deployed AllOrNothing contract address
 * @param publicClient - Viem PublicClient used for reads and simulation
 * @param walletClient - Viem WalletClient used for writes; must have an account attached
 * @param chain - Chain passed to writeContract and simulateContract
 * @returns Composed entity exposing all AllOrNothing methods under a single object
 */
export function createAllOrNothingEntity(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient | null,
  chain: Chain,
): AllOrNothingTreasuryEntity {
  return {
    ...createAllOrNothingReads(address, publicClient),
    ...createAllOrNothingWrites(address, walletClient, chain),
    simulate: createAllOrNothingSimulate(address, publicClient, walletClient, chain),
    events: createAllOrNothingEvents(address, publicClient),
  };
}

export type { AllOrNothingTreasuryEntity } from "./types";
