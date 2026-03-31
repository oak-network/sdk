/**
 * Mock-based unit tests for all 8 contract entity modules.
 * These ensure 100% code coverage of reads/writes/simulate/events/index
 * without needing a real RPC connection.
 */

import type { Address, PublicClient, WalletClient, Chain } from "../../src/lib";

const ADDR = "0x0000000000000000000000000000000000000001" as Address;
const B32 = ("0x" + "00".repeat(32)) as `0x${string}`;

function mockPublicClient(): PublicClient {
  return {
    readContract: jest.fn().mockResolvedValue(0n),
    simulateContract: jest.fn().mockResolvedValue({ result: undefined }),
  } as unknown as PublicClient;
}

function mockWalletClient(): WalletClient {
  return {
    account: { address: ADDR },
    writeContract: jest.fn().mockResolvedValue("0xhash"),
  } as unknown as WalletClient;
}

const chain = { id: 11142220, name: "Celo Sepolia" } as Chain;

// ============================================================
// Global Params
// ============================================================
import { createGlobalParamsEntity } from "../../src/contracts/global-params/index";

describe("GlobalParams entity", () => {
  const pub = mockPublicClient();
  const wal = mockWalletClient();
  const entity = createGlobalParamsEntity(ADDR, pub, wal, chain);

  describe("reads", () => {
    it("getProtocolAdminAddress", async () => { await entity.getProtocolAdminAddress(); expect(pub.readContract).toHaveBeenCalled(); });
    it("getProtocolFeePercent", async () => { await entity.getProtocolFeePercent(); });
    it("getNumberOfListedPlatforms", async () => { await entity.getNumberOfListedPlatforms(); });
    it("checkIfPlatformIsListed", async () => { await entity.checkIfPlatformIsListed(B32); });
    it("checkIfPlatformDataKeyValid", async () => { await entity.checkIfPlatformDataKeyValid(B32); });
    it("getPlatformAdminAddress", async () => { await entity.getPlatformAdminAddress(B32); });
    it("getPlatformFeePercent", async () => { await entity.getPlatformFeePercent(B32); });
    it("getPlatformClaimDelay", async () => { await entity.getPlatformClaimDelay(B32); });
    it("getPlatformAdapter", async () => { await entity.getPlatformAdapter(B32); });
    it("getPlatformDataOwner", async () => { await entity.getPlatformDataOwner(B32); });
    it("getPlatformLineItemType", async () => { await entity.getPlatformLineItemType(B32, B32); });
    it("getTokensForCurrency", async () => { await entity.getTokensForCurrency(B32); });
    it("getFromRegistry", async () => { await entity.getFromRegistry(B32); });
    it("owner", async () => { await entity.owner(); });
  });

  describe("writes", () => {
    it("enlistPlatform", async () => { await entity.enlistPlatform(B32, ADDR, 100n, ADDR); expect(wal.writeContract).toHaveBeenCalled(); });
    it("delistPlatform", async () => { await entity.delistPlatform(B32); });
    it("updatePlatformAdminAddress", async () => { await entity.updatePlatformAdminAddress(B32, ADDR); });
    it("updatePlatformClaimDelay", async () => { await entity.updatePlatformClaimDelay(B32, 0n); });
    it("updateProtocolAdminAddress", async () => { await entity.updateProtocolAdminAddress(ADDR); });
    it("updateProtocolFeePercent", async () => { await entity.updateProtocolFeePercent(100n); });
    it("setPlatformAdapter", async () => { await entity.setPlatformAdapter(B32, ADDR); });
    it("setPlatformLineItemType", async () => { await entity.setPlatformLineItemType(B32, B32, "test", true, true, true, false); });
    it("removePlatformLineItemType", async () => { await entity.removePlatformLineItemType(B32, B32); });
    it("addTokenToCurrency", async () => { await entity.addTokenToCurrency(B32, ADDR); });
    it("removeTokenFromCurrency", async () => { await entity.removeTokenFromCurrency(B32, ADDR); });
    it("addPlatformData", async () => { await entity.addPlatformData(B32, B32); });
    it("removePlatformData", async () => { await entity.removePlatformData(B32, B32); });
    it("addToRegistry", async () => { await entity.addToRegistry(B32, B32); });
    it("transferOwnership", async () => { await entity.transferOwnership(ADDR); });
    it("renounceOwnership", async () => { await entity.renounceOwnership(); });
  });

  describe("simulate", () => {
    it("enlistPlatform", async () => { await entity.simulate.enlistPlatform(B32, ADDR, 100n, ADDR); expect(pub.simulateContract).toHaveBeenCalled(); });
    it("delistPlatform", async () => { await entity.simulate.delistPlatform(B32); });
    it("updatePlatformAdminAddress", async () => { await entity.simulate.updatePlatformAdminAddress(B32, ADDR); });
    it("updatePlatformClaimDelay", async () => { await entity.simulate.updatePlatformClaimDelay(B32, 0n); });
    it("updateProtocolAdminAddress", async () => { await entity.simulate.updateProtocolAdminAddress(ADDR); });
    it("updateProtocolFeePercent", async () => { await entity.simulate.updateProtocolFeePercent(100n); });
    it("setPlatformAdapter", async () => { await entity.simulate.setPlatformAdapter(B32, ADDR); });
    it("setPlatformLineItemType", async () => { await entity.simulate.setPlatformLineItemType(B32, B32, "test", true, true, true, false); });
    it("removePlatformLineItemType", async () => { await entity.simulate.removePlatformLineItemType(B32, B32); });
    it("addTokenToCurrency", async () => { await entity.simulate.addTokenToCurrency(B32, ADDR); });
    it("removeTokenFromCurrency", async () => { await entity.simulate.removeTokenFromCurrency(B32, ADDR); });
    it("addPlatformData", async () => { await entity.simulate.addPlatformData(B32, B32); });
    it("removePlatformData", async () => { await entity.simulate.removePlatformData(B32, B32); });
    it("addToRegistry", async () => { await entity.simulate.addToRegistry(B32, B32); });
    it("transferOwnership", async () => { await entity.simulate.transferOwnership(ADDR); });
    it("renounceOwnership", async () => { await entity.simulate.renounceOwnership(); });
  });

  it("events is empty object", () => { expect(entity.events).toEqual({}); });
});

