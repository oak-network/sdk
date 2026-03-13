import type { Address, PublicClient, WalletClient, Chain } from "../../lib";
import { createAllOrNothingReads } from "./reads";
import { createAllOrNothingWrites } from "./writes";
import { createAllOrNothingSimulate } from "./simulate";
import { createAllOrNothingEvents } from "./events";
import type { AllOrNothingTreasuryEntity } from "./types";

/**
 * Creates an AllOrNothing treasury entity (reads, writes, simulate, events).
 * @param address - Deployed AllOrNothing contract address
 * @param publicClient - Viem PublicClient for reads/simulate
 * @param walletClient - Viem WalletClient for writes
 * @param chain - Chain for writeContract/simulateContract
 * @returns AllOrNothingTreasuryEntity
 */
export function createAllOrNothingEntity(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
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
