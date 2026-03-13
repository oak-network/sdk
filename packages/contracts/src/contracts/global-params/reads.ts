import type { Address, Hex, PublicClient } from "../../lib";
import { GLOBAL_PARAMS_ABI } from "./abi";
import type { GlobalParamsReads } from "./types";
import type { LineItemTypeInfo } from "../../types/structs";

/**
 * Builds read methods for a GlobalParams contract instance.
 * @param address - Contract address
 * @param publicClient - Viem PublicClient for reads
 * @returns GlobalParamsReads
 */
export function createGlobalParamsReads(
  address: Address,
  publicClient: PublicClient,
): GlobalParamsReads {
  const contract = { address, abi: GLOBAL_PARAMS_ABI } as const;

  return {
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
  };
}
