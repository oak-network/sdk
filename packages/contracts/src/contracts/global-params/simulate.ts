import type { Address, Hex, PublicClient, WalletClient, Chain } from "../../lib";
import { GLOBAL_PARAMS_ABI } from "./abi";
import { requireSigner, requireAccount } from "../../utils/account";
import { simulateWithErrorDecode, toSimulationResult } from "../../errors";
import type { GlobalParamsSimulate } from "./types";
import type { CallSignerOptions } from "../../client/types";

/**
 * Builds simulate methods for GlobalParams write calls.
 * Each method calls simulateContract against the current chain state and returns a
 * SimulationResult, or throws a typed SDK error on revert (decoded via simulateWithErrorDecode).
 * @param address - Deployed GlobalParams contract address
 * @param publicClient - Viem PublicClient used to call simulateContract
 * @param walletClient - Viem WalletClient used to resolve the account for simulation
 * @param chain - Chain passed to simulateContract
 * @returns Simulation methods bound to the given contract address
 */
export function createGlobalParamsSimulate(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient | null,
  chain: Chain,
): GlobalParamsSimulate {
  const contract = { address, abi: GLOBAL_PARAMS_ABI } as const;

  return {
    async enlistPlatform(platformHash: Hex, platformAdminAddress: Address, platformFeePercent: bigint, platformAdapter: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "enlistPlatform",
          args: [platformHash, platformAdminAddress, platformFeePercent, platformAdapter],
        }),
      );
      return toSimulationResult(response);
    },
    async delistPlatform(platformBytes: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "delistPlatform",
          args: [platformBytes],
        }),
      );
      return toSimulationResult(response);
    },
    async updatePlatformAdminAddress(platformBytes: Hex, platformAdminAddress: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "updatePlatformAdminAddress",
          args: [platformBytes, platformAdminAddress],
        }),
      );
      return toSimulationResult(response);
    },
    async updatePlatformClaimDelay(platformBytes: Hex, claimDelay: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "updatePlatformClaimDelay",
          args: [platformBytes, claimDelay],
        }),
      );
      return toSimulationResult(response);
    },
    async updateProtocolAdminAddress(protocolAdminAddress: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "updateProtocolAdminAddress",
          args: [protocolAdminAddress],
        }),
      );
      return toSimulationResult(response);
    },
    async updateProtocolFeePercent(protocolFeePercent: bigint, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "updateProtocolFeePercent",
          args: [protocolFeePercent],
        }),
      );
      return toSimulationResult(response);
    },
    async setPlatformAdapter(platformBytes: Hex, platformAdapter: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "setPlatformAdapter",
          args: [platformBytes, platformAdapter],
        }),
      );
      return toSimulationResult(response);
    },
    async setPlatformLineItemType(platformHash: Hex, typeId: Hex, label: string, countsTowardGoal: boolean, applyProtocolFee: boolean, canRefund: boolean, instantTransfer: boolean, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "setPlatformLineItemType",
          args: [platformHash, typeId, label, countsTowardGoal, applyProtocolFee, canRefund, instantTransfer],
        }),
      );
      return toSimulationResult(response);
    },
    async removePlatformLineItemType(platformHash: Hex, typeId: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "removePlatformLineItemType",
          args: [platformHash, typeId],
        }),
      );
      return toSimulationResult(response);
    },
    async addTokenToCurrency(currency: Hex, token: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "addTokenToCurrency",
          args: [currency, token],
        }),
      );
      return toSimulationResult(response);
    },
    async removeTokenFromCurrency(currency: Hex, token: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "removeTokenFromCurrency",
          args: [currency, token],
        }),
      );
      return toSimulationResult(response);
    },
    async addPlatformData(platformBytes: Hex, platformDataKey: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "addPlatformData",
          args: [platformBytes, platformDataKey],
        }),
      );
      return toSimulationResult(response);
    },
    async removePlatformData(platformBytes: Hex, platformDataKey: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "removePlatformData",
          args: [platformBytes, platformDataKey],
        }),
      );
      return toSimulationResult(response);
    },
    async addToRegistry(key: Hex, value: Hex, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "addToRegistry",
          args: [key, value],
        }),
      );
      return toSimulationResult(response);
    },
    async transferOwnership(newOwner: Address, options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "transferOwnership",
          args: [newOwner],
        }),
      );
      return toSimulationResult(response);
    },
    async renounceOwnership(options?: CallSignerOptions) {
      const signer = requireSigner(options?.signer ?? walletClient); const account = requireAccount(signer);
      const response = await simulateWithErrorDecode(() =>
        publicClient.simulateContract({
          ...contract,
          chain,
          account,
          functionName: "renounceOwnership",
          args: [],
        }),
      );
      return toSimulationResult(response);
    },
  };
}