// ============================================================
// Campaign Info Factory
// ============================================================
import { createCampaignInfoFactoryEntity } from "../../src/contracts/campaign-info-factory/index";

describe("CampaignInfoFactory entity", () => {
  const pub = mockPublicClient();
  const wal = mockWalletClient();
  const entity = createCampaignInfoFactoryEntity(ADDR, pub, wal, chain);

  const params = {
    creator: ADDR,
    identifierHash: B32,
    selectedPlatformHash: [B32],
    campaignData: { launchTime: 9999999999n, deadline: 9999999999n, goalAmount: 1000n, currency: B32 },
    nftName: "T",
    nftSymbol: "T",
    nftImageURI: "u",
    contractURI: "c",
  };

  it("identifierToCampaignInfo", async () => { await entity.identifierToCampaignInfo(B32); });
  it("isValidCampaignInfo", async () => { await entity.isValidCampaignInfo(ADDR); });
  it("owner", async () => { await entity.owner(); });
  it("createCampaign", async () => { await entity.createCampaign(params); });
  it("createCampaign with optionalKeys", async () => { await entity.createCampaign({ ...params, platformDataKey: [B32], platformDataValue: [B32] }); });
  it("updateImplementation", async () => { await entity.updateImplementation(ADDR); });
  it("transferOwnership", async () => { await entity.transferOwnership(ADDR); });
  it("renounceOwnership", async () => { await entity.renounceOwnership(); });
  it("simulate.createCampaign", async () => { await entity.simulate.createCampaign(params); });
  it("simulate.updateImplementation", async () => { await entity.simulate.updateImplementation(ADDR); });
  it("simulate.transferOwnership", async () => { await entity.simulate.transferOwnership(ADDR); });
  it("simulate.renounceOwnership", async () => { await entity.simulate.renounceOwnership(); });
  it("events is empty", () => { expect(entity.events).toEqual({}); });
});

// ============================================================
// Treasury Factory
// ============================================================
import { createTreasuryFactoryEntity } from "../../src/contracts/treasury-factory/index";

