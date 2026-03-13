import type { Address, Hex, WalletClient, Chain } from "../../lib";
import { GLOBAL_PARAMS_ABI } from "./abi";
import { requireAccount } from "../../utils/account";
import type { GlobalParamsWrites } from "./types";

/**
 * Builds write methods for a GlobalParams contract instance.
 * @param address - Contract address
 * @param walletClient - Viem WalletClient for writes
 * @param chain - Chain for writeContract
 * @returns GlobalParamsWrites
 */
export function createGlobalParamsWrites(
  address: Address,
  walletClient: WalletClient,
  chain: Chain,
): GlobalParamsWrites {
  const contract = { address, abi: GLOBAL_PARAMS_ABI } as const;

  return {
    async enlistPlatform(platformHash: Hex, platformAdminAddress: Address, platformFeePercent: bigint, platformAdapter: Address) {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "enlistPlatform", args: [platformHash, platformAdminAddress, platformFeePercent, platformAdapter] });
    },
    async delistPlatform(platformBytes: Hex) {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "delistPlatform", args: [platformBytes] });
    },
    async updatePlatformAdminAddress(platformBytes: Hex, platformAdminAddress: Address) {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "updatePlatformAdminAddress", args: [platformBytes, platformAdminAddress] });
    },
    async updatePlatformClaimDelay(platformBytes: Hex, claimDelay: bigint) {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "updatePlatformClaimDelay", args: [platformBytes, claimDelay] });
    },
    async updateProtocolAdminAddress(protocolAdminAddress: Address) {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "updateProtocolAdminAddress", args: [protocolAdminAddress] });
    },
    async updateProtocolFeePercent(protocolFeePercent: bigint) {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "updateProtocolFeePercent", args: [protocolFeePercent] });
    },
    async setPlatformAdapter(platformBytes: Hex, platformAdapter: Address) {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "setPlatformAdapter", args: [platformBytes, platformAdapter] });
    },
    async setPlatformLineItemType(platformHash: Hex, typeId: Hex, label: string, countsTowardGoal: boolean, applyProtocolFee: boolean, canRefund: boolean, instantTransfer: boolean) {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "setPlatformLineItemType", args: [platformHash, typeId, label, countsTowardGoal, applyProtocolFee, canRefund, instantTransfer] });
    },
    async removePlatformLineItemType(platformHash: Hex, typeId: Hex) {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "removePlatformLineItemType", args: [platformHash, typeId] });
    },
    async addTokenToCurrency(currency: Hex, token: Address) {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "addTokenToCurrency", args: [currency, token] });
    },
    async removeTokenFromCurrency(currency: Hex, token: Address) {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "removeTokenFromCurrency", args: [currency, token] });
    },
    async addPlatformData(platformBytes: Hex, platformDataKey: Hex) {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "addPlatformData", args: [platformBytes, platformDataKey] });
    },
    async removePlatformData(platformBytes: Hex, platformDataKey: Hex) {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "removePlatformData", args: [platformBytes, platformDataKey] });
    },
    async addToRegistry(key: Hex, value: Hex) {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "addToRegistry", args: [key, value] });
    },
    async transferOwnership(newOwner: Address) {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "transferOwnership", args: [newOwner] });
    },
    async renounceOwnership() {
      const account = requireAccount(walletClient);
      return walletClient.writeContract({ ...contract, chain, account, functionName: "renounceOwnership", args: [] });
    },
  };
}
