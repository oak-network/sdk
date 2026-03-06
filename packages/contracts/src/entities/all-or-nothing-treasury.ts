import type { Address } from "viem";
import { ALL_OR_NOTHING_ABI } from "../abis/all-or-nothing.js";

/**
 * Returns a typed contract config for AllOrNothing treasury.
 *
 * @example
 * const aon = allOrNothingContract('0x...');
 * const raised = await publicClient.readContract({ ...aon, functionName: 'getRaisedAmount' });
 */
export function allOrNothingContract(address: Address) {
  return { address, abi: ALL_OR_NOTHING_ABI } as const;
}

export type AllOrNothingContractConfig = ReturnType<typeof allOrNothingContract>;
