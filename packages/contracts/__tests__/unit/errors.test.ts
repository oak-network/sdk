import {
  GlobalParamsInvalidInputError,
  GlobalParamsPlatformAdminNotSetError,
  GlobalParamsPlatformAlreadyListedError,
  GlobalParamsPlatformDataAlreadySetError,
  GlobalParamsPlatformDataNotSetError,
  GlobalParamsPlatformDataSlotTakenError,
  GlobalParamsPlatformFeePercentIsZeroError,
  GlobalParamsPlatformNotListedError,
  GlobalParamsUnauthorizedError,
  GlobalParamsCurrencyTokenLengthMismatchError,
  GlobalParamsCurrencyHasNoTokensError,
  GlobalParamsTokenNotInCurrencyError,
  GlobalParamsPlatformLineItemTypeNotFoundError,
} from "../../src/errors/contracts/global-params";

import {
  CampaignInfoFactoryCampaignInitializationFailedError,
  CampaignInfoFactoryInvalidInputError,
  CampaignInfoFactoryPlatformNotListedError,
  CampaignInfoFactoryCampaignWithSameIdentifierExistsError,
  CampaignInfoInvalidTokenListError,
} from "../../src/errors/contracts/campaign-info-factory";

import {
  CampaignInfoInvalidInputError,
  CampaignInfoInvalidPlatformUpdateError,
  CampaignInfoPlatformNotSelectedError,
  CampaignInfoPlatformAlreadyApprovedError,
  CampaignInfoUnauthorizedError,
  CampaignInfoIsLockedError,
} from "../../src/errors/contracts/campaign-info";

import {
  AllOrNothingFeeNotDisbursedError,
  AllOrNothingFeeAlreadyDisbursedError,
  AllOrNothingInvalidInputError,
  AllOrNothingNotClaimableError,
  AllOrNothingNotSuccessfulError,
  AllOrNothingRewardExistsError,
  AllOrNothingTransferFailedError,
  AllOrNothingUnAuthorizedError,
  AllOrNothingTokenNotAcceptedError,
  TreasurySuccessConditionNotFulfilledError,
} from "../../src/errors/contracts/all-or-nothing";

import {
  KeepWhatsRaisedUnAuthorizedError,
  KeepWhatsRaisedInvalidInputError,
  KeepWhatsRaisedTokenNotAcceptedError,
  KeepWhatsRaisedRewardExistsError,
  KeepWhatsRaisedDisabledError,
  KeepWhatsRaisedAlreadyEnabledError,
  KeepWhatsRaisedInsufficientFundsForWithdrawalAndFeeError,
  KeepWhatsRaisedInsufficientFundsForFeeError,
  KeepWhatsRaisedAlreadyWithdrawnError,
  KeepWhatsRaisedAlreadyClaimedError,
  KeepWhatsRaisedNotClaimableError,
  KeepWhatsRaisedNotClaimableAdminError,
  KeepWhatsRaisedConfigLockedError,
  KeepWhatsRaisedDisbursementBlockedError,
  KeepWhatsRaisedPledgeAlreadyProcessedError,
} from "../../src/errors/contracts/keep-whats-raised";

import { ItemRegistryMismatchedArraysLengthError } from "../../src/errors/contracts/item-registry";

import {
  PaymentTreasuryUnAuthorizedError,
  PaymentTreasuryInvalidInputError,
  PaymentTreasuryPaymentAlreadyExistError,
  PaymentTreasuryPaymentAlreadyConfirmedError,
  PaymentTreasuryPaymentAlreadyExpiredError,
  PaymentTreasuryPaymentNotExistError,
  PaymentTreasuryCampaignInfoIsPausedError,
  PaymentTreasuryTokenNotAcceptedError,
  PaymentTreasurySuccessConditionNotFulfilledError,
  PaymentTreasuryFeeNotDisbursedError,
  PaymentTreasuryPaymentNotConfirmedError,
  PaymentTreasuryPaymentNotClaimableError,
  PaymentTreasuryAlreadyWithdrawnError,
  PaymentTreasuryCryptoPaymentError,
  PaymentTreasuryInsufficientFundsForFeeError,
  PaymentTreasuryInsufficientBalanceError,
  PaymentTreasuryExpirationExceedsMaxError,
  PaymentTreasuryClaimWindowNotReachedError,
  PaymentTreasuryNoFundsToClaimError,
} from "../../src/errors/contracts/payment-treasury";