describe("TreasuryFactory entity", () => {
  const pub = mockPublicClient();
  const wal = mockWalletClient();
  const entity = createTreasuryFactoryEntity(ADDR, pub, wal, chain);

  it("deploy", async () => { await entity.deploy(B32, ADDR, 0n); });
  it("registerTreasuryImplementation", async () => { await entity.registerTreasuryImplementation(B32, 0n, ADDR); });
  it("approveTreasuryImplementation", async () => { await entity.approveTreasuryImplementation(B32, 0n); });
  it("disapproveTreasuryImplementation", async () => { await entity.disapproveTreasuryImplementation(ADDR); });
  it("removeTreasuryImplementation", async () => { await entity.removeTreasuryImplementation(B32, 0n); });
  it("simulate.deploy", async () => { await entity.simulate.deploy(B32, ADDR, 0n); });
  it("simulate.registerTreasuryImplementation", async () => { await entity.simulate.registerTreasuryImplementation(B32, 0n, ADDR); });
  it("simulate.approveTreasuryImplementation", async () => { await entity.simulate.approveTreasuryImplementation(B32, 0n); });
  it("simulate.disapproveTreasuryImplementation", async () => { await entity.simulate.disapproveTreasuryImplementation(ADDR); });
  it("simulate.removeTreasuryImplementation", async () => { await entity.simulate.removeTreasuryImplementation(B32, 0n); });
  it("events is empty", () => { expect(entity.events).toEqual({}); });
});

// ============================================================
// Campaign Info
// ============================================================
import { createCampaignInfoEntity } from "../../src/contracts/campaign-info/index";

