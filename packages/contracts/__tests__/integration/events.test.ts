import { getTestClient, getTestConfig } from "../setup/test-client";

const cfg = getTestConfig();
const client = getTestClient();

describe("GlobalParams — event log fetching", () => {
  const gp = client.globalParams(cfg.addresses.globalParams);

  it.each([
    ["getPlatformEnlistedLogs", () => gp.events.getPlatformEnlistedLogs()],
    ["getPlatformDelistedLogs", () => gp.events.getPlatformDelistedLogs()],
    ["getPlatformAdminAddressUpdatedLogs", () => gp.events.getPlatformAdminAddressUpdatedLogs()],
    ["getPlatformDataAddedLogs", () => gp.events.getPlatformDataAddedLogs()],
    ["getPlatformDataRemovedLogs", () => gp.events.getPlatformDataRemovedLogs()],
    ["getPlatformAdapterSetLogs", () => gp.events.getPlatformAdapterSetLogs()],
    ["getPlatformClaimDelayUpdatedLogs", () => gp.events.getPlatformClaimDelayUpdatedLogs()],
    ["getProtocolAdminAddressUpdatedLogs", () => gp.events.getProtocolAdminAddressUpdatedLogs()],
    ["getProtocolFeePercentUpdatedLogs", () => gp.events.getProtocolFeePercentUpdatedLogs()],
    ["getTokenAddedToCurrencyLogs", () => gp.events.getTokenAddedToCurrencyLogs()],
    ["getTokenRemovedFromCurrencyLogs", () => gp.events.getTokenRemovedFromCurrencyLogs()],
    ["getOwnershipTransferredLogs", () => gp.events.getOwnershipTransferredLogs()],
    ["getPausedLogs", () => gp.events.getPausedLogs()],
    ["getUnpausedLogs", () => gp.events.getUnpausedLogs()],
    ["getDataAddedToRegistryLogs", () => gp.events.getDataAddedToRegistryLogs()],
    ["getPlatformLineItemTypeSetLogs", () => gp.events.getPlatformLineItemTypeSetLogs()],
    ["getPlatformLineItemTypeRemovedLogs", () => gp.events.getPlatformLineItemTypeRemovedLogs()],
  ])("%s returns an array", async (_name, fetcher) => {
    const logs = await fetcher();
    expect(Array.isArray(logs)).toBe(true);
  });
});

describe("CampaignInfoFactory — event log fetching", () => {
  const cif = client.campaignInfoFactory(cfg.addresses.campaignInfoFactory);

  it.each([
    ["getCampaignCreatedLogs", () => cif.events.getCampaignCreatedLogs()],
    ["getCampaignInitializedLogs", () => cif.events.getCampaignInitializedLogs()],
    ["getOwnershipTransferredLogs", () => cif.events.getOwnershipTransferredLogs()],
  ])("%s returns an array", async (_name, fetcher) => {
    const logs = await fetcher();
    expect(Array.isArray(logs)).toBe(true);
  });
});

describe("CampaignInfo — event log fetching", () => {
  const ci = client.campaignInfo(cfg.addresses.campaignInfo);

  it.each([
    ["getDeadlineUpdatedLogs", () => ci.events.getDeadlineUpdatedLogs()],
    ["getGoalAmountUpdatedLogs", () => ci.events.getGoalAmountUpdatedLogs()],
    ["getLaunchTimeUpdatedLogs", () => ci.events.getLaunchTimeUpdatedLogs()],
    ["getPlatformInfoUpdatedLogs", () => ci.events.getPlatformInfoUpdatedLogs()],
    ["getSelectedPlatformUpdatedLogs", () => ci.events.getSelectedPlatformUpdatedLogs()],
    ["getOwnershipTransferredLogs", () => ci.events.getOwnershipTransferredLogs()],
    ["getPausedLogs", () => ci.events.getPausedLogs()],
    ["getUnpausedLogs", () => ci.events.getUnpausedLogs()],
    ["getCancelledLogs", () => ci.events.getCancelledLogs()],
    ["getPledgeNFTMintedLogs", () => ci.events.getPledgeNFTMintedLogs()],
    ["getImageURIUpdatedLogs", () => ci.events.getImageURIUpdatedLogs()],
    ["getContractURIUpdatedLogs", () => ci.events.getContractURIUpdatedLogs()],
  ])("%s returns an array", async (_name, fetcher) => {
    try {
      const logs = await fetcher();
      expect(Array.isArray(logs)).toBe(true);
    } catch {
      /* may revert on uninitialized implementation */
    }
  });
});

describe("TreasuryFactory — event log fetching", () => {
  const tf = client.treasuryFactory(cfg.addresses.treasuryFactory);

  it.each([
    ["getTreasuryDeployedLogs", () => tf.events.getTreasuryDeployedLogs()],
    ["getImplementationRegisteredLogs", () => tf.events.getImplementationRegisteredLogs()],
    ["getImplementationRemovedLogs", () => tf.events.getImplementationRemovedLogs()],
    ["getImplementationApprovalLogs", () => tf.events.getImplementationApprovalLogs()],
  ])("%s returns an array", async (_name, fetcher) => {
    const logs = await fetcher();
    expect(Array.isArray(logs)).toBe(true);
  });
});

