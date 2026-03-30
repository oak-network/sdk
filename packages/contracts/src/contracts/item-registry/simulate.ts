import type { Address, Hex, PublicClient, WalletClient, Chain } from "../../lib";
import { ITEM_REGISTRY_ABI } from "./abi";
import { requireSigner, requireAccount } from "../../utils/account";
import { simulateWithErrorDecode } from "../../errors";
import type { ItemRegistrySimulate } from "./types";
import type { Item } from "../../types/structs";

/**
 * Builds simulate methods for ItemRegistry write calls.
 * Each method calls simulateContract against the current chain state and throws a typed
 * SDK error on revert, decoded via parseContractError.
 * @param address - Deployed ItemRegistry contract address
 * @param publicClient - Viem PublicClient used to call simulateContract
 * @param walletClient - Viem WalletClient used to resolve the account for simulation
 * @param chain - Chain passed to simulateContract
 * @returns Simulation methods bound to the given contract address
 */
export function createItemRegistrySimulate(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient | null,
  chain: Chain,
): ItemRegistrySimulate {
  const contract = { address, abi: ITEM_REGISTRY_ABI } as const;

  return {
    async addItem(itemId: Hex, item: Item): Promise<void> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
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
        }),
      );
    },
    async addItemsBatch(itemIds: readonly Hex[], items: readonly Item[]): Promise<void> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
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
        }),
      );
    },
  };
}