describe("CampaignInfo entity", () => {
  const pub = mockPublicClient();
  const wal = mockWalletClient();
  const entity = createCampaignInfoEntity(ADDR, pub, wal, chain);

  describe("reads", () => {
    it("getLaunchTime", async () => { await entity.getLaunchTime(); });
    it("getDeadline", async () => { await entity.getDeadline(); });
    it("getGoalAmount", async () => { await entity.getGoalAmount(); });
    it("getCampaignCurrency", async () => { await entity.getCampaignCurrency(); });
    it("getIdentifierHash", async () => { await entity.getIdentifierHash(); });
    it("checkIfPlatformSelected", async () => { await entity.checkIfPlatformSelected(B32); });
    it("checkIfPlatformApproved", async () => { await entity.checkIfPlatformApproved(B32); });
    it("getPlatformAdminAddress", async () => { await entity.getPlatformAdminAddress(B32); });
    it("getPlatformData", async () => { await entity.getPlatformData(B32); });
    it("getPlatformFeePercent", async () => { await entity.getPlatformFeePercent(B32); });
    it("getPlatformClaimDelay", async () => { await entity.getPlatformClaimDelay(B32); });
    it("getProtocolAdminAddress", async () => { await entity.getProtocolAdminAddress(); });
    it("getProtocolFeePercent", async () => { await entity.getProtocolFeePercent(); });
    it("getAcceptedTokens", async () => { await entity.getAcceptedTokens(); });
    it("isTokenAccepted", async () => { await entity.isTokenAccepted(ADDR); });
    it("getTotalRaisedAmount", async () => { await entity.getTotalRaisedAmount(); });
    it("getTotalLifetimeRaisedAmount", async () => { await entity.getTotalLifetimeRaisedAmount(); });
    it("getTotalRefundedAmount", async () => { await entity.getTotalRefundedAmount(); });
    it("getTotalAvailableRaisedAmount", async () => { await entity.getTotalAvailableRaisedAmount(); });
    it("getTotalCancelledAmount", async () => { await entity.getTotalCancelledAmount(); });
    it("getTotalExpectedAmount", async () => { await entity.getTotalExpectedAmount(); });
    it("getDataFromRegistry", async () => { await entity.getDataFromRegistry(B32); });
    it("getBufferTime", async () => { await entity.getBufferTime(); });
    it("getLineItemType", async () => { await entity.getLineItemType(B32, B32); });
    it("getCampaignConfig", async () => { await entity.getCampaignConfig(); });
    it("getApprovedPlatformHashes", async () => { await entity.getApprovedPlatformHashes(); });
    it("isLocked", async () => { await entity.isLocked(); });
    it("cancelled", async () => { await entity.cancelled(); });
    it("owner", async () => { await entity.owner(); });
    it("paused", async () => { await entity.paused(); });
  });

  describe("writes", () => {
    it("updateDeadline", async () => { await entity.updateDeadline(0n); });
    it("updateGoalAmount", async () => { await entity.updateGoalAmount(0n); });
    it("updateLaunchTime", async () => { await entity.updateLaunchTime(0n); });
    it("updateSelectedPlatform", async () => { await entity.updateSelectedPlatform(B32, true, [], []); });
    it("setImageURI", async () => { await entity.setImageURI("uri"); });
    it("updateContractURI", async () => { await entity.updateContractURI("uri"); });
    it("mintNFTForPledge", async () => { await entity.mintNFTForPledge(ADDR, B32, ADDR, 0n, 0n, 0n); });
    it("burn", async () => { await entity.burn(0n); });
    it("pauseCampaign", async () => { await entity.pauseCampaign(B32); });
    it("unpauseCampaign", async () => { await entity.unpauseCampaign(B32); });
    it("cancelCampaign", async () => { await entity.cancelCampaign(B32); });
    it("setPlatformInfo", async () => { await entity.setPlatformInfo(B32, ADDR); });
    it("transferOwnership", async () => { await entity.transferOwnership(ADDR); });
    it("renounceOwnership", async () => { await entity.renounceOwnership(); });
  });

  describe("simulate", () => {
    it("updateDeadline", async () => { await entity.simulate.updateDeadline(0n); });
    it("updateGoalAmount", async () => { await entity.simulate.updateGoalAmount(0n); });
    it("updateLaunchTime", async () => { await entity.simulate.updateLaunchTime(0n); });
    it("updateSelectedPlatform", async () => { await entity.simulate.updateSelectedPlatform(B32, true, [], []); });
    it("setImageURI", async () => { await entity.simulate.setImageURI("uri"); });
    it("updateContractURI", async () => { await entity.simulate.updateContractURI("uri"); });
    it("mintNFTForPledge", async () => { await entity.simulate.mintNFTForPledge(ADDR, B32, ADDR, 0n, 0n, 0n); });
    it("burn", async () => { await entity.simulate.burn(0n); });
    it("pauseCampaign", async () => { await entity.simulate.pauseCampaign(B32); });
    it("unpauseCampaign", async () => { await entity.simulate.unpauseCampaign(B32); });
    it("cancelCampaign", async () => { await entity.simulate.cancelCampaign(B32); });
    it("setPlatformInfo", async () => { await entity.simulate.setPlatformInfo(B32, ADDR); });
    it("transferOwnership", async () => { await entity.simulate.transferOwnership(ADDR); });
    it("renounceOwnership", async () => { await entity.simulate.renounceOwnership(); });
  });

  it("events is empty", () => { expect(entity.events).toEqual({}); });
});

// ============================================================
// Payment Treasury
// ============================================================
import { createPaymentTreasuryEntity } from "../../src/contracts/payment-treasury/index";

