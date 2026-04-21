import {
  AccessCheckerUnauthorizedError,
  AdminAccessCheckerUnauthorizedError,
  CurrentTimeIsGreaterError,
  CurrentTimeIsLessError,
  CurrentTimeIsNotWithinRangeError,
  TreasuryCampaignInfoIsPausedError,
  TreasuryFeeNotDisbursedError,
  TreasuryTransferFailedError,
  PausedErrorError,
  NotPausedErrorError,
  CancelledErrorError,
  NotCancelledErrorError,
  CannotCancelError,
  PledgeNFTUnAuthorizedError,
  PledgeNFTInvalidJsonStringError,
} from "../../src/errors/contracts/shared";
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
  CampaignInfoInvalidInputError,
  CampaignInfoInvalidPlatformUpdateError,
  CampaignInfoPlatformNotSelectedError,
  CampaignInfoPlatformAlreadyApprovedError,
  CampaignInfoUnauthorizedError,
  CampaignInfoIsLockedError,
} from "../../src/errors/contracts/campaign-info";
import {
  CampaignInfoFactoryCampaignInitializationFailedError,
  CampaignInfoFactoryInvalidInputError,
  CampaignInfoFactoryPlatformNotListedError,
  CampaignInfoFactoryCampaignWithSameIdentifierExistsError,
  CampaignInfoInvalidTokenListError,
} from "../../src/errors/contracts/campaign-info-factory";
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
import { ItemRegistryMismatchedArraysLengthError } from "../../src/errors/contracts/item-registry";
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
import { toSharedContractError, decodeErrorArgs } from "../../src/errors/parse/shared";
import { parseContractError, getRevertData, simulateWithErrorDecode } from "../../src/errors/parse-contract-error";

const D = "0x0000000000000000000000000000000000000000000000000000000000000000";

describe("Shared error classes — no-arg constructors", () => {
  it.each([
    ["AccessCheckerUnauthorized", () => new AccessCheckerUnauthorizedError()],
    ["AdminAccessCheckerUnauthorized", () => new AdminAccessCheckerUnauthorizedError()],
    ["TreasuryCampaignInfoIsPaused", () => new TreasuryCampaignInfoIsPausedError()],
    ["TreasuryFeeNotDisbursed", () => new TreasuryFeeNotDisbursedError()],
    ["TreasuryTransferFailed", () => new TreasuryTransferFailedError()],
    ["PausedError", () => new PausedErrorError()],
    ["NotPausedError", () => new NotPausedErrorError()],
    ["CancelledError", () => new CancelledErrorError()],
    ["NotCancelledError", () => new NotCancelledErrorError()],
    ["CannotCancel", () => new CannotCancelError()],
    ["PledgeNFTUnAuthorized", () => new PledgeNFTUnAuthorizedError()],
    ["PledgeNFTInvalidJsonString", () => new PledgeNFTInvalidJsonStringError()],
  ])("%s", (expectedName, factory) => {
    const e = factory();
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe(expectedName);
    expect(typeof e.recoveryHint).toBe("string");
  });
});

describe("Shared error classes — with args", () => {
  it("CurrentTimeIsGreaterError", () => {
    const e = new CurrentTimeIsGreaterError({ inputTime: "100", currentTime: "200" });
    expect(e.name).toBe("CurrentTimeIsGreater");
    expect(e.args.inputTime).toBe("100");
  });
  it("CurrentTimeIsLessError", () => {
    const e = new CurrentTimeIsLessError({ inputTime: "100", currentTime: "50" });
    expect(e.args.inputTime).toBe("100");
  });
  it("CurrentTimeIsNotWithinRangeError", () => {
    const e = new CurrentTimeIsNotWithinRangeError({ initialTime: "10", finalTime: "20" });
    expect(e.args.initialTime).toBe("10");
  });
});