import {
  TreasuryFactoryUnauthorizedError,
  TreasuryFactoryInvalidKeyError,
  TreasuryFactoryTreasuryCreationFailedError,
  TreasuryFactoryInvalidAddressError,
  TreasuryFactoryImplementationNotSetError,
  TreasuryFactoryImplementationNotSetOrApprovedError,
  TreasuryFactoryTreasuryInitializationFailedError,
  TreasuryFactorySettingPlatformInfoFailedError,
} from "../../src/errors/contracts/treasury-factory";

import {
  AccessCheckerUnauthorizedError,
  AdminAccessCheckerUnauthorizedError,
  CurrentTimeIsGreaterError,
  CurrentTimeIsLessError,
  CurrentTimeIsNotWithinRangeError,
  TreasuryCampaignInfoIsPausedError,
  TreasuryFeeNotDisbursedError,
  TreasuryTransferFailedError,
} from "../../src/errors/contracts/shared";

import { getRecoveryHint } from "../../src/errors/recovery";
import type { ContractErrorBase } from "../../src/errors/base";

function assertError(
  err: Error & ContractErrorBase,
  expectedName: string,
) {
  expect(err).toBeInstanceOf(Error);
  expect(err.name).toBe(expectedName);
  expect(err.message).toBeTruthy();
}

describe("Shared errors", () => {
  it("AccessCheckerUnauthorizedError", () => {
    const e = new AccessCheckerUnauthorizedError();
    assertError(e, "AccessCheckerUnauthorized");
    expect(e.args).toEqual({});
    expect(e.recoveryHint).toBeDefined();
  });

  it("AdminAccessCheckerUnauthorizedError", () => {
    const e = new AdminAccessCheckerUnauthorizedError();
    assertError(e, "AdminAccessCheckerUnauthorized");
  });

  it("CurrentTimeIsGreaterError", () => {
    const e = new CurrentTimeIsGreaterError({ inputTime: "100", currentTime: "200" });
    assertError(e, "CurrentTimeIsGreater");
    expect(e.args.inputTime).toBe("100");
    expect(e.args.currentTime).toBe("200");
  });

  it("CurrentTimeIsLessError", () => {
    const e = new CurrentTimeIsLessError({ inputTime: "200", currentTime: "100" });
    assertError(e, "CurrentTimeIsLess");
    expect(e.args.inputTime).toBe("200");
  });

  it("CurrentTimeIsNotWithinRangeError", () => {
    const e = new CurrentTimeIsNotWithinRangeError({ initialTime: "10", finalTime: "20" });
    assertError(e, "CurrentTimeIsNotWithinRange");
    expect(e.args.initialTime).toBe("10");
  });

  it("TreasuryCampaignInfoIsPausedError", () => {
    const e = new TreasuryCampaignInfoIsPausedError();
    assertError(e, "TreasuryCampaignInfoIsPaused");
  });

  it("TreasuryFeeNotDisbursedError", () => {
    const e = new TreasuryFeeNotDisbursedError();
    assertError(e, "TreasuryFeeNotDisbursed");
  });

  it("TreasuryTransferFailedError", () => {
    const e = new TreasuryTransferFailedError();
    assertError(e, "TreasuryTransferFailed");
  });
});

