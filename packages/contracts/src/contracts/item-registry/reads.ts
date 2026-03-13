import type { Address, Hex, PublicClient } from "../../lib";
import { ITEM_REGISTRY_ABI } from "./abi";
import type { ItemRegistryReads } from "./types";
import type { Item } from "../../types/structs";

/**
 * Builds read methods for an ItemRegistry contract instance.
 * @param address - Deployed ItemRegistry contract address
 * @param publicClient - Viem PublicClient used to call readContract
 * @returns Read methods bound to the given contract address
 */
export function createItemRegistryReads(
  address: Address,
  publicClient: PublicClient,
): ItemRegistryReads {
  const contract = { address, abi: ITEM_REGISTRY_ABI } as const;

  return {
    async getItem(owner: Address, itemId: Hex): Promise<Item> {
      const result = await publicClient.readContract({
        ...contract,
        functionName: "getItem",
        args: [owner, itemId],
      });
      return result as unknown as Item;
    },
  };
}
