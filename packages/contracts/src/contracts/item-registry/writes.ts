import type { Address, Hex, WalletClient, Chain } from "../../lib";
import { ITEM_REGISTRY_ABI } from "./abi";
import { requireAccount } from "../../utils/account";
import type { ItemRegistryWrites } from "./types";
import type { Item } from "../../types/structs";

/**
 * Builds write methods for an ItemRegistry contract instance.
 * @param address - Deployed ItemRegistry contract address
 * @param walletClient - Viem WalletClient used to call writeContract; must have an account attached
 * @param chain - Chain passed to writeContract for EIP-1559 and replay protection
 * @returns Write methods bound to the given contract address
 */
export function createItemRegistryWrites(
  address: Address,
  walletClient: WalletClient,
  chain: Chain,
): ItemRegistryWrites {
  const contract = { address, abi: ITEM_REGISTRY_ABI } as const;

  return {
    async addItem(itemId: Hex, item: Item): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({
        ...contract,
        chain,
        account,
        functionName: "addItem",
        args: [
          itemId,
          {
            actualWeight: item.actualWeight,
            height: item.height,
            width: item.width,
            length: item.length,
            category: item.category,
            declaredCurrency: item.declaredCurrency,
          },
        ],
      });
    },
    async addItemsBatch(itemIds: readonly Hex[], items: readonly Item[]): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({
        ...contract,
        chain,
        account,
        functionName: "addItemsBatch",
        args: [
          [...itemIds],
          items.map((item) => ({
            actualWeight: item.actualWeight,
            height: item.height,
            width: item.width,
            length: item.length,
            category: item.category,
            declaredCurrency: item.declaredCurrency,
          })),
        ],
      });
    },
  };
}