describe("GlobalParams errors", () => {
  const noArgErrors = [
    ["GlobalParamsInvalidInput", GlobalParamsInvalidInputError],
    ["GlobalParamsPlatformDataAlreadySet", GlobalParamsPlatformDataAlreadySetError],
    ["GlobalParamsPlatformDataNotSet", GlobalParamsPlatformDataNotSetError],
    ["GlobalParamsPlatformDataSlotTaken", GlobalParamsPlatformDataSlotTakenError],
    ["GlobalParamsUnauthorized", GlobalParamsUnauthorizedError],
    ["GlobalParamsCurrencyTokenLengthMismatch", GlobalParamsCurrencyTokenLengthMismatchError],
  ] as const;

  it.each(noArgErrors)("%s", (name, Cls) => {
    const e = new (Cls as new () => Error & ContractErrorBase)();
    assertError(e, name);
  });

  it("GlobalParamsPlatformAdminNotSetError", () => {
    const e = new GlobalParamsPlatformAdminNotSetError({ platformBytes: "0x01" });
    assertError(e, "GlobalParamsPlatformAdminNotSet");
    expect(e.args.platformBytes).toBe("0x01");
  });

  it("GlobalParamsPlatformAlreadyListedError", () => {
    const e = new GlobalParamsPlatformAlreadyListedError({ platformBytes: "0x02" });
    assertError(e, "GlobalParamsPlatformAlreadyListed");
  });

  it("GlobalParamsPlatformFeePercentIsZeroError", () => {
    const e = new GlobalParamsPlatformFeePercentIsZeroError({ platformBytes: "0x03" });
    assertError(e, "GlobalParamsPlatformFeePercentIsZero");
  });

  it("GlobalParamsPlatformNotListedError", () => {
    const e = new GlobalParamsPlatformNotListedError({ platformBytes: "0x04" });
    assertError(e, "GlobalParamsPlatformNotListed");
  });

  it("GlobalParamsCurrencyHasNoTokensError", () => {
    const e = new GlobalParamsCurrencyHasNoTokensError({ currency: "0x05" });
    assertError(e, "GlobalParamsCurrencyHasNoTokens");
    expect(e.args.currency).toBe("0x05");
  });

  it("GlobalParamsTokenNotInCurrencyError", () => {
    const e = new GlobalParamsTokenNotInCurrencyError({ currency: "0x06", token: "0x07" });
    assertError(e, "GlobalParamsTokenNotInCurrency");
    expect(e.args.token).toBe("0x07");
  });

  it("GlobalParamsPlatformLineItemTypeNotFoundError", () => {
    const e = new GlobalParamsPlatformLineItemTypeNotFoundError({ platformHash: "0x08", typeId: "0x09" });
    assertError(e, "GlobalParamsPlatformLineItemTypeNotFound");
    expect(e.args.platformHash).toBe("0x08");
    expect(e.args.typeId).toBe("0x09");
  });
});

describe("CampaignInfoFactory errors", () => {
  it("CampaignInfoFactoryCampaignInitializationFailedError", () => {
    const e = new CampaignInfoFactoryCampaignInitializationFailedError();
    assertError(e, "CampaignInfoFactoryCampaignInitializationFailed");
  });

  it("CampaignInfoFactoryInvalidInputError", () => {
    const e = new CampaignInfoFactoryInvalidInputError();
    assertError(e, "CampaignInfoFactoryInvalidInput");
  });

  it("CampaignInfoFactoryPlatformNotListedError", () => {
    const e = new CampaignInfoFactoryPlatformNotListedError({ platformHash: "0xaa" });
    assertError(e, "CampaignInfoFactoryPlatformNotListed");
    expect(e.args.platformHash).toBe("0xaa");
  });

  it("CampaignInfoFactoryCampaignWithSameIdentifierExistsError", () => {
    const e = new CampaignInfoFactoryCampaignWithSameIdentifierExistsError({
      identifierHash: "0xbb",
      cloneExists: "0xcc",
    });
    assertError(e, "CampaignInfoFactoryCampaignWithSameIdentifierExists");
    expect(e.args.identifierHash).toBe("0xbb");
    expect(e.args.cloneExists).toBe("0xcc");
  });

  it("CampaignInfoInvalidTokenListError", () => {
    const e = new CampaignInfoInvalidTokenListError();
    assertError(e, "CampaignInfoInvalidTokenList");
  });
});

