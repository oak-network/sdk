import {
  GLOBAL_PARAMS_EVENTS,
  CAMPAIGN_INFO_FACTORY_EVENTS,
  CAMPAIGN_INFO_EVENTS,
  TREASURY_FACTORY_EVENTS,
  ALL_OR_NOTHING_EVENTS,
  KEEP_WHATS_RAISED_EVENTS,
  PAYMENT_TREASURY_EVENTS,
  ITEM_REGISTRY_EVENTS,
} from "../../src/constants/events";
import { BPS_DENOMINATOR } from "../../src/constants/fees";
import {
  DATA_REGISTRY_KEYS,
  scopedToPlatform,
} from "../../src/constants/registry";
import { BYTES32_ZERO } from "../../src/constants/encoding";

describe("Constants — event name maps", () => {
  it("GLOBAL_PARAMS_EVENTS has expected keys", () => {
    expect(GLOBAL_PARAMS_EVENTS.PlatformEnlisted).toBe("PlatformEnlisted");
    expect(GLOBAL_PARAMS_EVENTS.ProtocolFeePercentUpdated).toBe("ProtocolFeePercentUpdated");
    expect(GLOBAL_PARAMS_EVENTS.PlatformDelisted).toBe("PlatformDelisted");
    expect(GLOBAL_PARAMS_EVENTS.OwnershipTransferred).toBe("OwnershipTransferred");
    expect(GLOBAL_PARAMS_EVENTS.Paused).toBe("Paused");
    expect(GLOBAL_PARAMS_EVENTS.Unpaused).toBe("Unpaused");
    expect(GLOBAL_PARAMS_EVENTS.PlatformAdminAddressUpdated).toBe("PlatformAdminAddressUpdated");
    expect(GLOBAL_PARAMS_EVENTS.PlatformAdapterSet).toBe("PlatformAdapterSet");
    expect(GLOBAL_PARAMS_EVENTS.PlatformClaimDelayUpdated).toBe("PlatformClaimDelayUpdated");
    expect(GLOBAL_PARAMS_EVENTS.PlatformDataAdded).toBe("PlatformDataAdded");
    expect(GLOBAL_PARAMS_EVENTS.PlatformDataRemoved).toBe("PlatformDataRemoved");
    expect(GLOBAL_PARAMS_EVENTS.PlatformLineItemTypeRemoved).toBe("PlatformLineItemTypeRemoved");
    expect(GLOBAL_PARAMS_EVENTS.PlatformLineItemTypeSet).toBe("PlatformLineItemTypeSet");
    expect(GLOBAL_PARAMS_EVENTS.ProtocolAdminAddressUpdated).toBe("ProtocolAdminAddressUpdated");
    expect(GLOBAL_PARAMS_EVENTS.TokenAddedToCurrency).toBe("TokenAddedToCurrency");
    expect(GLOBAL_PARAMS_EVENTS.TokenRemovedFromCurrency).toBe("TokenRemovedFromCurrency");
    expect(GLOBAL_PARAMS_EVENTS.DataAddedToRegistry).toBe("DataAddedToRegistry");
  });

  it("CAMPAIGN_INFO_FACTORY_EVENTS has expected keys", () => {
    expect(CAMPAIGN_INFO_FACTORY_EVENTS.CampaignCreated).toBe("CampaignInfoFactoryCampaignCreated");
    expect(CAMPAIGN_INFO_FACTORY_EVENTS.CampaignInitialized).toBe("CampaignInfoFactoryCampaignInitialized");
    expect(CAMPAIGN_INFO_FACTORY_EVENTS.OwnershipTransferred).toBe("OwnershipTransferred");
  });

  it("CAMPAIGN_INFO_EVENTS has expected keys", () => {
    expect(CAMPAIGN_INFO_EVENTS.DeadlineUpdated).toBe("CampaignInfoDeadlineUpdated");
    expect(CAMPAIGN_INFO_EVENTS.GoalAmountUpdated).toBe("CampaignInfoGoalAmountUpdated");
    expect(CAMPAIGN_INFO_EVENTS.LaunchTimeUpdated).toBe("CampaignInfoLaunchTimeUpdated");
    expect(CAMPAIGN_INFO_EVENTS.Cancelled).toBe("Cancelled");
    expect(CAMPAIGN_INFO_EVENTS.Paused).toBe("Paused");
    expect(CAMPAIGN_INFO_EVENTS.Unpaused).toBe("Unpaused");
    expect(CAMPAIGN_INFO_EVENTS.PledgeNFTMinted).toBe("PledgeNFTMinted");
    expect(CAMPAIGN_INFO_EVENTS.SelectedPlatformUpdated).toBe("CampaignInfoSelectedPlatformUpdated");
    expect(CAMPAIGN_INFO_EVENTS.PlatformInfoUpdated).toBe("CampaignInfoPlatformInfoUpdated");
    expect(CAMPAIGN_INFO_EVENTS.ContractURIUpdated).toBe("ContractURIUpdated");
    expect(CAMPAIGN_INFO_EVENTS.ImageURIUpdated).toBe("ImageURIUpdated");
    expect(CAMPAIGN_INFO_EVENTS.OwnershipTransferred).toBe("OwnershipTransferred");
  });

  it("TREASURY_FACTORY_EVENTS has expected keys", () => {
    expect(TREASURY_FACTORY_EVENTS.TreasuryDeployed).toBe("TreasuryFactoryTreasuryDeployed");
    expect(TREASURY_FACTORY_EVENTS.ImplementationRegistered).toBe("TreasuryImplementationRegistered");
    expect(TREASURY_FACTORY_EVENTS.ImplementationRemoved).toBe("TreasuryImplementationRemoved");
    expect(TREASURY_FACTORY_EVENTS.ImplementationApproval).toBe("TreasuryImplementationApproval");
  });

  it("ALL_OR_NOTHING_EVENTS has expected keys", () => {
    expect(ALL_OR_NOTHING_EVENTS.Receipt).toBe("Receipt");
    expect(ALL_OR_NOTHING_EVENTS.FeesDisbursed).toBe("FeesDisbursed");
    expect(ALL_OR_NOTHING_EVENTS.Cancelled).toBe("Cancelled");
    expect(ALL_OR_NOTHING_EVENTS.Paused).toBe("Paused");
    expect(ALL_OR_NOTHING_EVENTS.Unpaused).toBe("Unpaused");
    expect(ALL_OR_NOTHING_EVENTS.RefundClaimed).toBe("RefundClaimed");
    expect(ALL_OR_NOTHING_EVENTS.RewardsAdded).toBe("RewardsAdded");
    expect(ALL_OR_NOTHING_EVENTS.RewardRemoved).toBe("RewardRemoved");
    expect(ALL_OR_NOTHING_EVENTS.SuccessConditionNotFulfilled).toBe("SuccessConditionNotFulfilled");
    expect(ALL_OR_NOTHING_EVENTS.WithdrawalSuccessful).toBe("WithdrawalSuccessful");
  });

  it("KEEP_WHATS_RAISED_EVENTS has expected keys", () => {
    expect(KEEP_WHATS_RAISED_EVENTS.Receipt).toBe("Receipt");
    expect(KEEP_WHATS_RAISED_EVENTS.FeesDisbursed).toBe("FeesDisbursed");
    expect(KEEP_WHATS_RAISED_EVENTS.FundClaimed).toBe("FundClaimed");
    expect(KEEP_WHATS_RAISED_EVENTS.TipClaimed).toBe("TipClaimed");
    expect(KEEP_WHATS_RAISED_EVENTS.RefundClaimed).toBe("RefundClaimed");
    expect(KEEP_WHATS_RAISED_EVENTS.RewardsAdded).toBe("RewardsAdded");
    expect(KEEP_WHATS_RAISED_EVENTS.RewardRemoved).toBe("RewardRemoved");
    expect(KEEP_WHATS_RAISED_EVENTS.Cancelled).toBe("Cancelled");
    expect(KEEP_WHATS_RAISED_EVENTS.Paused).toBe("Paused");
    expect(KEEP_WHATS_RAISED_EVENTS.Unpaused).toBe("Unpaused");
    expect(KEEP_WHATS_RAISED_EVENTS.DeadlineUpdated).toBe("KeepWhatsRaisedDeadlineUpdated");
    expect(KEEP_WHATS_RAISED_EVENTS.GoalAmountUpdated).toBe("KeepWhatsRaisedGoalAmountUpdated");
    expect(KEEP_WHATS_RAISED_EVENTS.PaymentGatewayFeeSet).toBe("KeepWhatsRaisedPaymentGatewayFeeSet");
    expect(KEEP_WHATS_RAISED_EVENTS.TreasuryConfigured).toBe("TreasuryConfigured");
    expect(KEEP_WHATS_RAISED_EVENTS.WithdrawalApproved).toBe("WithdrawalApproved");
    expect(KEEP_WHATS_RAISED_EVENTS.WithdrawalWithFeeSuccessful).toBe("WithdrawalWithFeeSuccessful");
  });

  it("PAYMENT_TREASURY_EVENTS has expected keys", () => {
    expect(PAYMENT_TREASURY_EVENTS.PaymentCreated).toBe("PaymentCreated");
    expect(PAYMENT_TREASURY_EVENTS.PaymentConfirmed).toBe("PaymentConfirmed");
    expect(PAYMENT_TREASURY_EVENTS.PaymentCancelled).toBe("PaymentCancelled");
    expect(PAYMENT_TREASURY_EVENTS.PaymentBatchCreated).toBe("PaymentBatchCreated");
    expect(PAYMENT_TREASURY_EVENTS.PaymentBatchConfirmed).toBe("PaymentBatchConfirmed");
    expect(PAYMENT_TREASURY_EVENTS.FeesDisbursed).toBe("FeesDisbursed");
    expect(PAYMENT_TREASURY_EVENTS.Cancelled).toBe("Cancelled");
    expect(PAYMENT_TREASURY_EVENTS.Paused).toBe("Paused");
    expect(PAYMENT_TREASURY_EVENTS.Unpaused).toBe("Unpaused");
    expect(PAYMENT_TREASURY_EVENTS.RefundClaimed).toBe("RefundClaimed");
    expect(PAYMENT_TREASURY_EVENTS.WithdrawalWithFeeSuccessful).toBe("WithdrawalWithFeeSuccessful");
    expect(PAYMENT_TREASURY_EVENTS.ExpiredFundsClaimed).toBe("ExpiredFundsClaimed");
    expect(PAYMENT_TREASURY_EVENTS.NonGoalLineItemsClaimed).toBe("NonGoalLineItemsClaimed");
  });

  it("ITEM_REGISTRY_EVENTS has expected keys", () => {
    expect(ITEM_REGISTRY_EVENTS.ItemAdded).toBe("ItemAdded");
  });
});

