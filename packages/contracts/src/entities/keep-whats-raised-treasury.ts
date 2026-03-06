import type { Address } from "viem";
import { KEEP_WHATS_RAISED_ABI } from "../abis/keep-whats-raised.js";

/**
 * Returns a typed contract config for KeepWhatsRaised treasury.
 *
 * @example
 * const kwr = keepWhatsRaisedContract('0x...');
 * const raised = await publicClient.readContract({ ...kwr, functionName: 'getRaisedAmount' });
 */
export function keepWhatsRaisedContract(address: Address) {
  return { address, abi: KEEP_WHATS_RAISED_ABI } as const;
}

export type KeepWhatsRaisedContractConfig = ReturnType<typeof keepWhatsRaisedContract>;
