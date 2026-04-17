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
      // viem returns Solidity structs as readonly tuple objects whose type doesn't
      // unify with the SDK's named interface; the double-cast bridges the gap safely
      // because the ABI field names and types are identical to Item.
      return result as unknown as Item;
    },
  };
}
