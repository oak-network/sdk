import type { Address, Hex, PublicClient, WalletClient, Chain } from "../../lib";
import { TREASURY_FACTORY_ABI } from "./abi";
import { requireSigner, requireAccount } from "../../utils/account";
import { parseContractError, getRevertData, simulateWithErrorDecode } from "../../errors";
import type { TreasuryFactorySimulate } from "./types";


/**
 * Builds simulate methods for TreasuryFactory write calls.
 * Each method calls simulateContract against the current chain state and throws a typed
 * SDK error on revert, decoded via parseContractError.
 * @param address - Deployed TreasuryFactory contract address
 * @param publicClient - Viem PublicClient used to call simulateContract
 * @param walletClient - Viem WalletClient used to resolve the account for simulation
 * @param chain - Chain passed to simulateContract
 * @returns Simulation methods bound to the given contract address
 */
export function createTreasuryFactorySimulate(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient | null,
  chain: Chain,
): TreasuryFactorySimulate {
  const contract = { address, abi: TREASURY_FACTORY_ABI } as const;

  return {
    async deploy(platformHash: Hex, infoAddress: Address, implementationId: bigint): Promise<void> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "deploy",
          args: [platformHash, infoAddress, implementationId],
        }),
      );
    },
    async registerTreasuryImplementation(platformHash: Hex, implementationId: bigint, implementation: Address): Promise<void> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "registerTreasuryImplementation",
          args: [platformHash, implementationId, implementation],
        }),
      );
    },
    async approveTreasuryImplementation(platformHash: Hex, implementationId: bigint): Promise<void> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "approveTreasuryImplementation",
          args: [platformHash, implementationId],
        }),
      );
    },
    async disapproveTreasuryImplementation(implementation: Address): Promise<void> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "disapproveTreasuryImplementation",
          args: [implementation],
        }),
      );
    },
    async removeTreasuryImplementation(platformHash: Hex, implementationId: bigint): Promise<void> {
      const signer = requireSigner(walletClient); const account = requireAccount(signer);
      await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "removeTreasuryImplementation",
          args: [platformHash, implementationId],
        }),
      );
    },
  };
}