describe("AllOrNothing error classes", () => {
  it.each([
    [() => new AllOrNothingFeeNotDisbursedError()],
    [() => new AllOrNothingFeeAlreadyDisbursedError()],
    [() => new AllOrNothingInvalidInputError()],
    [() => new AllOrNothingNotClaimableError({ tokenId: "1" })],
    [() => new AllOrNothingNotSuccessfulError()],
    [() => new AllOrNothingRewardExistsError()],
    [() => new AllOrNothingTransferFailedError()],
    [() => new AllOrNothingUnAuthorizedError()],
    [() => new AllOrNothingTokenNotAcceptedError({ token: D })],
    [() => new TreasurySuccessConditionNotFulfilledError()],
  ])("instantiates without error (index %#)", (factory) => {
    const e = factory();
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBeDefined();
    expect(typeof e.recoveryHint).toBe("string");
  });
});

describe("CampaignInfo error classes", () => {
  it.each([
    [() => new CampaignInfoInvalidInputError()],
    [() => new CampaignInfoInvalidPlatformUpdateError({ platformBytes: D, selection: true })],
    [() => new CampaignInfoPlatformNotSelectedError({ platformBytes: D })],
    [() => new CampaignInfoPlatformAlreadyApprovedError({ platformHash: D })],
    [() => new CampaignInfoUnauthorizedError()],
    [() => new CampaignInfoIsLockedError()],
  ])("instantiates without error (index %#)", (factory) => {
    const e = factory();
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBeDefined();
  });
});

describe("CampaignInfoFactory error classes", () => {
  it.each([
    [() => new CampaignInfoFactoryCampaignInitializationFailedError()],
    [() => new CampaignInfoFactoryInvalidInputError()],
    [() => new CampaignInfoFactoryPlatformNotListedError({ platformHash: D })],
    [() => new CampaignInfoFactoryCampaignWithSameIdentifierExistsError({ identifierHash: D, cloneExists: D })],
    [() => new CampaignInfoInvalidTokenListError()],
  ])("instantiates without error (index %#)", (factory) => {
    const e = factory();
    expect(e).toBeInstanceOf(Error);
  });
});

describe("GlobalParams error classes", () => {
  it.each([
    [() => new GlobalParamsInvalidInputError()],
    [() => new GlobalParamsPlatformAdminNotSetError({ platformBytes: D })],
    [() => new GlobalParamsPlatformAlreadyListedError({ platformBytes: D })],
    [() => new GlobalParamsPlatformDataAlreadySetError()],
    [() => new GlobalParamsPlatformDataNotSetError()],
    [() => new GlobalParamsPlatformDataSlotTakenError()],
    [() => new GlobalParamsPlatformFeePercentIsZeroError({ platformBytes: D })],
    [() => new GlobalParamsPlatformNotListedError({ platformBytes: D })],
    [() => new GlobalParamsUnauthorizedError()],
    [() => new GlobalParamsCurrencyTokenLengthMismatchError()],
    [() => new GlobalParamsCurrencyHasNoTokensError({ currency: D })],
    [() => new GlobalParamsTokenNotInCurrencyError({ currency: D, token: D })],
    [() => new GlobalParamsPlatformLineItemTypeNotFoundError({ platformHash: D, typeId: "1" })],
  ])("instantiates without error (index %#)", (factory) => {
    const e = factory();
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBeDefined();
  });
});

describe("ItemRegistry error classes", () => {
  it("ItemRegistryMismatchedArraysLengthError", () => {
    const e = new ItemRegistryMismatchedArraysLengthError();
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBeDefined();
  });
});

describe("KeepWhatsRaised error classes", () => {
  it.each([
    [() => new KeepWhatsRaisedUnAuthorizedError()],
    [() => new KeepWhatsRaisedInvalidInputError()],
    [() => new KeepWhatsRaisedTokenNotAcceptedError({ token: D })],
    [() => new KeepWhatsRaisedRewardExistsError()],
    [() => new KeepWhatsRaisedDisabledError()],
    [() => new KeepWhatsRaisedAlreadyEnabledError()],
    [() => new KeepWhatsRaisedInsufficientFundsForWithdrawalAndFeeError({
      availableAmount: "100", withdrawalAmount: "90", fee: "20",
    })],
    [() => new KeepWhatsRaisedInsufficientFundsForFeeError({ withdrawalAmount: "90", fee: "20" })],
    [() => new KeepWhatsRaisedAlreadyWithdrawnError()],
    [() => new KeepWhatsRaisedAlreadyClaimedError()],
    [() => new KeepWhatsRaisedNotClaimableError({ tokenId: "1" })],
    [() => new KeepWhatsRaisedNotClaimableAdminError()],
    [() => new KeepWhatsRaisedConfigLockedError()],
    [() => new KeepWhatsRaisedDisbursementBlockedError()],
    [() => new KeepWhatsRaisedPledgeAlreadyProcessedError({ pledgeId: "1" })],
  ])("instantiates without error (index %#)", (factory) => {
    const e = factory();
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBeDefined();
  });
});