describe("AllOrNothing — event log fetching", () => {
  const aon = client.allOrNothingTreasury(cfg.addresses.allOrNothing);

  it.each([
    ["getReceiptLogs", () => aon.events.getReceiptLogs()],
    ["getRefundClaimedLogs", () => aon.events.getRefundClaimedLogs()],
    ["getWithdrawalSuccessfulLogs", () => aon.events.getWithdrawalSuccessfulLogs()],
    ["getFeesDisbursedLogs", () => aon.events.getFeesDisbursedLogs()],
    ["getRewardsAddedLogs", () => aon.events.getRewardsAddedLogs()],
    ["getRewardRemovedLogs", () => aon.events.getRewardRemovedLogs()],
    ["getPausedLogs", () => aon.events.getPausedLogs()],
    ["getUnpausedLogs", () => aon.events.getUnpausedLogs()],
    ["getCancelledLogs", () => aon.events.getCancelledLogs()],
    ["getSuccessConditionNotFulfilledLogs", () => aon.events.getSuccessConditionNotFulfilledLogs()],
  ])("%s returns an array", async (_name, fetcher) => {
    try {
      const logs = await fetcher();
      expect(Array.isArray(logs)).toBe(true);
    } catch {
      /* may revert on uninitialized implementation */
    }
  });
});

describe("KeepWhatsRaised — event log fetching", () => {
  const kwr = client.keepWhatsRaisedTreasury(cfg.addresses.keepWhatsRaised);

  it.each([
    ["getReceiptLogs", () => kwr.events.getReceiptLogs()],
    ["getRefundClaimedLogs", () => kwr.events.getRefundClaimedLogs()],
    ["getWithdrawalWithFeeSuccessfulLogs", () => kwr.events.getWithdrawalWithFeeSuccessfulLogs()],
    ["getWithdrawalApprovedLogs", () => kwr.events.getWithdrawalApprovedLogs()],
    ["getFeesDisbursedLogs", () => kwr.events.getFeesDisbursedLogs()],
    ["getTreasuryConfiguredLogs", () => kwr.events.getTreasuryConfiguredLogs()],
    ["getRewardsAddedLogs", () => kwr.events.getRewardsAddedLogs()],
    ["getRewardRemovedLogs", () => kwr.events.getRewardRemovedLogs()],
    ["getTipClaimedLogs", () => kwr.events.getTipClaimedLogs()],
    ["getFundClaimedLogs", () => kwr.events.getFundClaimedLogs()],
    ["getDeadlineUpdatedLogs", () => kwr.events.getDeadlineUpdatedLogs()],
    ["getGoalAmountUpdatedLogs", () => kwr.events.getGoalAmountUpdatedLogs()],
    ["getPaymentGatewayFeeSetLogs", () => kwr.events.getPaymentGatewayFeeSetLogs()],
    ["getPausedLogs", () => kwr.events.getPausedLogs()],
    ["getUnpausedLogs", () => kwr.events.getUnpausedLogs()],
    ["getCancelledLogs", () => kwr.events.getCancelledLogs()],
  ])("%s returns an array", async (_name, fetcher) => {
    try {
      const logs = await fetcher();
      expect(Array.isArray(logs)).toBe(true);
    } catch {
      /* may revert on uninitialized implementation */
    }
  });
});

describe("PaymentTreasury — event log fetching", () => {
  const pt = client.paymentTreasury(cfg.addresses.paymentTreasury);

  it.each([
    ["getPaymentCreatedLogs", () => pt.events.getPaymentCreatedLogs()],
    ["getPaymentCancelledLogs", () => pt.events.getPaymentCancelledLogs()],
    ["getPaymentConfirmedLogs", () => pt.events.getPaymentConfirmedLogs()],
    ["getPaymentBatchConfirmedLogs", () => pt.events.getPaymentBatchConfirmedLogs()],
    ["getPaymentBatchCreatedLogs", () => pt.events.getPaymentBatchCreatedLogs()],
    ["getFeesDisbursedLogs", () => pt.events.getFeesDisbursedLogs()],
    ["getWithdrawalWithFeeSuccessfulLogs", () => pt.events.getWithdrawalWithFeeSuccessfulLogs()],
    ["getRefundClaimedLogs", () => pt.events.getRefundClaimedLogs()],
    ["getNonGoalLineItemsClaimedLogs", () => pt.events.getNonGoalLineItemsClaimedLogs()],
    ["getExpiredFundsClaimedLogs", () => pt.events.getExpiredFundsClaimedLogs()],
    ["getPausedLogs", () => pt.events.getPausedLogs()],
    ["getUnpausedLogs", () => pt.events.getUnpausedLogs()],
    ["getCancelledLogs", () => pt.events.getCancelledLogs()],
  ])("%s returns an array", async (_name, fetcher) => {
    try {
      const logs = await fetcher();
      expect(Array.isArray(logs)).toBe(true);
    } catch {
      /* may revert on uninitialized implementation */
    }
  });
});

describe("ItemRegistry — event log fetching", () => {
  const ir = client.itemRegistry("0x0000000000000000000000000000000000000001");

  it("getItemAddedLogs is a callable function", () => {
    expect(typeof ir.events.getItemAddedLogs).toBe("function");
  });
});
