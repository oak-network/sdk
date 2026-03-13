import type { Address, Hex, WalletClient, Chain } from "../../lib";
import { TREASURY_FACTORY_ABI } from "./abi";
import { requireAccount } from "../../utils/account";
import type { TreasuryFactoryWrites } from "./types";

/**
 * Builds write methods for a TreasuryFactory contract instance.
 * @param address - Deployed TreasuryFactory contract address
 * @param walletClient - Viem WalletClient used to call writeContract; must have an account attached
 * @param chain - Chain passed to writeContract for EIP-1559 and replay protection
 * @returns Write methods bound to the given contract address
 */
export function createTreasuryFactoryWrites(
  address: Address,
  walletClient: WalletClient,
  chain: Chain,
): TreasuryFactoryWrites {
  const contract = { address, abi: TREASURY_FACTORY_ABI } as const;

  return {
    async deploy(platformHash: Hex, infoAddress: Address, implementationId: bigint): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "deploy", args: [platformHash, infoAddress, implementationId] });
    },
    async registerTreasuryImplementation(platformHash: Hex, implementationId: bigint, implementation: Address): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "registerTreasuryImplementation", args: [platformHash, implementationId, implementation] });
    },
    async approveTreasuryImplementation(platformHash: Hex, implementationId: bigint): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "approveTreasuryImplementation", args: [platformHash, implementationId] });
    },
    async disapproveTreasuryImplementation(implementation: Address): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "disapproveTreasuryImplementation", args: [implementation] });
    },
    async removeTreasuryImplementation(platformHash: Hex, implementationId: bigint): Promise<Hex> {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "removeTreasuryImplementation", args: [platformHash, implementationId] });
    },
  };
}