describe("PaymentTreasury entity", () => {
  const pub = mockPublicClient();
  const wal = mockWalletClient();
  const entity = createPaymentTreasuryEntity(ADDR, pub, wal, chain);

  describe("reads", () => {
    it("getPlatformHash", async () => { await entity.getPlatformHash(); });
    it("getPlatformFeePercent", async () => { await entity.getPlatformFeePercent(); });
    it("getRaisedAmount", async () => { await entity.getRaisedAmount(); });
    it("getAvailableRaisedAmount", async () => { await entity.getAvailableRaisedAmount(); });
    it("getLifetimeRaisedAmount", async () => { await entity.getLifetimeRaisedAmount(); });
    it("getRefundedAmount", async () => { await entity.getRefundedAmount(); });
    it("getExpectedAmount", async () => { await entity.getExpectedAmount(); });
    it("getPaymentData", async () => { await entity.getPaymentData(B32); });
    it("cancelled", async () => { await entity.cancelled(); });
  });

  describe("writes", () => {
    it("createPayment", async () => { await entity.createPayment(B32, B32, B32, ADDR, 0n, 0n, [], []); });
    it("createPaymentBatch", async () => { await entity.createPaymentBatch([B32], [B32], [B32], [ADDR], [0n], [0n], [[]], [[]]); });
    it("processCryptoPayment", async () => { await entity.processCryptoPayment(B32, B32, ADDR, ADDR, 0n, [], []); });
    it("cancelPayment", async () => { await entity.cancelPayment(B32); });
    it("confirmPayment", async () => { await entity.confirmPayment(B32, ADDR); });
    it("confirmPaymentBatch", async () => { await entity.confirmPaymentBatch([B32], [ADDR]); });
    it("disburseFees", async () => { await entity.disburseFees(); });
    it("withdraw", async () => { await entity.withdraw(); });
    it("claimRefund", async () => { await entity.claimRefund(B32, ADDR); });
    it("claimRefundSelf", async () => { await entity.claimRefundSelf(B32); });
    it("claimExpiredFunds", async () => { await entity.claimExpiredFunds(); });
    it("claimNonGoalLineItems", async () => { await entity.claimNonGoalLineItems(ADDR); });
    it("pauseTreasury", async () => { await entity.pauseTreasury(B32); });
    it("unpauseTreasury", async () => { await entity.unpauseTreasury(B32); });
    it("cancelTreasury", async () => { await entity.cancelTreasury(B32); });
  });

  describe("simulate", () => {
    it("createPayment", async () => { await entity.simulate.createPayment(B32, B32, B32, ADDR, 0n, 0n, [], []); });
    it("createPaymentBatch", async () => { await entity.simulate.createPaymentBatch([B32], [B32], [B32], [ADDR], [0n], [0n], [[]], [[]]); });
    it("processCryptoPayment", async () => { await entity.simulate.processCryptoPayment(B32, B32, ADDR, ADDR, 0n, [], []); });
    it("cancelPayment", async () => { await entity.simulate.cancelPayment(B32); });
    it("confirmPayment", async () => { await entity.simulate.confirmPayment(B32, ADDR); });
    it("confirmPaymentBatch", async () => { await entity.simulate.confirmPaymentBatch([B32], [ADDR]); });
    it("disburseFees", async () => { await entity.simulate.disburseFees(); });
    it("withdraw", async () => { await entity.simulate.withdraw(); });
    it("claimRefund", async () => { await entity.simulate.claimRefund(B32, ADDR); });
    it("claimRefundSelf", async () => { await entity.simulate.claimRefundSelf(B32); });
    it("claimExpiredFunds", async () => { await entity.simulate.claimExpiredFunds(); });
    it("claimNonGoalLineItems", async () => { await entity.simulate.claimNonGoalLineItems(ADDR); });
    it("pauseTreasury", async () => { await entity.simulate.pauseTreasury(B32); });
    it("unpauseTreasury", async () => { await entity.simulate.unpauseTreasury(B32); });
    it("cancelTreasury", async () => { await entity.simulate.cancelTreasury(B32); });
  });

  it("events is empty", () => { expect(entity.events).toEqual({}); });
});

// ============================================================
// All Or Nothing
// ============================================================
import { createAllOrNothingEntity } from "../../src/contracts/all-or-nothing/index";

