import type { Address } from "viem";
import { GLOBAL_PARAMS_ABI } from "../abis/global-params.js";

/**
 * Returns a typed contract config for GlobalParams that can be spread into
 * viem's readContract, writeContract, simulateContract, etc.
 *
 * @example
 * const gp = globalParamsContract('0x...');
 * const fee = await publicClient.readContract({ ...gp, functionName: 'getProtocolFeePercent' });
 */
export function globalParamsContract(address: Address) {
  return { address, abi: GLOBAL_PARAMS_ABI } as const;
}

export type GlobalParamsContractConfig = ReturnType<typeof globalParamsContract>;
