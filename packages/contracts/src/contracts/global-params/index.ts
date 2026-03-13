import type { Address, PublicClient, WalletClient, Chain } from "../../lib";
import { createGlobalParamsReads } from "./reads";
import { createGlobalParamsWrites } from "./writes";
import { createGlobalParamsSimulate } from "./simulate";
import { createGlobalParamsEvents } from "./events";
import type { GlobalParamsEntity } from "./types";

/**
 * Creates a GlobalParams entity (reads, writes, simulate, events).
 * @param address - Deployed GlobalParams contract address
 * @param publicClient - Viem PublicClient for reads/simulate
 * @param walletClient - Viem WalletClient for writes
 * @param chain - Chain for writeContract/simulateContract
 * @returns GlobalParamsEntity
 */
export function createGlobalParamsEntity(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
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