describe("CampaignInfo errors", () => {
  it("CampaignInfoInvalidInputError", () => {
    const e = new CampaignInfoInvalidInputError();
    assertError(e, "CampaignInfoInvalidInput");
  });

  it("CampaignInfoInvalidPlatformUpdateError", () => {
    const e = new CampaignInfoInvalidPlatformUpdateError({ platformBytes: "0x01", selection: true });
    assertError(e, "CampaignInfoInvalidPlatformUpdate");
    expect(e.args.selection).toBe(true);
  });

  it("CampaignInfoPlatformNotSelectedError", () => {
    const e = new CampaignInfoPlatformNotSelectedError({ platformBytes: "0x02" });
    assertError(e, "CampaignInfoPlatformNotSelected");
  });

  it("CampaignInfoPlatformAlreadyApprovedError", () => {
    const e = new CampaignInfoPlatformAlreadyApprovedError({ platformHash: "0x03" });
    assertError(e, "CampaignInfoPlatformAlreadyApproved");
  });

  it("CampaignInfoUnauthorizedError", () => {
    const e = new CampaignInfoUnauthorizedError();
    assertError(e, "CampaignInfoUnauthorized");
  });

  it("CampaignInfoIsLockedError", () => {
    const e = new CampaignInfoIsLockedError();
    assertError(e, "CampaignInfoIsLocked");
  });
});

describe("AllOrNothing errors", () => {
  const noArgErrors = [
    ["AllOrNothingFeeNotDisbursed", AllOrNothingFeeNotDisbursedError],
    ["AllOrNothingFeeAlreadyDisbursed", AllOrNothingFeeAlreadyDisbursedError],
    ["AllOrNothingInvalidInput", AllOrNothingInvalidInputError],
    ["AllOrNothingNotSuccessful", AllOrNothingNotSuccessfulError],
    ["AllOrNothingRewardExists", AllOrNothingRewardExistsError],
    ["AllOrNothingTransferFailed", AllOrNothingTransferFailedError],
    ["AllOrNothingUnAuthorized", AllOrNothingUnAuthorizedError],
    ["TreasurySuccessConditionNotFulfilled", TreasurySuccessConditionNotFulfilledError],
  ] as const;

  it.each(noArgErrors)("%s", (name, Cls) => {
    const e = new (Cls as new () => Error & ContractErrorBase)();
    assertError(e, name);
  });

  it("AllOrNothingNotClaimableError", () => {
    const e = new AllOrNothingNotClaimableError({ tokenId: "42" });
    assertError(e, "AllOrNothingNotClaimable");
    expect(e.args.tokenId).toBe("42");
  });

  it("AllOrNothingTokenNotAcceptedError", () => {
    const e = new AllOrNothingTokenNotAcceptedError({ token: "0xtoken" });
    assertError(e, "AllOrNothingTokenNotAccepted");
    expect(e.args.token).toBe("0xtoken");
  });
});

