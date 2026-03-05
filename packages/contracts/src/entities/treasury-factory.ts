import type { Address } from "viem";
import { TREASURY_FACTORY_ABI } from "../abis/treasury-factory.js";

/**
 * Returns a typed contract config for TreasuryFactory.
 *
 * @example
 * const tf = treasuryFactoryContract('0x...');
 * const hash = await walletClient.writeContract({ ...tf, functionName: 'deploy', args: [platformHash, infoAddr, implId] });
 */
export function treasuryFactoryContract(address: Address) {
  return { address, abi: TREASURY_FACTORY_ABI } as const;
}

export type TreasuryFactoryContractConfig = ReturnType<typeof treasuryFactoryContract>;