describe("PaymentTreasury error classes", () => {
  it.each([
    [() => new PaymentTreasuryUnAuthorizedError()],
    [() => new PaymentTreasuryInvalidInputError()],
    [() => new PaymentTreasuryPaymentAlreadyExistError({ paymentId: "p1" })],
    [() => new PaymentTreasuryPaymentAlreadyConfirmedError({ paymentId: "p1" })],
    [() => new PaymentTreasuryPaymentAlreadyExpiredError({ paymentId: "p1" })],
    [() => new PaymentTreasuryPaymentNotExistError({ paymentId: "p1" })],
    [() => new PaymentTreasuryCampaignInfoIsPausedError()],
    [() => new PaymentTreasuryTokenNotAcceptedError({ token: D })],
    [() => new PaymentTreasurySuccessConditionNotFulfilledError()],
    [() => new PaymentTreasuryFeeNotDisbursedError()],
    [() => new PaymentTreasuryPaymentNotConfirmedError({ paymentId: "p1" })],
    [() => new PaymentTreasuryPaymentNotClaimableError({ paymentId: "p1" })],
    [() => new PaymentTreasuryAlreadyWithdrawnError()],
    [() => new PaymentTreasuryCryptoPaymentError({ paymentId: "p1" })],
    [() => new PaymentTreasuryInsufficientFundsForFeeError({ withdrawalAmount: "100", fee: "10" })],
    [() => new PaymentTreasuryInsufficientBalanceError({ required: "100", available: "50" })],
    [() => new PaymentTreasuryExpirationExceedsMaxError({ expiration: "1000", maxExpiration: "500" })],
    [() => new PaymentTreasuryClaimWindowNotReachedError({ claimableAt: "9999999" })],
    [() => new PaymentTreasuryNoFundsToClaimError()],
  ])("instantiates without error (index %#)", (factory) => {
    const e = factory();
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBeDefined();
  });
});

describe("TreasuryFactory error classes", () => {
  it.each([
    [() => new TreasuryFactoryUnauthorizedError()],
    [() => new TreasuryFactoryInvalidKeyError()],
    [() => new TreasuryFactoryTreasuryCreationFailedError()],
    [() => new TreasuryFactoryInvalidAddressError()],
    [() => new TreasuryFactoryImplementationNotSetError()],
    [() => new TreasuryFactoryImplementationNotSetOrApprovedError()],
    [() => new TreasuryFactoryTreasuryInitializationFailedError()],
    [() => new TreasuryFactorySettingPlatformInfoFailedError()],
  ])("instantiates without error (index %#)", (factory) => {
    const e = factory();
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBeDefined();
  });
});