describe("Constants — fees", () => {
  it("BPS_DENOMINATOR is 10_000n", () => {
    expect(BPS_DENOMINATOR).toBe(10_000n);
  });
});

describe("Constants — registry", () => {
  it("DATA_REGISTRY_KEYS are 32-byte hex hashes", () => {
    expect(DATA_REGISTRY_KEYS.BUFFER_TIME).toMatch(/^0x[0-9a-fA-F]{64}$/);
    expect(DATA_REGISTRY_KEYS.MAX_PAYMENT_EXPIRATION).toMatch(/^0x[0-9a-fA-F]{64}$/);
    expect(DATA_REGISTRY_KEYS.CAMPAIGN_LAUNCH_BUFFER).toMatch(/^0x[0-9a-fA-F]{64}$/);
    expect(DATA_REGISTRY_KEYS.MINIMUM_CAMPAIGN_DURATION).toMatch(/^0x[0-9a-fA-F]{64}$/);
  });

  it("keys are distinct", () => {
    const values = Object.values(DATA_REGISTRY_KEYS);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });

  it("scopedToPlatform returns a 32-byte hash", () => {
    const scoped = scopedToPlatform(DATA_REGISTRY_KEYS.BUFFER_TIME, BYTES32_ZERO);
    expect(scoped).toMatch(/^0x[0-9a-fA-F]{64}$/);
  });

  it("scopedToPlatform returns different results for different platform hashes", () => {
    const a = scopedToPlatform(DATA_REGISTRY_KEYS.BUFFER_TIME, BYTES32_ZERO);
    const differentPlatform = "0x0000000000000000000000000000000000000000000000000000000000000001" as `0x${string}`;
    const b = scopedToPlatform(DATA_REGISTRY_KEYS.BUFFER_TIME, differentPlatform);
    expect(a).not.toBe(b);
  });

  it("scopedToPlatform is deterministic", () => {
    const a = scopedToPlatform(DATA_REGISTRY_KEYS.BUFFER_TIME, BYTES32_ZERO);
    const b = scopedToPlatform(DATA_REGISTRY_KEYS.BUFFER_TIME, BYTES32_ZERO);
    expect(a).toBe(b);
  });
});
