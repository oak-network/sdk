import type { Address, PublicClient, WalletClient, Chain } from "../../lib";
import { createItemRegistryReads } from "./reads";
import { createItemRegistryWrites } from "./writes";
import { createItemRegistrySimulate } from "./simulate";
import { createItemRegistryEvents } from "./events";
import type { ItemRegistryEntity } from "./types";

/**
 * Creates a fully composed ItemRegistry entity combining reads, writes, simulate, and events.
 * @param address - Deployed ItemRegistry contract address
 * @param publicClient - Viem PublicClient used for reads and simulation
 * @param walletClient - Viem WalletClient used for writes; must have an account attached
 * @param chain - Chain passed to writeContract and simulateContract
 * @returns Composed entity exposing all ItemRegistry methods under a single object
 */
export function createItemRegistryEntity(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient | null,
  chain: Chain,
): ItemRegistryEntity {
  return {
    ...createItemRegistryReads(address, publicClient),
    ...createItemRegistryWrites(address, walletClient, chain),
    simulate: createItemRegistrySimulate(address, publicClient, walletClient, chain),
    events: createItemRegistryEvents(address, publicClient),
  };
}

export type { ItemRegistryEntity } from "./types";
