import type { Address, Hex, PublicClient, WalletClient, Chain } from "viem";
import { GLOBAL_PARAMS_ABI } from "../abis/global-params";
import type { GlobalParamsEntity, LineItemTypeInfo } from "../types";

/**
 * Creates a GlobalParams entity with full read/write access.
 *
 * @param address - Deployed GlobalParams contract address
 * @param publicClient - Viem PublicClient for on-chain reads
 * @param walletClient - Viem WalletClient for sending transactions
 * @param chain - Chain object (required for writeContract)
 * @returns GlobalParamsEntity
 *
 * @example
 * ```typescript
 * const gp = createGlobalParamsEntity(GP_ADDRESS, publicClient, walletClient, chain);
 * const admin = await gp.getProtocolAdminAddress();
 * await gp.enlistPlatform(platformHash, adminAddr, 500n, adapterAddr);
 * ```
 */
export function createGlobalParamsEntity(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
  chain: Chain,
): GlobalParamsEntity {
  const contract = { address, abi: GLOBAL_PARAMS_ABI } as const;

  function requireAccount() {
    if (!walletClient.account) {
      throw new Error("Wallet client has no account; cannot send transaction.");
    }
    return walletClient.account;
  }

  return {
    // ── Reads ────────────────────────────────────────────────────────────────

    async getProtocolAdminAddress() {
      return publicClient.readContract({ ...contract, functionName: "getProtocolAdminAddress" });
    },
    async getProtocolFeePercent() {
      return publicClient.readContract({ ...contract, functionName: "getProtocolFeePercent" });
    },
    async getNumberOfListedPlatforms() {
      return publicClient.readContract({ ...contract, functionName: "getNumberOfListedPlatforms" });
    },
    async checkIfPlatformIsListed(platformBytes: Hex) {
      return publicClient.readContract({ ...contract, functionName: "checkIfPlatformIsListed", args: [platformBytes] });
    },
    async checkIfPlatformDataKeyValid(platformDataKey: Hex) {
      return publicClient.readContract({ ...contract, functionName: "checkIfPlatformDataKeyValid", args: [platformDataKey] });
    },
    async getPlatformAdminAddress(platformBytes: Hex) {
      return publicClient.readContract({ ...contract, functionName: "getPlatformAdminAddress", args: [platformBytes] });
    },
    async getPlatformFeePercent(platformBytes: Hex) {
      return publicClient.readContract({ ...contract, functionName: "getPlatformFeePercent", args: [platformBytes] });
    },
    async getPlatformClaimDelay(platformBytes: Hex) {
      return publicClient.readContract({ ...contract, functionName: "getPlatformClaimDelay", args: [platformBytes] });
    },
    async getPlatformAdapter(platformBytes: Hex) {
      return publicClient.readContract({ ...contract, functionName: "getPlatformAdapter", args: [platformBytes] });
    },
    async getPlatformDataOwner(platformDataKey: Hex) {
      return publicClient.readContract({ ...contract, functionName: "getPlatformDataOwner", args: [platformDataKey] });
    },
    async getPlatformLineItemType(platformHash: Hex, typeId: Hex): Promise<LineItemTypeInfo> {
      const result = await publicClient.readContract({ ...contract, functionName: "getPlatformLineItemType", args: [platformHash, typeId] });
      // viem returns named tuple outputs as an object
      return result as unknown as LineItemTypeInfo;
    },
    async getTokensForCurrency(currency: Hex) {
      return publicClient.readContract({ ...contract, functionName: "getTokensForCurrency", args: [currency] });
    },
    async getFromRegistry(key: Hex) {
      return publicClient.readContract({ ...contract, functionName: "getFromRegistry", args: [key] });
    },
    async owner() {
      return publicClient.readContract({ ...contract, functionName: "owner" });
    },
    async paused() {
      return publicClient.readContract({ ...contract, functionName: "paused" });
    },

    // ── Writes ───────────────────────────────────────────────────────────────

    async enlistPlatform(platformHash: Hex, platformAdminAddress: Address, platformFeePercent: bigint, platformAdapter: Address) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "enlistPlatform", args: [platformHash, platformAdminAddress, platformFeePercent, platformAdapter] });
    },
    async delistPlatform(platformBytes: Hex) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "delistPlatform", args: [platformBytes] });
    },
    async updatePlatformAdminAddress(platformBytes: Hex, platformAdminAddress: Address) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "updatePlatformAdminAddress", args: [platformBytes, platformAdminAddress] });
    },
    async updatePlatformClaimDelay(platformBytes: Hex, claimDelay: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "updatePlatformClaimDelay", args: [platformBytes, claimDelay] });
    },
    async updateProtocolAdminAddress(protocolAdminAddress: Address) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "updateProtocolAdminAddress", args: [protocolAdminAddress] });
    },
    async updateProtocolFeePercent(protocolFeePercent: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "updateProtocolFeePercent", args: [protocolFeePercent] });
    },
    async setPlatformAdapter(platformBytes: Hex, platformAdapter: Address) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "setPlatformAdapter", args: [platformBytes, platformAdapter] });
    },
    async setPlatformLineItemType(platformHash: Hex, typeId: Hex, label: string, countsTowardGoal: boolean, applyProtocolFee: boolean, canRefund: boolean, instantTransfer: boolean) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "setPlatformLineItemType", args: [platformHash, typeId, label, countsTowardGoal, applyProtocolFee, canRefund, instantTransfer] });
    },
    async removePlatformLineItemType(platformHash: Hex, typeId: Hex) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "removePlatformLineItemType", args: [platformHash, typeId] });
    },
    async addTokenToCurrency(currency: Hex, token: Address) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "addTokenToCurrency", args: [currency, token] });
    },
    async removeTokenFromCurrency(currency: Hex, token: Address) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "removeTokenFromCurrency", args: [currency, token] });
    },
    async addPlatformData(platformBytes: Hex, platformDataKey: Hex) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "addPlatformData", args: [platformBytes, platformDataKey] });
    },
    async removePlatformData(platformBytes: Hex, platformDataKey: Hex) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "removePlatformData", args: [platformBytes, platformDataKey] });
    },
    async addToRegistry(key: Hex, value: Hex) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "addToRegistry", args: [key, value] });
    },
    async transferOwnership(newOwner: Address) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "transferOwnership", args: [newOwner] });
    },
    async renounceOwnership() {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "renounceOwnership", args: [] });
    },
  };
}
