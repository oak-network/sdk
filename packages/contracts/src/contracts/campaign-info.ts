import type { Address, Hex, PublicClient, WalletClient, Chain } from "viem";
import { CAMPAIGN_INFO_ABI } from "../abis/campaign-info";
import type { CampaignInfoEntity, LineItemTypeInfo, CampaignConfig } from "../types";

/**
 * Creates a CampaignInfo entity with full read/write access.
 *
 * @param address - Deployed CampaignInfo contract address
 * @param publicClient - Viem PublicClient for on-chain reads
 * @param walletClient - Viem WalletClient for sending transactions
 * @param chain - Chain object (required for writeContract)
 * @returns CampaignInfoEntity
 *
 * @example
 * ```typescript
 * const ci = createCampaignInfoEntity(CAMPAIGN_INFO_ADDRESS, publicClient, walletClient, chain);
 * const deadline = await ci.getDeadline();
 * await ci.updateDeadline(newDeadline);
 * ```
 */
export function createCampaignInfoEntity(
  address: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
  chain: Chain,
): CampaignInfoEntity {
  const contract = { address, abi: CAMPAIGN_INFO_ABI } as const;

  function requireAccount() {
    if (!walletClient.account) {
      throw new Error("Wallet client has no account; cannot send transaction.");
    }
    return walletClient.account;
  }

  return {
    // ── Reads ────────────────────────────────────────────────────────────────

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

    // ── Writes ───────────────────────────────────────────────────────────────

    async updateDeadline(deadline: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "updateDeadline", args: [deadline] });
    },
    async updateGoalAmount(goalAmount: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "updateGoalAmount", args: [goalAmount] });
    },
    async updateLaunchTime(launchTime: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "updateLaunchTime", args: [launchTime] });
    },
    async updateSelectedPlatform(platformHash: Hex, selection: boolean, platformDataKey: readonly Hex[], platformDataValue: readonly Hex[]) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "updateSelectedPlatform", args: [platformHash, selection, [...platformDataKey], [...platformDataValue]] });
    },
    async setImageURI(newImageURI: string) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "setImageURI", args: [newImageURI] });
    },
    async updateContractURI(newContractURI: string) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "updateContractURI", args: [newContractURI] });
    },
    async mintNFTForPledge(backer: Address, reward: Hex, tokenAddress: Address, amount: bigint, shippingFee: bigint, tipAmount: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "mintNFTForPledge", args: [backer, reward, tokenAddress, amount, shippingFee, tipAmount] });
    },
    async burn(tokenId: bigint) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "burn", args: [tokenId] });
    },
    async pauseCampaign(message: Hex) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "_pauseCampaign", args: [message] });
    },
    async unpauseCampaign(message: Hex) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "_unpauseCampaign", args: [message] });
    },
    async setPlatformInfo(platformBytes: Hex, platformTreasuryAddress: Address) {
      const account = requireAccount();
      return walletClient.writeContract({ ...contract, chain, account, functionName: "_setPlatformInfo", args: [platformBytes, platformTreasuryAddress] });
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