describe("AllOrNothing entity", () => {
  const pub = mockPublicClient();
  const wal = mockWalletClient();
  const entity = createAllOrNothingEntity(ADDR, pub, wal, chain);

  describe("reads", () => {
    it("getRaisedAmount", async () => { await entity.getRaisedAmount(); });
    it("getLifetimeRaisedAmount", async () => { await entity.getLifetimeRaisedAmount(); });
    it("getRefundedAmount", async () => { await entity.getRefundedAmount(); });
    it("getReward", async () => { await entity.getReward(B32); });
    it("getPlatformHash", async () => { await entity.getPlatformHash(); });
    it("getPlatformFeePercent", async () => { await entity.getPlatformFeePercent(); });
    it("paused", async () => { await entity.paused(); });
    it("cancelled", async () => { await entity.cancelled(); });
    it("balanceOf", async () => { await entity.balanceOf(ADDR); });
    it("ownerOf", async () => { await entity.ownerOf(0n); });
    it("tokenURI", async () => { await entity.tokenURI(0n); });
    it("name", async () => { await entity.name(); });
    it("symbol", async () => { await entity.symbol(); });
    it("getApproved", async () => { await entity.getApproved(0n); });
    it("isApprovedForAll", async () => { await entity.isApprovedForAll(ADDR, ADDR); });
    it("supportsInterface", async () => { await entity.supportsInterface("0x80ac58cd"); });
  });

  describe("writes", () => {
    it("pauseTreasury", async () => { await entity.pauseTreasury(B32); });
    it("unpauseTreasury", async () => { await entity.unpauseTreasury(B32); });
    it("cancelTreasury", async () => { await entity.cancelTreasury(B32); });
    it("addRewards", async () => { await entity.addRewards([B32], [{ rewardValue: 100n, isRewardTier: false, itemId: [], itemValue: [], itemQuantity: [] }]); });
    it("removeReward", async () => { await entity.removeReward(B32); });
    it("pledgeForAReward", async () => { await entity.pledgeForAReward(ADDR, ADDR, 0n, [B32]); });
    it("pledgeWithoutAReward", async () => { await entity.pledgeWithoutAReward(ADDR, ADDR, 100n); });
    it("claimRefund", async () => { await entity.claimRefund(0n); });
    it("disburseFees", async () => { await entity.disburseFees(); });
    it("withdraw", async () => { await entity.withdraw(); });
    it("burn", async () => { await entity.burn(0n); });
    it("approve", async () => { await entity.approve(ADDR, 0n); });
    it("setApprovalForAll", async () => { await entity.setApprovalForAll(ADDR, true); });
    it("safeTransferFrom", async () => { await entity.safeTransferFrom(ADDR, ADDR, 0n); });
    it("transferFrom", async () => { await entity.transferFrom(ADDR, ADDR, 0n); });
  });

  describe("simulate", () => {
    it("pauseTreasury", async () => { await entity.simulate.pauseTreasury(B32); });
    it("unpauseTreasury", async () => { await entity.simulate.unpauseTreasury(B32); });
    it("cancelTreasury", async () => { await entity.simulate.cancelTreasury(B32); });
    it("addRewards", async () => { await entity.simulate.addRewards([B32], [{ rewardValue: 100n, isRewardTier: false, itemId: [], itemValue: [], itemQuantity: [] }]); });
    it("removeReward", async () => { await entity.simulate.removeReward(B32); });
    it("pledgeForAReward", async () => { await entity.simulate.pledgeForAReward(ADDR, ADDR, 0n, [B32]); });
    it("pledgeWithoutAReward", async () => { await entity.simulate.pledgeWithoutAReward(ADDR, ADDR, 100n); });
    it("claimRefund", async () => { await entity.simulate.claimRefund(0n); });
    it("disburseFees", async () => { await entity.simulate.disburseFees(); });
    it("withdraw", async () => { await entity.simulate.withdraw(); });
    it("burn", async () => { await entity.simulate.burn(0n); });
    it("approve", async () => { await entity.simulate.approve(ADDR, 0n); });
    it("setApprovalForAll", async () => { await entity.simulate.setApprovalForAll(ADDR, true); });
    it("safeTransferFrom", async () => { await entity.simulate.safeTransferFrom(ADDR, ADDR, 0n); });
    it("transferFrom", async () => { await entity.simulate.transferFrom(ADDR, ADDR, 0n); });
  });

  it("events is empty", () => { expect(entity.events).toEqual({}); });
});

// ============================================================
// Keep Whats Raised
// ============================================================
import { createKeepWhatsRaisedEntity } from "../../src/contracts/keep-whats-raised/index";

