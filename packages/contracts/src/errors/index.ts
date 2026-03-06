export type { ContractErrorBase } from "./contract-error.js";
export { parseContractError } from "./parse-contract-error.js";

export {
  GlobalParamsCurrencyHasNoTokensError,
  GlobalParamsCurrencyTokenLengthMismatchError,
  GlobalParamsInvalidInputError,
  GlobalParamsPlatformAdminNotSetError,
  GlobalParamsPlatformAlreadyListedError,
  GlobalParamsPlatformDataAlreadySetError,
  GlobalParamsPlatformDataNotSetError,
  GlobalParamsPlatformDataSlotTakenError,
  GlobalParamsPlatformFeePercentIsZeroError,
  GlobalParamsPlatformLineItemTypeNotFoundError,
  GlobalParamsPlatformNotListedError,
  GlobalParamsTokenNotInCurrencyError,
  GlobalParamsUnauthorizedError,
} from "./global-params.js";
export type { GlobalParamsError } from "./global-params.js";

export {
  CampaignInfoFactoryCampaignInitializationFailedError,
  CampaignInfoFactoryCampaignWithSameIdentifierExistsError,
  CampaignInfoFactoryInvalidInputError,
  CampaignInfoFactoryPlatformNotListedError,
  CampaignInfoInvalidTokenListError,
} from "./campaign-info-factory.js";
export type { CampaignInfoFactoryError } from "./campaign-info-factory.js";

export {
  CampaignInfoInvalidInputError,
  CampaignInfoInvalidPlatformUpdateError,
  CampaignInfoIsLockedError,
  CampaignInfoPlatformAlreadyApprovedError,
  CampaignInfoPlatformNotSelectedError,
  CampaignInfoUnauthorizedError,
} from "./campaign-info.js";
export type { CampaignInfoError } from "./campaign-info.js";

export {
  AllOrNothingFeeAlreadyDisbursedError,
  AllOrNothingFeeNotDisbursedError,
  AllOrNothingInvalidInputError,
  AllOrNothingNotClaimableError,
  AllOrNothingNotSuccessfulError,
  AllOrNothingRewardExistsError,
  AllOrNothingTokenNotAcceptedError,
  AllOrNothingTransferFailedError,
  AllOrNothingUnAuthorizedError,
  TreasurySuccessConditionNotFulfilledError,
} from "./all-or-nothing.js";
export type { AllOrNothingError } from "./all-or-nothing.js";

export {
  KeepWhatsRaisedAlreadyClaimedError,
  KeepWhatsRaisedAlreadyEnabledError,
  KeepWhatsRaisedAlreadyWithdrawnError,
  KeepWhatsRaisedConfigLockedError,
  KeepWhatsRaisedDisabledError,
  KeepWhatsRaisedDisbursementBlockedError,
  KeepWhatsRaisedInsufficientFundsForFeeError,
  KeepWhatsRaisedInsufficientFundsForWithdrawalAndFeeError,
  KeepWhatsRaisedInvalidInputError,
  KeepWhatsRaisedNotClaimableAdminError,
  KeepWhatsRaisedNotClaimableError,
  KeepWhatsRaisedPledgeAlreadyProcessedError,
  KeepWhatsRaisedRewardExistsError,
  KeepWhatsRaisedTokenNotAcceptedError,
  KeepWhatsRaisedUnAuthorizedError,
} from "./keep-whats-raised.js";
export type { KeepWhatsRaisedError } from "./keep-whats-raised.js";

export { ItemRegistryMismatchedArraysLengthError } from "./item-registry.js";
export type { ItemRegistryError } from "./item-registry.js";

export {
  PaymentTreasuryAlreadyWithdrawnError,
  PaymentTreasuryCampaignInfoIsPausedError,
  PaymentTreasuryClaimWindowNotReachedError,
  PaymentTreasuryCryptoPaymentError,
  PaymentTreasuryExpirationExceedsMaxError,
  PaymentTreasuryFeeNotDisbursedError,
  PaymentTreasuryInsufficientBalanceError,
  PaymentTreasuryInsufficientFundsForFeeError,
  PaymentTreasuryInvalidInputError,
  PaymentTreasuryNoFundsToClaimError,
  PaymentTreasuryPaymentAlreadyConfirmedError,
  PaymentTreasuryPaymentAlreadyExpiredError,
  PaymentTreasuryPaymentAlreadyExistError,
  PaymentTreasuryPaymentNotClaimableError,
  PaymentTreasuryPaymentNotConfirmedError,
  PaymentTreasuryPaymentNotExistError,
  PaymentTreasurySuccessConditionNotFulfilledError,
  PaymentTreasuryTokenNotAcceptedError,
  PaymentTreasuryUnAuthorizedError,
} from "./payment-treasury.js";
export type { PaymentTreasuryError } from "./payment-treasury.js";

export {
  TreasuryFactoryImplementationNotSetError,
  TreasuryFactoryImplementationNotSetOrApprovedError,
  TreasuryFactoryInvalidAddressError,
  TreasuryFactoryInvalidKeyError,
  TreasuryFactorySettingPlatformInfoFailedError,
  TreasuryFactoryTreasuryCreationFailedError,
  TreasuryFactoryTreasuryInitializationFailedError,
  TreasuryFactoryUnauthorizedError,
} from "./treasury-factory.js";
export type { TreasuryFactoryError } from "./treasury-factory.js";

export {
  AccessCheckerUnauthorizedError,
  AdminAccessCheckerUnauthorizedError,
  CurrentTimeIsGreaterError,
  CurrentTimeIsLessError,
  CurrentTimeIsNotWithinRangeError,
  TreasuryCampaignInfoIsPausedError,
  TreasuryFeeNotDisbursedError,
  TreasuryTransferFailedError,
} from "./shared.js";
export type { SharedError } from "./shared.js";

import type { ContractErrorBase } from "./contract-error.js";

/**
 * Returns a human-readable recovery suggestion for a typed contract error, if available.
 */
export function getRecoveryHint(error: ContractErrorBase): string | undefined {
  return error.recoveryHint;
}
