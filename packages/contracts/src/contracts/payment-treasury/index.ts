import type { Address, PublicClient, WalletClient, Chain } from "../../lib";
import { createPaymentTreasuryReads } from "./reads";
import { createPaymentTreasuryWrites } from "./writes";
import { createPaymentTreasurySimulate } from "./simulate";
import { createPaymentTreasuryEvents } from "./events";
import type { PaymentTreasuryEntity } from "./types";

/**
 * Creates a fully composed PaymentTreasury entity combining reads, writes, simulate, and events.
 * Compatible with both PaymentTreasury and TimeConstrainedPaymentTreasury deployments.
 * @param address - Deployed PaymentTreasury or TimeConstrainedPaymentTreasury contract address
 * @param publicClient - Viem PublicClient used for reads and simulation
 * @param walletClient - Viem WalletClient used for writes; must have an account attached
 * @param chain - Chain passed to writeContract and simulateContract
 * @returns Composed entity exposing all PaymentTreasury methods under a single object
 */
export function createPaymentTreasuryEntity(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient | null,
  chain: Chain,
): PaymentTreasuryEntity {
  return {
    ...createPaymentTreasuryReads(address, publicClient),
    ...createPaymentTreasuryWrites(address, walletClient, chain),
    simulate: createPaymentTreasurySimulate(address, publicClient, walletClient, chain),
    events: createPaymentTreasuryEvents(address, publicClient),
  };
}

export type { PaymentTreasuryEntity } from "./types";