describe("KeepWhatsRaised entity", () => {
  const pub = mockPublicClient();
  const wal = mockWalletClient();
  const entity = createKeepWhatsRaisedEntity(ADDR, pub, wal, chain);

  describe("reads", () => {
    it("getRaisedAmount", async () => { await entity.getRaisedAmount(); });
    it("getLifetimeRaisedAmount", async () => { await entity.getLifetimeRaisedAmount(); });
    it("getRefundedAmount", async () => { await entity.getRefundedAmount(); });
    it("getAvailableRaisedAmount", async () => { await entity.getAvailableRaisedAmount(); });
    it("getReward", async () => { await entity.getReward(B32); });
    it("getPlatformHash", async () => { await entity.getPlatformHash(); });
    it("getPlatformFeePercent", async () => { await entity.getPlatformFeePercent(); });
    it("getWithdrawalApprovalStatus", async () => { await entity.getWithdrawalApprovalStatus(); });
    it("getLaunchTime", async () => { await entity.getLaunchTime(); });
    it("getDeadline", async () => { await entity.getDeadline(); });
    it("getGoalAmount", async () => { await entity.getGoalAmount(); });
    it("getPaymentGatewayFee", async () => { await entity.getPaymentGatewayFee(B32); });
    it("getFeeValue", async () => { await entity.getFeeValue(B32); });
    it("paused", async () => { await entity.paused(); });
    it("cancelled", async () => { await entity.cancelled(); });
    it("balanceOf", async () => { await entity.balanceOf(ADDR); });
    it("ownerOf", async () => { await entity.ownerOf(0n); });
    it("tokenURI", async () => { await entity.tokenURI(0n); });
    it("name", async () => { await entity.name(); });
    it("symbol", async () => { await entity.symbol(); });
    it("getApproved", async () => { await entity.getApproved(0n); });
    it("isApprovedForAll", async () => { await entity.isApprovedForAll(ADDR, ADDR); });
    it("supportsInterface", async () => { await entity.supportsInterface("0x80ac58cd"); });
  });

  describe("writes", () => {
    it("pauseTreasury", async () => { await entity.pauseTreasury(B32); });
    it("unpauseTreasury", async () => { await entity.unpauseTreasury(B32); });
    it("cancelTreasury", async () => { await entity.cancelTreasury(B32); });
    it("configureTreasury", async () => {
      await entity.configureTreasury(
        { minimumWithdrawalForFeeExemption: 0n, withdrawalDelay: 0n, refundDelay: 0n, configLockPeriod: 0n, isColombianCreator: false },
        { launchTime: 0n, deadline: 0n, goalAmount: 0n, currency: B32 },
        { flatFeeKey: B32, cumulativeFlatFeeKey: B32, grossPercentageFeeKeys: [] },
        { flatFeeValue: 0n, cumulativeFlatFeeValue: 0n, grossPercentageFeeValues: [] },
      );
    });
    it("addRewards", async () => { await entity.addRewards([B32], [{ rewardValue: 0n, isRewardTier: false, itemId: [], itemValue: [], itemQuantity: [] }]); });
    it("removeReward", async () => { await entity.removeReward(B32); });
    it("approveWithdrawal", async () => { await entity.approveWithdrawal(); });
    it("setPaymentGatewayFee", async () => { await entity.setPaymentGatewayFee(B32, 0n); });
    it("setFeeAndPledge", async () => { await entity.setFeeAndPledge(B32, ADDR, ADDR, 0n, 0n, 0n, [B32], true); });
    it("pledgeForAReward", async () => { await entity.pledgeForAReward(B32, ADDR, ADDR, 0n, [B32]); });
    it("pledgeWithoutAReward", async () => { await entity.pledgeWithoutAReward(B32, ADDR, ADDR, 0n, 0n); });
    it("claimRefund", async () => { await entity.claimRefund(0n); });
    it("claimTip", async () => { await entity.claimTip(); });
    it("claimFund", async () => { await entity.claimFund(); });
    it("disburseFees", async () => { await entity.disburseFees(); });
    it("withdraw", async () => { await entity.withdraw(ADDR, 0n); });
    it("updateDeadline", async () => { await entity.updateDeadline(0n); });
    it("updateGoalAmount", async () => { await entity.updateGoalAmount(0n); });
    it("approve", async () => { await entity.approve(ADDR, 0n); });
    it("setApprovalForAll", async () => { await entity.setApprovalForAll(ADDR, true); });
    it("safeTransferFrom", async () => { await entity.safeTransferFrom(ADDR, ADDR, 0n); });
    it("transferFrom", async () => { await entity.transferFrom(ADDR, ADDR, 0n); });
  });

  describe("simulate", () => {
    it("pauseTreasury", async () => { await entity.simulate.pauseTreasury(B32); });
    it("unpauseTreasury", async () => { await entity.simulate.unpauseTreasury(B32); });
    it("cancelTreasury", async () => { await entity.simulate.cancelTreasury(B32); });
    it("configureTreasury", async () => {
      await entity.simulate.configureTreasury(
        { minimumWithdrawalForFeeExemption: 0n, withdrawalDelay: 0n, refundDelay: 0n, configLockPeriod: 0n, isColombianCreator: false },
        { launchTime: 0n, deadline: 0n, goalAmount: 0n, currency: B32 },
        { flatFeeKey: B32, cumulativeFlatFeeKey: B32, grossPercentageFeeKeys: [] },
        { flatFeeValue: 0n, cumulativeFlatFeeValue: 0n, grossPercentageFeeValues: [] },
      );
    });
    it("addRewards", async () => { await entity.simulate.addRewards([B32], [{ rewardValue: 0n, isRewardTier: false, itemId: [], itemValue: [], itemQuantity: [] }]); });
    it("removeReward", async () => { await entity.simulate.removeReward(B32); });
    it("approveWithdrawal", async () => { await entity.simulate.approveWithdrawal(); });
    it("setPaymentGatewayFee", async () => { await entity.simulate.setPaymentGatewayFee(B32, 0n); });
    it("setFeeAndPledge", async () => { await entity.simulate.setFeeAndPledge(B32, ADDR, ADDR, 0n, 0n, 0n, [B32], true); });
    it("pledgeForAReward", async () => { await entity.simulate.pledgeForAReward(B32, ADDR, ADDR, 0n, [B32]); });
    it("pledgeWithoutAReward", async () => { await entity.simulate.pledgeWithoutAReward(B32, ADDR, ADDR, 0n, 0n); });
    it("claimRefund", async () => { await entity.simulate.claimRefund(0n); });
    it("claimTip", async () => { await entity.simulate.claimTip(); });
    it("claimFund", async () => { await entity.simulate.claimFund(); });
    it("disburseFees", async () => { await entity.simulate.disburseFees(); });
    it("withdraw", async () => { await entity.simulate.withdraw(ADDR, 0n); });
    it("updateDeadline", async () => { await entity.simulate.updateDeadline(0n); });
    it("updateGoalAmount", async () => { await entity.simulate.updateGoalAmount(0n); });
    it("approve", async () => { await entity.simulate.approve(ADDR, 0n); });
    it("setApprovalForAll", async () => { await entity.simulate.setApprovalForAll(ADDR, true); });
    it("safeTransferFrom", async () => { await entity.simulate.safeTransferFrom(ADDR, ADDR, 0n); });
    it("transferFrom", async () => { await entity.simulate.transferFrom(ADDR, ADDR, 0n); });
  });

  it("events is empty", () => { expect(entity.events).toEqual({}); });
});

