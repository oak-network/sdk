import type { Address } from "viem";
import { ITEM_REGISTRY_ABI } from "../abis/item-registry.js";

/**
 * Returns a typed contract config for ItemRegistry.
 *
 * @example
 * const ir = itemRegistryContract('0x...');
 * const item = await publicClient.readContract({ ...ir, functionName: 'getItem', args: [owner, itemId] });
 */
export function itemRegistryContract(address: Address) {
  return { address, abi: ITEM_REGISTRY_ABI } as const;
}

export type ItemRegistryContractConfig = ReturnType<typeof itemRegistryContract>;