describe("KeepWhatsRaised errors", () => {
  const noArgErrors = [
    ["KeepWhatsRaisedUnAuthorized", KeepWhatsRaisedUnAuthorizedError],
    ["KeepWhatsRaisedInvalidInput", KeepWhatsRaisedInvalidInputError],
    ["KeepWhatsRaisedRewardExists", KeepWhatsRaisedRewardExistsError],
    ["KeepWhatsRaisedDisabled", KeepWhatsRaisedDisabledError],
    ["KeepWhatsRaisedAlreadyEnabled", KeepWhatsRaisedAlreadyEnabledError],
    ["KeepWhatsRaisedAlreadyWithdrawn", KeepWhatsRaisedAlreadyWithdrawnError],
    ["KeepWhatsRaisedAlreadyClaimed", KeepWhatsRaisedAlreadyClaimedError],
    ["KeepWhatsRaisedNotClaimableAdmin", KeepWhatsRaisedNotClaimableAdminError],
    ["KeepWhatsRaisedConfigLocked", KeepWhatsRaisedConfigLockedError],
    ["KeepWhatsRaisedDisbursementBlocked", KeepWhatsRaisedDisbursementBlockedError],
  ] as const;

  it.each(noArgErrors)("%s", (name, Cls) => {
    const e = new (Cls as new () => Error & ContractErrorBase)();
    assertError(e, name);
  });

  it("KeepWhatsRaisedTokenNotAcceptedError", () => {
    const e = new KeepWhatsRaisedTokenNotAcceptedError({ token: "0xt" });
    assertError(e, "KeepWhatsRaisedTokenNotAccepted");
  });

  it("KeepWhatsRaisedInsufficientFundsForWithdrawalAndFeeError", () => {
    const e = new KeepWhatsRaisedInsufficientFundsForWithdrawalAndFeeError({
      availableAmount: "100",
      withdrawalAmount: "200",
      fee: "10",
    });
    assertError(e, "KeepWhatsRaisedInsufficientFundsForWithdrawalAndFee");
    expect(e.args.availableAmount).toBe("100");
  });

  it("KeepWhatsRaisedInsufficientFundsForFeeError", () => {
    const e = new KeepWhatsRaisedInsufficientFundsForFeeError({ withdrawalAmount: "50", fee: "5" });
    assertError(e, "KeepWhatsRaisedInsufficientFundsForFee");
  });

  it("KeepWhatsRaisedNotClaimableError", () => {
    const e = new KeepWhatsRaisedNotClaimableError({ tokenId: "7" });
    assertError(e, "KeepWhatsRaisedNotClaimable");
  });

  it("KeepWhatsRaisedPledgeAlreadyProcessedError", () => {
    const e = new KeepWhatsRaisedPledgeAlreadyProcessedError({ pledgeId: "p1" });
    assertError(e, "KeepWhatsRaisedPledgeAlreadyProcessed");
  });
});

describe("ItemRegistry errors", () => {
  it("ItemRegistryMismatchedArraysLengthError", () => {
    const e = new ItemRegistryMismatchedArraysLengthError();
    assertError(e, "ItemRegistryMismatchedArraysLength");
  });
});

