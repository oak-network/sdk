/**
 * Mock-based unit tests for all 8 contract entity modules.
 * These ensure 100% code coverage of reads/writes/simulate/events/index
 * without needing a real RPC connection.
 */

import type { Address, PublicClient, WalletClient, Chain } from "../../src/lib";
import { keccak256, toHex } from "viem";

const ADDR = "0x0000000000000000000000000000000000000001" as Address;
const B32 = ("0x" + "00".repeat(32)) as `0x${string}`;

const MOCK_ABI = [{ name: "mock", type: "function" as const, stateMutability: "nonpayable" as const, inputs: [], outputs: [] }] as const;

type WatchContractEventArgs = { onLogs: (logs: unknown[]) => void };

function mockPublicClient(): PublicClient {
  return {
    readContract: jest.fn().mockResolvedValue(0n),
    simulateContract: jest.fn().mockResolvedValue({
      result: undefined,
      request: { address: ADDR, abi: MOCK_ABI, functionName: "mock", args: [], value: 0n, gas: 21000n },
    }),
    getContractEvents: jest.fn().mockResolvedValue([]),
    watchContractEvent: jest.fn().mockImplementation((_args: WatchContractEventArgs) => () => {}),
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
    it("paused", async () => { await entity.paused(); });
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

  describe("events", () => {
    it("exposes event methods", () => {
      expect(typeof entity.events.getPlatformEnlistedLogs).toBe("function");
      expect(typeof entity.events.getPlatformDelistedLogs).toBe("function");
      expect(typeof entity.events.decodeLog).toBe("function");
      expect(typeof entity.events.watchPlatformEnlisted).toBe("function");
    });
    it("getPlatformEnlistedLogs", async () => { await entity.events.getPlatformEnlistedLogs(); expect(pub.getContractEvents).toHaveBeenCalled(); });
    it("getPlatformDelistedLogs", async () => { await entity.events.getPlatformDelistedLogs(); });
    it("getPlatformAdminAddressUpdatedLogs", async () => { await entity.events.getPlatformAdminAddressUpdatedLogs(); });
    it("getPlatformDataAddedLogs", async () => { await entity.events.getPlatformDataAddedLogs(); });
    it("getPlatformDataRemovedLogs", async () => { await entity.events.getPlatformDataRemovedLogs(); });
    it("getPlatformAdapterSetLogs", async () => { await entity.events.getPlatformAdapterSetLogs(); });
    it("getPlatformClaimDelayUpdatedLogs", async () => { await entity.events.getPlatformClaimDelayUpdatedLogs(); });
    it("getProtocolAdminAddressUpdatedLogs", async () => { await entity.events.getProtocolAdminAddressUpdatedLogs(); });
    it("getProtocolFeePercentUpdatedLogs", async () => { await entity.events.getProtocolFeePercentUpdatedLogs(); });
    it("getTokenAddedToCurrencyLogs", async () => { await entity.events.getTokenAddedToCurrencyLogs(); });
    it("getTokenRemovedFromCurrencyLogs", async () => { await entity.events.getTokenRemovedFromCurrencyLogs(); });
    it("getOwnershipTransferredLogs", async () => { await entity.events.getOwnershipTransferredLogs(); });
    it("getPausedLogs", async () => { await entity.events.getPausedLogs(); });
    it("getUnpausedLogs", async () => { await entity.events.getUnpausedLogs(); });
    it("getDataAddedToRegistryLogs", async () => { await entity.events.getDataAddedToRegistryLogs(); });
    it("getPlatformLineItemTypeSetLogs", async () => { await entity.events.getPlatformLineItemTypeSetLogs(); });
    it("getPlatformLineItemTypeRemovedLogs", async () => { await entity.events.getPlatformLineItemTypeRemovedLogs(); });
    it("watchPlatformEnlisted", () => { entity.events.watchPlatformEnlisted(() => {}); expect(pub.watchContractEvent).toHaveBeenCalled(); });
    it("watchPlatformDelisted", () => { entity.events.watchPlatformDelisted(() => {}); });
    it("watchPlatformAdminAddressUpdated", () => { entity.events.watchPlatformAdminAddressUpdated(() => {}); });
    it("watchPlatformDataAdded", () => { entity.events.watchPlatformDataAdded(() => {}); });
    it("watchPlatformDataRemoved", () => { entity.events.watchPlatformDataRemoved(() => {}); });
    it("watchPlatformAdapterSet", () => { entity.events.watchPlatformAdapterSet(() => {}); });
    it("watchPlatformClaimDelayUpdated", () => { entity.events.watchPlatformClaimDelayUpdated(() => {}); });
    it("watchProtocolAdminAddressUpdated", () => { entity.events.watchProtocolAdminAddressUpdated(() => {}); });
    it("watchProtocolFeePercentUpdated", () => { entity.events.watchProtocolFeePercentUpdated(() => {}); });
    it("watchTokenAddedToCurrency", () => { entity.events.watchTokenAddedToCurrency(() => {}); });
    it("watchTokenRemovedFromCurrency", () => { entity.events.watchTokenRemovedFromCurrency(() => {}); });
    it("watchOwnershipTransferred", () => { entity.events.watchOwnershipTransferred(() => {}); });
    it("watchPaused", () => { entity.events.watchPaused(() => {}); });
    it("watchUnpaused", () => { entity.events.watchUnpaused(() => {}); });
    it("watchDataAddedToRegistry", () => { entity.events.watchDataAddedToRegistry(() => {}); });
    it("watchPlatformLineItemTypeSet", () => { entity.events.watchPlatformLineItemTypeSet(() => {}); });
    it("watchPlatformLineItemTypeRemoved", () => { entity.events.watchPlatformLineItemTypeRemoved(() => {}); });
    it("decodeLog decodes a Paused event", () => {
      const pausedSig = keccak256(toHex("Paused(address)"));
      const result = entity.events.decodeLog({
        topics: [pausedSig],
        data: ("0x" + ADDR.slice(2).padStart(64, "0")) as `0x${string}`,
      });
      expect(result.eventName).toBe("Paused");
    });
    it("getLogs with fromBlock/toBlock options", async () => {
      await entity.events.getPlatformEnlistedLogs({ fromBlock: 0n, toBlock: 100n });
      expect(pub.getContractEvents).toHaveBeenCalledWith(expect.objectContaining({ fromBlock: 0n, toBlock: 100n }));
    });
    it("watcher callback invokes handler with decoded logs", () => {
      const captured: WatchContractEventArgs[] = [];
      (pub.watchContractEvent as jest.Mock).mockImplementation((args: WatchContractEventArgs) => { captured.push(args); return () => {}; });
      const handler = jest.fn();
      entity.events.watchPlatformEnlisted(handler);
      const pausedSig = keccak256(toHex("Paused(address)"));
      captured[0].onLogs([{ topics: [pausedSig], data: ("0x" + ADDR.slice(2).padStart(64, "0")) as `0x${string}` }]);
      expect(handler).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ eventName: "Paused" })]));
    });
    it("fetchEventLogs decodes returned logs", async () => {
      const pausedSig = keccak256(toHex("Paused(address)"));
      (pub.getContractEvents as jest.Mock).mockResolvedValueOnce([{ topics: [pausedSig], data: ("0x" + ADDR.slice(2).padStart(64, "0")) as `0x${string}` }]);
      const logs = await entity.events.getPausedLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].eventName).toBe("Paused");
    });
  });
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
  describe("events", () => {
    it("getCampaignCreatedLogs", async () => { await entity.events.getCampaignCreatedLogs(); expect(pub.getContractEvents).toHaveBeenCalled(); });
    it("getCampaignInitializedLogs", async () => { await entity.events.getCampaignInitializedLogs(); });
    it("getOwnershipTransferredLogs", async () => { await entity.events.getOwnershipTransferredLogs(); });
    it("watchCampaignCreated", () => { entity.events.watchCampaignCreated(() => {}); expect(pub.watchContractEvent).toHaveBeenCalled(); });
    it("watchCampaignInitialized", () => { entity.events.watchCampaignInitialized(() => {}); });
    it("watchOwnershipTransferred", () => { entity.events.watchOwnershipTransferred(() => {}); });
    it("decodeLog decodes a CampaignInfoFactoryCampaignInitialized event", () => {
      const sig = keccak256(toHex("CampaignInfoFactoryCampaignInitialized()"));
      const result = entity.events.decodeLog({ topics: [sig], data: "0x" as `0x${string}` });
      expect(result.eventName).toBe("CampaignInfoFactoryCampaignInitialized");
    });
    it("fetchEventLogs decodes returned logs", async () => {
      const sig = keccak256(toHex("CampaignInfoFactoryCampaignInitialized()"));
      (pub.getContractEvents as jest.Mock).mockResolvedValueOnce([{ topics: [sig], data: "0x" as `0x${string}` }]);
      const logs = await entity.events.getCampaignInitializedLogs();
      expect(logs).toHaveLength(1);
    });
    it("watcher callback invokes handler", () => {
      const captured: WatchContractEventArgs[] = [];
      (pub.watchContractEvent as jest.Mock).mockImplementation((args: WatchContractEventArgs) => { captured.push(args); return () => {}; });
      const handler = jest.fn();
      entity.events.watchCampaignCreated(handler);
      const sig = keccak256(toHex("CampaignInfoFactoryCampaignInitialized()"));
      captured[0].onLogs([{ topics: [sig], data: "0x" as `0x${string}` }]);
      expect(handler).toHaveBeenCalled();
    });
  });
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
  describe("events", () => {
    it("getTreasuryDeployedLogs", async () => { await entity.events.getTreasuryDeployedLogs(); expect(pub.getContractEvents).toHaveBeenCalled(); });
    it("getImplementationRegisteredLogs", async () => { await entity.events.getImplementationRegisteredLogs(); });
    it("getImplementationRemovedLogs", async () => { await entity.events.getImplementationRemovedLogs(); });
    it("getImplementationApprovalLogs", async () => { await entity.events.getImplementationApprovalLogs(); });
    it("watchTreasuryDeployed", () => { entity.events.watchTreasuryDeployed(() => {}); expect(pub.watchContractEvent).toHaveBeenCalled(); });
    it("watchImplementationRegistered", () => { entity.events.watchImplementationRegistered(() => {}); });
    it("watchImplementationRemoved", () => { entity.events.watchImplementationRemoved(() => {}); });
    it("watchImplementationApproval", () => { entity.events.watchImplementationApproval(() => {}); });
    it("decodeLog decodes a TreasuryImplementationApproval event", () => {
      const sig = keccak256(toHex("TreasuryImplementationApproval(address,bool)"));
      const implTopic = ("0x" + ADDR.slice(2).padStart(64, "0")) as `0x${string}`;
      const data = ("0x" + "0".repeat(63) + "1") as `0x${string}`;
      const result = entity.events.decodeLog({ topics: [sig, implTopic], data });
      expect(result.eventName).toBe("TreasuryImplementationApproval");
    });
    it("fetchEventLogs decodes returned logs", async () => {
      const sig = keccak256(toHex("TreasuryImplementationApproval(address,bool)"));
      const implTopic = ("0x" + ADDR.slice(2).padStart(64, "0")) as `0x${string}`;
      const data = ("0x" + "0".repeat(63) + "1") as `0x${string}`;
      (pub.getContractEvents as jest.Mock).mockResolvedValueOnce([{ topics: [sig, implTopic], data }]);
      const logs = await entity.events.getImplementationApprovalLogs();
      expect(logs).toHaveLength(1);
    });
    it("watcher callback invokes handler", () => {
      const captured: WatchContractEventArgs[] = [];
      (pub.watchContractEvent as jest.Mock).mockImplementation((args: WatchContractEventArgs) => { captured.push(args); return () => {}; });
      const handler = jest.fn();
      entity.events.watchTreasuryDeployed(handler);
      const sig = keccak256(toHex("TreasuryImplementationApproval(address,bool)"));
      const implTopic = ("0x" + ADDR.slice(2).padStart(64, "0")) as `0x${string}`;
      const data = ("0x" + "0".repeat(63) + "1") as `0x${string}`;
      captured[0].onLogs([{ topics: [sig, implTopic], data }]);
      expect(handler).toHaveBeenCalled();
    });
  });
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

  describe("events", () => {
    it("getDeadlineUpdatedLogs", async () => { await entity.events.getDeadlineUpdatedLogs(); expect(pub.getContractEvents).toHaveBeenCalled(); });
    it("getGoalAmountUpdatedLogs", async () => { await entity.events.getGoalAmountUpdatedLogs(); });
    it("getLaunchTimeUpdatedLogs", async () => { await entity.events.getLaunchTimeUpdatedLogs(); });
    it("getPlatformInfoUpdatedLogs", async () => { await entity.events.getPlatformInfoUpdatedLogs(); });
    it("getSelectedPlatformUpdatedLogs", async () => { await entity.events.getSelectedPlatformUpdatedLogs(); });
    it("getOwnershipTransferredLogs", async () => { await entity.events.getOwnershipTransferredLogs(); });
    it("getPausedLogs", async () => { await entity.events.getPausedLogs(); });
    it("getUnpausedLogs", async () => { await entity.events.getUnpausedLogs(); });
    it("watchDeadlineUpdated", () => { entity.events.watchDeadlineUpdated(() => {}); expect(pub.watchContractEvent).toHaveBeenCalled(); });
    it("watchGoalAmountUpdated", () => { entity.events.watchGoalAmountUpdated(() => {}); });
    it("watchLaunchTimeUpdated", () => { entity.events.watchLaunchTimeUpdated(() => {}); });
    it("watchPlatformInfoUpdated", () => { entity.events.watchPlatformInfoUpdated(() => {}); });
    it("watchSelectedPlatformUpdated", () => { entity.events.watchSelectedPlatformUpdated(() => {}); });
    it("watchOwnershipTransferred", () => { entity.events.watchOwnershipTransferred(() => {}); });
    it("watchPaused", () => { entity.events.watchPaused(() => {}); });
    it("watchUnpaused", () => { entity.events.watchUnpaused(() => {}); });
    it("decodeLog decodes a CampaignInfoDeadlineUpdated event", () => {
      const sig = keccak256(toHex("CampaignInfoDeadlineUpdated(uint256)"));
      const data = ("0x" + "0".repeat(63) + "1") as `0x${string}`;
      const result = entity.events.decodeLog({ topics: [sig], data });
      expect(result.eventName).toBe("CampaignInfoDeadlineUpdated");
    });
    it("fetchEventLogs decodes returned logs", async () => {
      const sig = keccak256(toHex("CampaignInfoDeadlineUpdated(uint256)"));
      const data = ("0x" + "0".repeat(63) + "1") as `0x${string}`;
      (pub.getContractEvents as jest.Mock).mockResolvedValueOnce([{ topics: [sig], data }]);
      const logs = await entity.events.getDeadlineUpdatedLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].eventName).toBe("CampaignInfoDeadlineUpdated");
    });
    it("watcher callback invokes handler", () => {
      const captured: WatchContractEventArgs[] = [];
      (pub.watchContractEvent as jest.Mock).mockImplementation((args: WatchContractEventArgs) => { captured.push(args); return () => {}; });
      const handler = jest.fn();
      entity.events.watchDeadlineUpdated(handler);
      const sig = keccak256(toHex("CampaignInfoDeadlineUpdated(uint256)"));
      const data = ("0x" + "0".repeat(63) + "1") as `0x${string}`;
      captured[0].onLogs([{ topics: [sig], data }]);
      expect(handler).toHaveBeenCalled();
    });
    it("getLogs with fromBlock/toBlock options", async () => {
      await entity.events.getDeadlineUpdatedLogs({ fromBlock: 0n, toBlock: 100n });
      expect(pub.getContractEvents).toHaveBeenCalledWith(expect.objectContaining({ fromBlock: 0n, toBlock: 100n }));
    });
  });
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

  describe("events", () => {
    it("getPaymentCreatedLogs", async () => { await entity.events.getPaymentCreatedLogs(); expect(pub.getContractEvents).toHaveBeenCalled(); });
    it("getPaymentCancelledLogs", async () => { await entity.events.getPaymentCancelledLogs(); });
    it("getPaymentConfirmedLogs", async () => { await entity.events.getPaymentConfirmedLogs(); });
    it("getPaymentBatchConfirmedLogs", async () => { await entity.events.getPaymentBatchConfirmedLogs(); });
    it("getPaymentBatchCreatedLogs", async () => { await entity.events.getPaymentBatchCreatedLogs(); });
    it("getFeesDisbursedLogs", async () => { await entity.events.getFeesDisbursedLogs(); });
    it("getWithdrawalWithFeeSuccessfulLogs", async () => { await entity.events.getWithdrawalWithFeeSuccessfulLogs(); });
    it("getRefundClaimedLogs", async () => { await entity.events.getRefundClaimedLogs(); });
    it("getNonGoalLineItemsClaimedLogs", async () => { await entity.events.getNonGoalLineItemsClaimedLogs(); });
    it("getExpiredFundsClaimedLogs", async () => { await entity.events.getExpiredFundsClaimedLogs(); });
    it("watchPaymentCreated", () => { entity.events.watchPaymentCreated(() => {}); expect(pub.watchContractEvent).toHaveBeenCalled(); });
    it("watchPaymentConfirmed", () => { entity.events.watchPaymentConfirmed(() => {}); });
    it("watchPaymentCancelled", () => { entity.events.watchPaymentCancelled(() => {}); });
    it("watchPaymentBatchConfirmed", () => { entity.events.watchPaymentBatchConfirmed(() => {}); });
    it("watchPaymentBatchCreated", () => { entity.events.watchPaymentBatchCreated(() => {}); });
    it("watchRefundClaimed", () => { entity.events.watchRefundClaimed(() => {}); });
    it("watchFeesDisbursed", () => { entity.events.watchFeesDisbursed(() => {}); });
    it("watchWithdrawalWithFeeSuccessful", () => { entity.events.watchWithdrawalWithFeeSuccessful(() => {}); });
    it("watchNonGoalLineItemsClaimed", () => { entity.events.watchNonGoalLineItemsClaimed(() => {}); });
    it("watchExpiredFundsClaimed", () => { entity.events.watchExpiredFundsClaimed(() => {}); });
    it("decodeLog decodes a PaymentCancelled event", () => {
      const sig = keccak256(toHex("PaymentCancelled(bytes32)"));
      const result = entity.events.decodeLog({ topics: [sig, B32], data: "0x" as `0x${string}` });
      expect(result.eventName).toBe("PaymentCancelled");
    });
    it("fetchEventLogs decodes returned logs", async () => {
      const sig = keccak256(toHex("PaymentCancelled(bytes32)"));
      (pub.getContractEvents as jest.Mock).mockResolvedValueOnce([{ topics: [sig, B32], data: "0x" as `0x${string}` }]);
      const logs = await entity.events.getPaymentCancelledLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].eventName).toBe("PaymentCancelled");
    });
    it("watcher callback invokes handler", () => {
      const captured: WatchContractEventArgs[] = [];
      (pub.watchContractEvent as jest.Mock).mockImplementation((args: WatchContractEventArgs) => { captured.push(args); return () => {}; });
      const handler = jest.fn();
      entity.events.watchPaymentCreated(handler);
      const sig = keccak256(toHex("PaymentCancelled(bytes32)"));
      captured[0].onLogs([{ topics: [sig, B32], data: "0x" as `0x${string}` }]);
      expect(handler).toHaveBeenCalled();
    });
    it("getLogs with fromBlock/toBlock options", async () => {
      await entity.events.getPaymentCreatedLogs({ fromBlock: 0n, toBlock: 100n });
      expect(pub.getContractEvents).toHaveBeenCalledWith(expect.objectContaining({ fromBlock: 0n, toBlock: 100n }));
    });
  });
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

  describe("events", () => {
    it("getReceiptLogs", async () => { await entity.events.getReceiptLogs(); expect(pub.getContractEvents).toHaveBeenCalled(); });
    it("getRefundClaimedLogs", async () => { await entity.events.getRefundClaimedLogs(); });
    it("getWithdrawalSuccessfulLogs", async () => { await entity.events.getWithdrawalSuccessfulLogs(); });
    it("getFeesDisbursedLogs", async () => { await entity.events.getFeesDisbursedLogs(); });
    it("getRewardsAddedLogs", async () => { await entity.events.getRewardsAddedLogs(); });
    it("getRewardRemovedLogs", async () => { await entity.events.getRewardRemovedLogs(); });
    it("getPausedLogs", async () => { await entity.events.getPausedLogs(); });
    it("getUnpausedLogs", async () => { await entity.events.getUnpausedLogs(); });
    it("getTransferLogs", async () => { await entity.events.getTransferLogs(); });
    it("getSuccessConditionNotFulfilledLogs", async () => { await entity.events.getSuccessConditionNotFulfilledLogs(); });
    it("getApprovalLogs", async () => { await entity.events.getApprovalLogs(); });
    it("getApprovalForAllLogs", async () => { await entity.events.getApprovalForAllLogs(); });
    it("watchReceipt", () => { entity.events.watchReceipt(() => {}); expect(pub.watchContractEvent).toHaveBeenCalled(); });
    it("watchRefundClaimed", () => { entity.events.watchRefundClaimed(() => {}); });
    it("watchWithdrawalSuccessful", () => { entity.events.watchWithdrawalSuccessful(() => {}); });
    it("watchFeesDisbursed", () => { entity.events.watchFeesDisbursed(() => {}); });
    it("watchRewardsAdded", () => { entity.events.watchRewardsAdded(() => {}); });
    it("watchRewardRemoved", () => { entity.events.watchRewardRemoved(() => {}); });
    it("watchPaused", () => { entity.events.watchPaused(() => {}); });
    it("watchUnpaused", () => { entity.events.watchUnpaused(() => {}); });
    it("watchTransfer", () => { entity.events.watchTransfer(() => {}); });
    it("watchSuccessConditionNotFulfilled", () => { entity.events.watchSuccessConditionNotFulfilled(() => {}); });
    it("watchApproval", () => { entity.events.watchApproval(() => {}); });
    it("watchApprovalForAll", () => { entity.events.watchApprovalForAll(() => {}); });
    it("decodeLog decodes a SuccessConditionNotFulfilled event", () => {
      const sig = keccak256(toHex("SuccessConditionNotFulfilled()"));
      const result = entity.events.decodeLog({ topics: [sig], data: "0x" as `0x${string}` });
      expect(result.eventName).toBe("SuccessConditionNotFulfilled");
    });
    it("fetchEventLogs decodes returned logs", async () => {
      const sig = keccak256(toHex("SuccessConditionNotFulfilled()"));
      (pub.getContractEvents as jest.Mock).mockResolvedValueOnce([{ topics: [sig], data: "0x" as `0x${string}` }]);
      const logs = await entity.events.getSuccessConditionNotFulfilledLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].eventName).toBe("SuccessConditionNotFulfilled");
    });
    it("watcher callback invokes handler", () => {
      const captured: WatchContractEventArgs[] = [];
      (pub.watchContractEvent as jest.Mock).mockImplementation((args: WatchContractEventArgs) => { captured.push(args); return () => {}; });
      const handler = jest.fn();
      entity.events.watchReceipt(handler);
      const sig = keccak256(toHex("SuccessConditionNotFulfilled()"));
      captured[0].onLogs([{ topics: [sig], data: "0x" as `0x${string}` }]);
      expect(handler).toHaveBeenCalled();
    });
    it("getLogs with fromBlock/toBlock options", async () => {
      await entity.events.getReceiptLogs({ fromBlock: 0n, toBlock: 100n });
      expect(pub.getContractEvents).toHaveBeenCalledWith(expect.objectContaining({ fromBlock: 0n, toBlock: 100n }));
    });
  });
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

  describe("events", () => {
    it("getReceiptLogs", async () => { await entity.events.getReceiptLogs(); expect(pub.getContractEvents).toHaveBeenCalled(); });
    it("getRefundClaimedLogs", async () => { await entity.events.getRefundClaimedLogs(); });
    it("getWithdrawalWithFeeSuccessfulLogs", async () => { await entity.events.getWithdrawalWithFeeSuccessfulLogs(); });
    it("getWithdrawalApprovedLogs", async () => { await entity.events.getWithdrawalApprovedLogs(); });
    it("getFeesDisbursedLogs", async () => { await entity.events.getFeesDisbursedLogs(); });
    it("getTreasuryConfiguredLogs", async () => { await entity.events.getTreasuryConfiguredLogs(); });
    it("getRewardsAddedLogs", async () => { await entity.events.getRewardsAddedLogs(); });
    it("getRewardRemovedLogs", async () => { await entity.events.getRewardRemovedLogs(); });
    it("getTipClaimedLogs", async () => { await entity.events.getTipClaimedLogs(); });
    it("getFundClaimedLogs", async () => { await entity.events.getFundClaimedLogs(); });
    it("getDeadlineUpdatedLogs", async () => { await entity.events.getDeadlineUpdatedLogs(); });
    it("getGoalAmountUpdatedLogs", async () => { await entity.events.getGoalAmountUpdatedLogs(); });
    it("getPaymentGatewayFeeSetLogs", async () => { await entity.events.getPaymentGatewayFeeSetLogs(); });
    it("getPausedLogs", async () => { await entity.events.getPausedLogs(); });
    it("getUnpausedLogs", async () => { await entity.events.getUnpausedLogs(); });
    it("getTransferLogs", async () => { await entity.events.getTransferLogs(); });
    it("getApprovalLogs", async () => { await entity.events.getApprovalLogs(); });
    it("getApprovalForAllLogs", async () => { await entity.events.getApprovalForAllLogs(); });
    it("watchReceipt", () => { entity.events.watchReceipt(() => {}); expect(pub.watchContractEvent).toHaveBeenCalled(); });
    it("watchRefundClaimed", () => { entity.events.watchRefundClaimed(() => {}); });
    it("watchWithdrawalWithFeeSuccessful", () => { entity.events.watchWithdrawalWithFeeSuccessful(() => {}); });
    it("watchWithdrawalApproved", () => { entity.events.watchWithdrawalApproved(() => {}); });
    it("watchFeesDisbursed", () => { entity.events.watchFeesDisbursed(() => {}); });
    it("watchTreasuryConfigured", () => { entity.events.watchTreasuryConfigured(() => {}); });
    it("watchRewardsAdded", () => { entity.events.watchRewardsAdded(() => {}); });
    it("watchRewardRemoved", () => { entity.events.watchRewardRemoved(() => {}); });
    it("watchTipClaimed", () => { entity.events.watchTipClaimed(() => {}); });
    it("watchFundClaimed", () => { entity.events.watchFundClaimed(() => {}); });
    it("watchDeadlineUpdated", () => { entity.events.watchDeadlineUpdated(() => {}); });
    it("watchGoalAmountUpdated", () => { entity.events.watchGoalAmountUpdated(() => {}); });
    it("watchPaymentGatewayFeeSet", () => { entity.events.watchPaymentGatewayFeeSet(() => {}); });
    it("watchPaused", () => { entity.events.watchPaused(() => {}); });
    it("watchUnpaused", () => { entity.events.watchUnpaused(() => {}); });
    it("watchTransfer", () => { entity.events.watchTransfer(() => {}); });
    it("watchApproval", () => { entity.events.watchApproval(() => {}); });
    it("watchApprovalForAll", () => { entity.events.watchApprovalForAll(() => {}); });
    it("decodeLog decodes a WithdrawalApproved event", () => {
      const sig = keccak256(toHex("WithdrawalApproved()"));
      const result = entity.events.decodeLog({ topics: [sig], data: "0x" as `0x${string}` });
      expect(result.eventName).toBe("WithdrawalApproved");
    });
    it("fetchEventLogs decodes returned logs", async () => {
      const sig = keccak256(toHex("WithdrawalApproved()"));
      (pub.getContractEvents as jest.Mock).mockResolvedValueOnce([{ topics: [sig], data: "0x" as `0x${string}` }]);
      const logs = await entity.events.getWithdrawalApprovedLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].eventName).toBe("WithdrawalApproved");
    });
    it("watcher callback invokes handler", () => {
      const captured: WatchContractEventArgs[] = [];
      (pub.watchContractEvent as jest.Mock).mockImplementation((args: WatchContractEventArgs) => { captured.push(args); return () => {}; });
      const handler = jest.fn();
      entity.events.watchReceipt(handler);
      const sig = keccak256(toHex("WithdrawalApproved()"));
      captured[0].onLogs([{ topics: [sig], data: "0x" as `0x${string}` }]);
      expect(handler).toHaveBeenCalled();
    });
    it("getLogs with fromBlock/toBlock options", async () => {
      await entity.events.getReceiptLogs({ fromBlock: 0n, toBlock: 100n });
      expect(pub.getContractEvents).toHaveBeenCalledWith(expect.objectContaining({ fromBlock: 0n, toBlock: 100n }));
    });
  });
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
  describe("events", () => {
    it("getItemAddedLogs", async () => { await entity.events.getItemAddedLogs(); expect(pub.getContractEvents).toHaveBeenCalled(); });
    it("watchItemAdded", () => { entity.events.watchItemAdded(() => {}); expect(pub.watchContractEvent).toHaveBeenCalled(); });
    it("decodeLog decodes an ItemAdded event", () => {
      const sig = keccak256(toHex("ItemAdded(address,bytes32,(uint256,uint256,uint256,uint256,bytes32,bytes32))"));
      const ownerTopic = ("0x" + ADDR.slice(2).padStart(64, "0")) as `0x${string}`;
      const tupleData = ("0x" + "0".repeat(64).repeat(6)) as `0x${string}`;
      const result = entity.events.decodeLog({ topics: [sig, ownerTopic, B32], data: tupleData });
      expect(result.eventName).toBe("ItemAdded");
    });
    it("fetchEventLogs decodes returned logs", async () => {
      const sig = keccak256(toHex("ItemAdded(address,bytes32,(uint256,uint256,uint256,uint256,bytes32,bytes32))"));
      const ownerTopic = ("0x" + ADDR.slice(2).padStart(64, "0")) as `0x${string}`;
      const tupleData = ("0x" + "0".repeat(64).repeat(6)) as `0x${string}`;
      (pub.getContractEvents as jest.Mock).mockResolvedValueOnce([{ topics: [sig, ownerTopic, B32], data: tupleData }]);
      const logs = await entity.events.getItemAddedLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].eventName).toBe("ItemAdded");
    });
    it("watcher callback invokes handler", () => {
      const captured: WatchContractEventArgs[] = [];
      (pub.watchContractEvent as jest.Mock).mockImplementation((args: WatchContractEventArgs) => { captured.push(args); return () => {}; });
      const handler = jest.fn();
      entity.events.watchItemAdded(handler);
      const sig = keccak256(toHex("ItemAdded(address,bytes32,(uint256,uint256,uint256,uint256,bytes32,bytes32))"));
      const ownerTopic = ("0x" + ADDR.slice(2).padStart(64, "0")) as `0x${string}`;
      const tupleData = ("0x" + "0".repeat(64).repeat(6)) as `0x${string}`;
      captured[0].onLogs([{ topics: [sig, ownerTopic, B32], data: tupleData }]);
      expect(handler).toHaveBeenCalled();
    });
    it("getLogs with fromBlock/toBlock options", async () => {
      await entity.events.getItemAddedLogs({ fromBlock: 0n, toBlock: 100n });
      expect(pub.getContractEvents).toHaveBeenCalledWith(expect.objectContaining({ fromBlock: 0n, toBlock: 100n }));
    });
  });
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
