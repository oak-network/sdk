import type { Address, PublicClient, WalletClient, Chain } from "../../lib";
import { createTreasuryFactoryReads } from "./reads";
import { createTreasuryFactoryWrites } from "./writes";
import { createTreasuryFactorySimulate } from "./simulate";
import { createTreasuryFactoryEvents } from "./events";
import type { TreasuryFactoryEntity } from "./types";

/**
 * Creates a fully composed TreasuryFactory entity combining reads, writes, simulate, and events.
 * @param address - Deployed TreasuryFactory contract address
 * @param publicClient - Viem PublicClient used for reads and simulation
 * @param walletClient - Viem WalletClient used for writes; must have an account attached
 * @param chain - Chain passed to writeContract and simulateContract
 * @returns Composed entity exposing all TreasuryFactory methods under a single object
 */
export function createTreasuryFactoryEntity(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
  chain: Chain,
): TreasuryFactoryEntity {
  return {
    ...createTreasuryFactoryReads(address, publicClient),
    ...createTreasuryFactoryWrites(address, walletClient, chain),
    simulate: createTreasuryFactorySimulate(address, publicClient, walletClient, chain),
    events: createTreasuryFactoryEvents(address, publicClient),
  };
}

export type { TreasuryFactoryEntity } from "./types";