describe("PaymentTreasury errors", () => {
  const noArgErrors = [
    ["PaymentTreasuryUnAuthorized", PaymentTreasuryUnAuthorizedError],
    ["PaymentTreasuryInvalidInput", PaymentTreasuryInvalidInputError],
    ["PaymentTreasuryCampaignInfoIsPaused", PaymentTreasuryCampaignInfoIsPausedError],
    ["PaymentTreasurySuccessConditionNotFulfilled", PaymentTreasurySuccessConditionNotFulfilledError],
    ["PaymentTreasuryFeeNotDisbursed", PaymentTreasuryFeeNotDisbursedError],
    ["PaymentTreasuryAlreadyWithdrawn", PaymentTreasuryAlreadyWithdrawnError],
    ["PaymentTreasuryNoFundsToClaim", PaymentTreasuryNoFundsToClaimError],
  ] as const;

  it.each(noArgErrors)("%s", (name, Cls) => {
    const e = new (Cls as new () => Error & ContractErrorBase)();
    assertError(e, name);
  });

  it("PaymentTreasuryPaymentAlreadyExistError", () => {
    const e = new PaymentTreasuryPaymentAlreadyExistError({ paymentId: "p1" });
    assertError(e, "PaymentTreasuryPaymentAlreadyExist");
  });

  it("PaymentTreasuryPaymentAlreadyConfirmedError", () => {
    const e = new PaymentTreasuryPaymentAlreadyConfirmedError({ paymentId: "p2" });
    assertError(e, "PaymentTreasuryPaymentAlreadyConfirmed");
  });

  it("PaymentTreasuryPaymentAlreadyExpiredError", () => {
    const e = new PaymentTreasuryPaymentAlreadyExpiredError({ paymentId: "p3" });
    assertError(e, "PaymentTreasuryPaymentAlreadyExpired");
  });

  it("PaymentTreasuryPaymentNotExistError", () => {
    const e = new PaymentTreasuryPaymentNotExistError({ paymentId: "p4" });
    assertError(e, "PaymentTreasuryPaymentNotExist");
  });

  it("PaymentTreasuryTokenNotAcceptedError", () => {
    const e = new PaymentTreasuryTokenNotAcceptedError({ token: "0xt" });
    assertError(e, "PaymentTreasuryTokenNotAccepted");
  });

  it("PaymentTreasuryPaymentNotConfirmedError", () => {
    const e = new PaymentTreasuryPaymentNotConfirmedError({ paymentId: "p5" });
    assertError(e, "PaymentTreasuryPaymentNotConfirmed");
  });

  it("PaymentTreasuryPaymentNotClaimableError", () => {
    const e = new PaymentTreasuryPaymentNotClaimableError({ paymentId: "p6" });
    assertError(e, "PaymentTreasuryPaymentNotClaimable");
  });

  it("PaymentTreasuryCryptoPaymentError", () => {
    const e = new PaymentTreasuryCryptoPaymentError({ paymentId: "p7" });
    assertError(e, "PaymentTreasuryCryptoPayment");
  });

  it("PaymentTreasuryInsufficientFundsForFeeError", () => {
    const e = new PaymentTreasuryInsufficientFundsForFeeError({ withdrawalAmount: "100", fee: "10" });
    assertError(e, "PaymentTreasuryInsufficientFundsForFee");
  });

  it("PaymentTreasuryInsufficientBalanceError", () => {
    const e = new PaymentTreasuryInsufficientBalanceError({ required: "500", available: "100" });
    assertError(e, "PaymentTreasuryInsufficientBalance");
  });

  it("PaymentTreasuryExpirationExceedsMaxError", () => {
    const e = new PaymentTreasuryExpirationExceedsMaxError({ expiration: "999", maxExpiration: "100" });
    assertError(e, "PaymentTreasuryExpirationExceedsMax");
  });

  it("PaymentTreasuryClaimWindowNotReachedError", () => {
    const e = new PaymentTreasuryClaimWindowNotReachedError({ claimableAt: "9999" });
    assertError(e, "PaymentTreasuryClaimWindowNotReached");
  });
});

describe("TreasuryFactory errors", () => {
  const noArgErrors = [
    ["TreasuryFactoryUnauthorized", TreasuryFactoryUnauthorizedError],
    ["TreasuryFactoryInvalidKey", TreasuryFactoryInvalidKeyError],
    ["TreasuryFactoryTreasuryCreationFailed", TreasuryFactoryTreasuryCreationFailedError],
    ["TreasuryFactoryInvalidAddress", TreasuryFactoryInvalidAddressError],
    ["TreasuryFactoryImplementationNotSet", TreasuryFactoryImplementationNotSetError],
    ["TreasuryFactoryImplementationNotSetOrApproved", TreasuryFactoryImplementationNotSetOrApprovedError],
    ["TreasuryFactoryTreasuryInitializationFailed", TreasuryFactoryTreasuryInitializationFailedError],
    ["TreasuryFactorySettingPlatformInfoFailed", TreasuryFactorySettingPlatformInfoFailedError],
  ] as const;

  it.each(noArgErrors)("%s", (name, Cls) => {
    const e = new (Cls as new () => Error & ContractErrorBase)();
    assertError(e, name);
  });
});

describe("getRecoveryHint", () => {
  it("returns hint when present", () => {
    const err = new GlobalParamsInvalidInputError();
    expect(getRecoveryHint(err)).toBeDefined();
    expect(typeof getRecoveryHint(err)).toBe("string");
  });

  it("returns undefined when no hint", () => {
    const err: ContractErrorBase = { name: "Test", args: {} };
    expect(getRecoveryHint(err)).toBeUndefined();
  });
});