// ============================================================
// Item Registry
// ============================================================
import { createItemRegistryEntity } from "../../src/contracts/item-registry/index";

describe("ItemRegistry entity", () => {
  const pub = mockPublicClient();
  const wal = mockWalletClient();
  const entity = createItemRegistryEntity(ADDR, pub, wal, chain);
  const item = { actualWeight: 0n, height: 0n, width: 0n, length: 0n, category: B32, declaredCurrency: B32 };

  it("getItem", async () => { await entity.getItem(ADDR, B32); });
  it("addItem", async () => { await entity.addItem(B32, item); });
  it("addItemsBatch", async () => { await entity.addItemsBatch([B32], [item]); });
  it("simulate.addItem", async () => { await entity.simulate.addItem(B32, item); });
  it("simulate.addItemsBatch", async () => { await entity.simulate.addItemsBatch([B32], [item]); });
  it("events is empty", () => { expect(entity.events).toEqual({}); });
});

// ============================================================
// Barrel export coverage
// ============================================================
import * as mainIndex from "../../src/index";
import * as metricsIndex from "../../src/metrics/index";
import * as typesIndex from "../../src/types/index";

describe("barrel exports", () => {
  it("main index re-exports", () => { expect(mainIndex).toBeDefined(); });
  it("metrics index re-exports", () => { expect(metricsIndex).toBeDefined(); });
  it("types index re-exports", () => { expect(typesIndex).toBeDefined(); });
});
