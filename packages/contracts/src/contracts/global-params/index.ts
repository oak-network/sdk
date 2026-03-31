import type { Address, PublicClient, WalletClient, Chain } from "../../lib";
import { createGlobalParamsReads } from "./reads";
import { createGlobalParamsWrites } from "./writes";
import { createGlobalParamsSimulate } from "./simulate";
import { createGlobalParamsEvents } from "./events";
import type { GlobalParamsEntity } from "./types";

/**
 * Creates a fully composed GlobalParams entity combining reads, writes, simulate, and events.
 * @param address - Deployed GlobalParams contract address
 * @param publicClient - Viem PublicClient used for reads and simulation
 * @param walletClient - Viem WalletClient used for writes; must have an account attached
 * @param chain - Chain passed to writeContract and simulateContract
 * @returns Composed entity exposing all GlobalParams methods under a single object
 */
export function createGlobalParamsEntity(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient | null,
  chain: Chain,
): GlobalParamsEntity {
  return {
    ...createGlobalParamsReads(address, publicClient),
    ...createGlobalParamsWrites(address, walletClient, chain),
    simulate: createGlobalParamsSimulate(address, publicClient, walletClient, chain),
    events: createGlobalParamsEvents(address, publicClient),
  };
}

export type { GlobalParamsEntity } from "./types";
