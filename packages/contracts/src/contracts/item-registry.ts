import type { Address, Hex, PublicClient, WalletClient, Chain } from "viem";
import { ITEM_REGISTRY_ABI } from "../abis/item-registry";
import type { ItemRegistryEntity, Item } from "../types";

/**
 * Creates an ItemRegistry entity with full read/write access.
 *
 * @param address - Deployed ItemRegistry contract address
 * @param publicClient - Viem PublicClient for on-chain reads
 * @param walletClient - Viem WalletClient for sending transactions
 * @param chain - Chain object (required for writeContract)
 * @returns ItemRegistryEntity
 *
 * @example
 * ```typescript
 * const ir = createItemRegistryEntity(IR_ADDRESS, publicClient, walletClient, chain);
 * const item = await ir.getItem(ownerAddress, itemId);
 * await ir.addItem(itemId, { actualWeight, height, width, length, category, declaredCurrency });
 * ```
 */
export function createItemRegistryEntity(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
  chain: Chain,
): ItemRegistryEntity {
  const contract = { address, abi: ITEM_REGISTRY_ABI } as const;

  function requireAccount() {
    if (!walletClient.account) {
      throw new Error("Wallet client has no account; cannot send transaction.");
    }
    return walletClient.account;
  }

  return {
    async getItem(owner: Address, itemId: Hex): Promise<Item> {
      const result = await publicClient.readContract({ ...contract, functionName: "getItem", args: [owner, itemId] });
      return result as unknown as Item;
    },

    async addItem(itemId: Hex, item: Item): Promise<Hex> {
      const account = requireAccount();
      return walletClient.writeContract({
        ...contract, chain, account, functionName: "addItem",
        args: [itemId, { actualWeight: item.actualWeight, height: item.height, width: item.width, length: item.length, category: item.category, declaredCurrency: item.declaredCurrency }],
      });
    },

    async addItemsBatch(itemIds: readonly Hex[], items: readonly Item[]): Promise<Hex> {
      const account = requireAccount();
      return walletClient.writeContract({
        ...contract, chain, account, functionName: "addItemsBatch",
        args: [[...itemIds], items.map((item) => ({ actualWeight: item.actualWeight, height: item.height, width: item.width, length: item.length, category: item.category, declaredCurrency: item.declaredCurrency }))],
      });
    },
  };
}
