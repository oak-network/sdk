import type { Address, Hex, PublicClient } from "../../lib";
import { CAMPAIGN_INFO_ABI } from "./abi";
import type { CampaignInfoReads } from "./types";
import type { LineItemTypeInfo, CampaignConfig } from "../../types/structs";

/**
 * Builds read methods for a CampaignInfo contract instance.
 * @param address - Contract address
 * @param publicClient - Viem PublicClient for reads
 * @returns CampaignInfoReads
 */
export function createCampaignInfoReads(
  address: Address,
  publicClient: PublicClient,
): CampaignInfoReads {
  const contract = { address, abi: CAMPAIGN_INFO_ABI } as const;

  return {
    async getLaunchTime() {
      return publicClient.readContract({ ...contract, functionName: "getLaunchTime" });
    },
    async getDeadline() {
      return publicClient.readContract({ ...contract, functionName: "getDeadline" });
    },
    async getGoalAmount() {
      return publicClient.readContract({ ...contract, functionName: "getGoalAmount" });
    },
    async getCampaignCurrency() {
      return publicClient.readContract({ ...contract, functionName: "getCampaignCurrency" });
    },
    async getIdentifierHash() {
      return publicClient.readContract({ ...contract, functionName: "getIdentifierHash" });
    },
    async checkIfPlatformSelected(platformBytes: Hex) {
      return publicClient.readContract({ ...contract, functionName: "checkIfPlatformSelected", args: [platformBytes] });
    },
    async checkIfPlatformApproved(platformHash: Hex) {
      return publicClient.readContract({ ...contract, functionName: "checkIfPlatformApproved", args: [platformHash] });
    },
    async getPlatformAdminAddress(platformBytes: Hex) {
      return publicClient.readContract({ ...contract, functionName: "getPlatformAdminAddress", args: [platformBytes] });
    },
    async getPlatformData(platformDataKey: Hex) {
      return publicClient.readContract({ ...contract, functionName: "getPlatformData", args: [platformDataKey] });
    },
    async getPlatformFeePercent(platformBytes: Hex) {
      return publicClient.readContract({ ...contract, functionName: "getPlatformFeePercent", args: [platformBytes] });
    },
    async getPlatformClaimDelay(platformHash: Hex) {
      return publicClient.readContract({ ...contract, functionName: "getPlatformClaimDelay", args: [platformHash] });
    },
    async getProtocolAdminAddress() {
      return publicClient.readContract({ ...contract, functionName: "getProtocolAdminAddress" });
    },
    async getProtocolFeePercent() {
      return publicClient.readContract({ ...contract, functionName: "getProtocolFeePercent" });
    },
    async getAcceptedTokens() {
      return publicClient.readContract({ ...contract, functionName: "getAcceptedTokens" });
    },
    async isTokenAccepted(token: Address) {
      return publicClient.readContract({ ...contract, functionName: "isTokenAccepted", args: [token] });
    },
    async getTotalRaisedAmount() {
      return publicClient.readContract({ ...contract, functionName: "getTotalRaisedAmount" });
    },
    async getTotalLifetimeRaisedAmount() {
      return publicClient.readContract({ ...contract, functionName: "getTotalLifetimeRaisedAmount" });
    },
    async getTotalRefundedAmount() {
      return publicClient.readContract({ ...contract, functionName: "getTotalRefundedAmount" });
    },
    async getTotalAvailableRaisedAmount() {
      return publicClient.readContract({ ...contract, functionName: "getTotalAvailableRaisedAmount" });
    },
    async getTotalCancelledAmount() {
      return publicClient.readContract({ ...contract, functionName: "getTotalCancelledAmount" });
    },
    async getTotalExpectedAmount() {
      return publicClient.readContract({ ...contract, functionName: "getTotalExpectedAmount" });
    },
    async getDataFromRegistry(key: Hex) {
      return publicClient.readContract({ ...contract, functionName: "getDataFromRegistry", args: [key] });
    },
    async getBufferTime() {
      return publicClient.readContract({ ...contract, functionName: "getBufferTime" });
    },
    async getLineItemType(platformHash: Hex, typeId: Hex): Promise<LineItemTypeInfo> {
      const result = await publicClient.readContract({ ...contract, functionName: "getLineItemType", args: [platformHash, typeId] });
      return result as unknown as LineItemTypeInfo;
    },
    async getCampaignConfig(): Promise<CampaignConfig> {
      const result = await publicClient.readContract({ ...contract, functionName: "getCampaignConfig" });
      return result as unknown as CampaignConfig;
    },
    async getApprovedPlatformHashes() {
      return publicClient.readContract({ ...contract, functionName: "getApprovedPlatformHashes" });
    },
    async isLocked() {
      return publicClient.readContract({ ...contract, functionName: "isLocked" });
    },
    async cancelled() {
      return publicClient.readContract({ ...contract, functionName: "cancelled" });
    },
    async owner() {
      return publicClient.readContract({ ...contract, functionName: "owner" });
    },
    async paused() {
      return publicClient.readContract({ ...contract, functionName: "paused" });
    },
  };
}
