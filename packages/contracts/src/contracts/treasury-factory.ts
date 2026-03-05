import type { Address, Hex, WalletClient, Chain } from "viem";
import { TREASURY_FACTORY_ABI } from "../abis/treasury-factory";
import type { TreasuryFactoryEntity } from "../types";

/**
 * Creates a TreasuryFactory entity with full implementation management and deploy.
 *
 * @param address - Deployed TreasuryFactory contract address
 * @param walletClient - Viem WalletClient for sending transactions
 * @param chain - Chain object (required for writeContract)
 * @returns TreasuryFactoryEntity
 *
 * @example
 * ```typescript
 * const tf = createTreasuryFactoryEntity(TF_ADDRESS, walletClient, chain);
 * const txHash = await tf.deploy(platformHash, infoAddress, implementationId);
 * ```
 */
export function createTreasuryFactoryEntity(
  address: Address,
  walletClient: WalletClient,
  chain: Chain,
): TreasuryFactoryEntity {
  const contract = { address, abi: TREASURY_FACTORY_ABI } as const;

  function requireAccount() {
    if (!walletClient.account) {
      throw new Error("Wallet client has no account; cannot send transaction.");
    }
    return walletClient.account;
  }

  return {
    async deploy(platformHash: Hex, infoAddress: Address, implementationId: bigint): Promise<Hex> {
      const account = requireAccount();
      return walletClient.writeContract({
        ...contract,
        chain,
        account,
        functionName: "deploy",
        args: [platformHash, infoAddress, implementationId],
      });
    },

    async registerTreasuryImplementation(platformHash: Hex, implementationId: bigint, implementation: Address): Promise<Hex> {
      const account = requireAccount();
      return walletClient.writeContract({
        ...contract,
        chain,
        account,
        functionName: "registerTreasuryImplementation",
        args: [platformHash, implementationId, implementation],
      });
    },

    async approveTreasuryImplementation(platformHash: Hex, implementationId: bigint): Promise<Hex> {
      const account = requireAccount();
      return walletClient.writeContract({
        ...contract,
        chain,
        account,
        functionName: "approveTreasuryImplementation",
        args: [platformHash, implementationId],
      });
    },

    async disapproveTreasuryImplementation(implementation: Address): Promise<Hex> {
      const account = requireAccount();
      return walletClient.writeContract({
        ...contract,
        chain,
        account,
        functionName: "disapproveTreasuryImplementation",
        args: [implementation],
      });
    },

    async removeTreasuryImplementation(platformHash: Hex, implementationId: bigint): Promise<Hex> {
      const account = requireAccount();
      return walletClient.writeContract({
        ...contract,
        chain,
        account,
        functionName: "removeTreasuryImplementation",
        args: [platformHash, implementationId],
      });
    },
  };
}