describe("toSharedContractError", () => {
  it("maps each shared error name to the correct class", () => {
    expect(toSharedContractError("AccessCheckerUnauthorized", {})).toBeInstanceOf(AccessCheckerUnauthorizedError);
    expect(toSharedContractError("AdminAccessCheckerUnauthorized", {})).toBeInstanceOf(AdminAccessCheckerUnauthorizedError);
    expect(toSharedContractError("TreasuryCampaignInfoIsPaused", {})).toBeInstanceOf(TreasuryCampaignInfoIsPausedError);
    expect(toSharedContractError("TreasuryFeeNotDisbursed", {})).toBeInstanceOf(TreasuryFeeNotDisbursedError);
    expect(toSharedContractError("TreasuryTransferFailed", {})).toBeInstanceOf(TreasuryTransferFailedError);
    expect(toSharedContractError("PausedError", {})).toBeInstanceOf(PausedErrorError);
    expect(toSharedContractError("NotPausedError", {})).toBeInstanceOf(NotPausedErrorError);
    expect(toSharedContractError("CancelledError", {})).toBeInstanceOf(CancelledErrorError);
    expect(toSharedContractError("NotCancelledError", {})).toBeInstanceOf(NotCancelledErrorError);
    expect(toSharedContractError("CannotCancel", {})).toBeInstanceOf(CannotCancelError);
    expect(toSharedContractError("PledgeNFTUnAuthorized", {})).toBeInstanceOf(PledgeNFTUnAuthorizedError);
    expect(toSharedContractError("PledgeNFTInvalidJsonString", {})).toBeInstanceOf(PledgeNFTInvalidJsonStringError);
  });

  it("maps CurrentTimeIs* with args", () => {
    const gt = toSharedContractError("CurrentTimeIsGreater", { inputTime: "1", currentTime: "2" });
    expect(gt).toBeInstanceOf(CurrentTimeIsGreaterError);
    const lt = toSharedContractError("CurrentTimeIsLess", { inputTime: "1", currentTime: "2" });
    expect(lt).toBeInstanceOf(CurrentTimeIsLessError);
    const range = toSharedContractError("CurrentTimeIsNotWithinRange", { initialTime: "1", finalTime: "2" });
    expect(range).toBeInstanceOf(CurrentTimeIsNotWithinRangeError);
  });

  it("returns null for unknown error names", () => {
    expect(toSharedContractError("SomeUnknownError", {})).toBeNull();
  });
});

describe("decodeErrorArgs", () => {
  it("maps decoded args tuple to named record", () => {
    const abi = [{ type: "error", name: "TestError", inputs: [{ name: "a" }, { name: "b" }] }];
    const result = decodeErrorArgs(abi, "TestError", [42n, "hello"]);
    expect(result).toEqual({ a: "42", b: "hello" });
  });

  it("returns empty record for unknown error name", () => {
    const abi = [{ type: "error", name: "Other", inputs: [{ name: "x" }] }];
    expect(decodeErrorArgs(abi, "Missing", [1])).toEqual({});
  });

  it("skips undefined values", () => {
    const abi = [{ type: "error", name: "E", inputs: [{ name: "a" }, { name: "b" }] }];
    expect(decodeErrorArgs(abi, "E", ["v"])).toEqual({ a: "v" });
  });
});

describe("parseContractError", () => {
  it("returns null for empty input", () => {
    expect(parseContractError("")).toBeNull();
  });

  it("returns null for non-hex input", () => {
    expect(parseContractError("not-hex")).toBeNull();
  });

  it("returns null for hex shorter than a selector", () => {
    expect(parseContractError("0xabcd")).toBeNull();
  });

  it("returns null for unrecognized selector", () => {
    expect(parseContractError("0xdeadbeefdeadbeef")).toBeNull();
  });
});

describe("getRevertData", () => {
  it("returns null for non-object", () => {
    expect(getRevertData("string")).toBeNull();
    expect(getRevertData(null)).toBeNull();
    expect(getRevertData(42)).toBeNull();
  });

  it("extracts data from top-level .data", () => {
    expect(getRevertData({ data: "0xabcdef" })).toBe("0xabcdef");
  });

  it("extracts data from .raw", () => {
    expect(getRevertData({ raw: "0xabcdef" })).toBe("0xabcdef");
  });

  it("extracts nested .data.data", () => {
    expect(getRevertData({ data: { data: "0xabcdef" } })).toBe("0xabcdef");
  });

  it("walks the cause chain", () => {
    expect(getRevertData({ cause: { data: "0xfeed" } })).toBe("0xfeed");
  });

  it("returns null when no hex data found", () => {
    expect(getRevertData({ something: "else" })).toBeNull();
  });
});

describe("simulateWithErrorDecode", () => {
  it("returns result on success", async () => {
    const result = await simulateWithErrorDecode(() => Promise.resolve("ok"));
    expect(result).toBe("ok");
  });

  it("re-throws original error when not decodable", async () => {
    const err = new Error("some-error");
    await expect(simulateWithErrorDecode(() => Promise.reject(err))).rejects.toThrow("some-error");
  });
});
