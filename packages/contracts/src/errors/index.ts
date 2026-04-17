export type { ContractErrorBase } from "./base";
export {
  parseContractError,
  getRevertData,
  simulateWithErrorDecode,
  toSimulationResult,
} from "./parse-contract-error";

export {
  GlobalParamsErrorNames,
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
} from "./contracts/global-params";
export type { GlobalParamsError } from "./contracts/global-params";

export {
  CampaignInfoFactoryErrorNames,
  CampaignInfoFactoryCampaignInitializationFailedError,
  CampaignInfoFactoryCampaignWithSameIdentifierExistsError,
  CampaignInfoFactoryInvalidInputError,
  CampaignInfoFactoryPlatformNotListedError,
  CampaignInfoInvalidTokenListError,
} from "./contracts/campaign-info-factory";
export type { CampaignInfoFactoryError } from "./contracts/campaign-info-factory";

export {
  CampaignInfoErrorNames,
  CampaignInfoInvalidInputError,
  CampaignInfoInvalidPlatformUpdateError,
  CampaignInfoIsLockedError,
  CampaignInfoPlatformAlreadyApprovedError,
  CampaignInfoPlatformNotSelectedError,
  CampaignInfoUnauthorizedError,
} from "./contracts/campaign-info";
export type { CampaignInfoError } from "./contracts/campaign-info";

export {
  AllOrNothingErrorNames,
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
} from "./contracts/all-or-nothing";
export type { AllOrNothingError } from "./contracts/all-or-nothing";

export {
  KeepWhatsRaisedErrorNames,
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
} from "./contracts/keep-whats-raised";
export type { KeepWhatsRaisedError } from "./contracts/keep-whats-raised";

export {
  ItemRegistryErrorNames,
  ItemRegistryMismatchedArraysLengthError,
} from "./contracts/item-registry";
export type { ItemRegistryError } from "./contracts/item-registry";

export {
  PaymentTreasuryErrorNames,
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
} from "./contracts/payment-treasury";
export type { PaymentTreasuryError } from "./contracts/payment-treasury";

export {
  TreasuryFactoryErrorNames,
  TreasuryFactoryImplementationNotSetError,
  TreasuryFactoryImplementationNotSetOrApprovedError,
  TreasuryFactoryInvalidAddressError,
  TreasuryFactoryInvalidKeyError,
  TreasuryFactorySettingPlatformInfoFailedError,
  TreasuryFactoryTreasuryCreationFailedError,
  TreasuryFactoryTreasuryInitializationFailedError,
  TreasuryFactoryUnauthorizedError,
} from "./contracts/treasury-factory";
export type { TreasuryFactoryError } from "./contracts/treasury-factory";

export {
  SharedErrorNames,
  AccessCheckerUnauthorizedError,
  AdminAccessCheckerUnauthorizedError,
  CannotCancelError,
  CancelledErrorError,
  CurrentTimeIsGreaterError,
  CurrentTimeIsLessError,
  CurrentTimeIsNotWithinRangeError,
  NotCancelledErrorError,
  NotPausedErrorError,
  PausedErrorError,
  PledgeNFTInvalidJsonStringError,
  PledgeNFTUnAuthorizedError,
  TreasuryCampaignInfoIsPausedError,
  TreasuryFeeNotDisbursedError,
  TreasuryTransferFailedError,
} from "./contracts/shared";
export type { SharedError } from "./contracts/shared";

export { getRecoveryHint } from "./recovery";
