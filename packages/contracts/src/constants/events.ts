/**
 * Type-safe event name constants for every contract in the SDK.
 *
 * Use these instead of string literals when filtering or comparing
 * decoded event names from transaction receipts:
 *
 * @example
 * ```typescript
 * import { GLOBAL_PARAMS_EVENTS } from "@oaknetwork/contracts-sdk";
 *
 * if (decoded.eventName === GLOBAL_PARAMS_EVENTS.PlatformEnlisted) { ... }
 * ```
 */

/** Event names emitted by the GlobalParams contract. */
export const GLOBAL_PARAMS_EVENTS = {
  DataAddedToRegistry: "DataAddedToRegistry",
  OwnershipTransferred: "OwnershipTransferred",
  Paused: "Paused",
  PlatformAdminAddressUpdated: "PlatformAdminAddressUpdated",
  PlatformAdapterSet: "PlatformAdapterSet",
  PlatformClaimDelayUpdated: "PlatformClaimDelayUpdated",
  PlatformDataAdded: "PlatformDataAdded",
  PlatformDataRemoved: "PlatformDataRemoved",
  PlatformDelisted: "PlatformDelisted",
  PlatformEnlisted: "PlatformEnlisted",
  PlatformLineItemTypeRemoved: "PlatformLineItemTypeRemoved",
  PlatformLineItemTypeSet: "PlatformLineItemTypeSet",
  ProtocolAdminAddressUpdated: "ProtocolAdminAddressUpdated",
  ProtocolFeePercentUpdated: "ProtocolFeePercentUpdated",
  TokenAddedToCurrency: "TokenAddedToCurrency",
  TokenRemovedFromCurrency: "TokenRemovedFromCurrency",
  Unpaused: "Unpaused",
} as const;

/** Event names emitted by the CampaignInfoFactory contract. */
export const CAMPAIGN_INFO_FACTORY_EVENTS = {
  CampaignCreated: "CampaignInfoFactoryCampaignCreated",
  CampaignInitialized: "CampaignInfoFactoryCampaignInitialized",
  OwnershipTransferred: "OwnershipTransferred",
} as const;

/** Event names emitted by the CampaignInfo contract. */
export const CAMPAIGN_INFO_EVENTS = {
  DeadlineUpdated: "CampaignInfoDeadlineUpdated",
  GoalAmountUpdated: "CampaignInfoGoalAmountUpdated",
  LaunchTimeUpdated: "CampaignInfoLaunchTimeUpdated",
  PlatformInfoUpdated: "CampaignInfoPlatformInfoUpdated",
  SelectedPlatformUpdated: "CampaignInfoSelectedPlatformUpdated",
  OwnershipTransferred: "OwnershipTransferred",
  Paused: "Paused",
  Unpaused: "Unpaused",
} as const;

/** Event names emitted by the TreasuryFactory contract. */
export const TREASURY_FACTORY_EVENTS = {
  TreasuryDeployed: "TreasuryFactoryTreasuryDeployed",
  ImplementationRegistered: "TreasuryImplementationRegistered",
  ImplementationRemoved: "TreasuryImplementationRemoved",
  ImplementationApproval: "TreasuryImplementationApproval",
} as const;

/** Event names emitted by the AllOrNothing treasury contract. */
export const ALL_OR_NOTHING_EVENTS = {
  Approval: "Approval",
  ApprovalForAll: "ApprovalForAll",
  FeesDisbursed: "FeesDisbursed",
  Paused: "Paused",
  Receipt: "Receipt",
  RefundClaimed: "RefundClaimed",
  RewardsAdded: "RewardsAdded",
  RewardRemoved: "RewardRemoved",
  SuccessConditionNotFulfilled: "SuccessConditionNotFulfilled",
  Transfer: "Transfer",
  Unpaused: "Unpaused",
  WithdrawalSuccessful: "WithdrawalSuccessful",
} as const;

/** Event names emitted by the KeepWhatsRaised treasury contract. */
export const KEEP_WHATS_RAISED_EVENTS = {
  Approval: "Approval",
  ApprovalForAll: "ApprovalForAll",
  DeadlineUpdated: "KeepWhatsRaisedDeadlineUpdated",
  FeesDisbursed: "FeesDisbursed",
  FundClaimed: "FundClaimed",
  GoalAmountUpdated: "KeepWhatsRaisedGoalAmountUpdated",
  Paused: "Paused",
  PaymentGatewayFeeSet: "KeepWhatsRaisedPaymentGatewayFeeSet",
  Receipt: "Receipt",
  RefundClaimed: "RefundClaimed",
  RewardsAdded: "RewardsAdded",
  RewardRemoved: "RewardRemoved",
  TipClaimed: "TipClaimed",
  Transfer: "Transfer",
  TreasuryConfigured: "TreasuryConfigured",
  Unpaused: "Unpaused",
  WithdrawalApproved: "WithdrawalApproved",
  WithdrawalWithFeeSuccessful: "WithdrawalWithFeeSuccessful",
} as const;

/** Event names emitted by the PaymentTreasury contract. */
export const PAYMENT_TREASURY_EVENTS = {
  ExpiredFundsClaimed: "ExpiredFundsClaimed",
  FeesDisbursed: "FeesDisbursed",
  NonGoalLineItemsClaimed: "NonGoalLineItemsClaimed",
  Paused: "Paused",
  PaymentBatchConfirmed: "PaymentBatchConfirmed",
  PaymentBatchCreated: "PaymentBatchCreated",
  PaymentCancelled: "PaymentCancelled",
  PaymentConfirmed: "PaymentConfirmed",
  PaymentCreated: "PaymentCreated",
  RefundClaimed: "RefundClaimed",
  Unpaused: "Unpaused",
  WithdrawalWithFeeSuccessful: "WithdrawalWithFeeSuccessful",
} as const;

/** Event names emitted by the ItemRegistry contract. */
export const ITEM_REGISTRY_EVENTS = {
  ItemAdded: "ItemAdded",
} as const;
