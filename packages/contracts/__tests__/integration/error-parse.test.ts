import { encodeErrorResult } from "viem";
import { parseContractError } from "../../src/errors/parse-contract-error";
import { parseGlobalParamsError } from "../../src/errors/parse/global-params";
import { parseCampaignInfoFactoryError } from "../../src/errors/parse/campaign-info-factory";
import { parseCampaignInfoError } from "../../src/errors/parse/campaign-info";
import { parseAllOrNothingError } from "../../src/errors/parse/all-or-nothing";
import { parseKeepWhatsRaisedError } from "../../src/errors/parse/keep-whats-raised";
import { parseItemRegistryError } from "../../src/errors/parse/item-registry";
import { parsePaymentTreasuryError } from "../../src/errors/parse/payment-treasury";
import { parseTreasuryFactoryError } from "../../src/errors/parse/treasury-factory";
import { GLOBAL_PARAMS_ABI } from "../../src/contracts/global-params/abi";
import { CAMPAIGN_INFO_FACTORY_ABI } from "../../src/contracts/campaign-info-factory/abi";
import { CAMPAIGN_INFO_ABI } from "../../src/contracts/campaign-info/abi";
import { ALL_OR_NOTHING_ABI } from "../../src/contracts/all-or-nothing/abi";
import { KEEP_WHATS_RAISED_ABI } from "../../src/contracts/keep-whats-raised/abi";
import { ITEM_REGISTRY_ABI } from "../../src/contracts/item-registry/abi";
import { PAYMENT_TREASURY_ABI } from "../../src/contracts/payment-treasury/abi";
import { TREASURY_FACTORY_ABI } from "../../src/contracts/treasury-factory/abi";
import type { Abi, Hex } from "viem";

function encode(abi: Abi, errorName: string, args?: readonly unknown[]): Hex {
  return encodeErrorResult({ abi, errorName, args });
}

describe("parseGlobalParamsError — all branches", () => {
  const abi = GLOBAL_PARAMS_ABI as Abi;

  it.each([
    ["GlobalParamsInvalidInput", "GlobalParamsInvalidInput", []],
    ["GlobalParamsPlatformAdminNotSet", "GlobalParamsPlatformAdminNotSet", ["0x0000000000000000000000000000000000000000000000000000000000000001"]],
    ["GlobalParamsPlatformAlreadyListed", "GlobalParamsPlatformAlreadyListed", ["0x0000000000000000000000000000000000000000000000000000000000000001"]],
    ["GlobalParamsPlatformDataAlreadySet", "GlobalParamsPlatformDataAlreadySet", []],
    ["GlobalParamsPlatformDataNotSet", "GlobalParamsPlatformDataNotSet", []],
    ["GlobalParamsPlatformDataSlotTaken", "GlobalParamsPlatformDataSlotTaken", []],
    ["GlobalParamsPlatformFeePercentIsZero", "GlobalParamsPlatformFeePercentIsZero", ["0x0000000000000000000000000000000000000000000000000000000000000001"]],
    ["GlobalParamsPlatformNotListed", "GlobalParamsPlatformNotListed", ["0x0000000000000000000000000000000000000000000000000000000000000001"]],
    ["GlobalParamsUnauthorized", "GlobalParamsUnauthorized", []],
    ["GlobalParamsCurrencyTokenLengthMismatch", "GlobalParamsCurrencyTokenLengthMismatch", []],
    ["GlobalParamsCurrencyHasNoTokens", "GlobalParamsCurrencyHasNoTokens", ["0x0000000000000000000000000000000000000000000000000000000000000001"]],
    ["GlobalParamsTokenNotInCurrency", "GlobalParamsTokenNotInCurrency", ["0x0000000000000000000000000000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000001"]],
    ["GlobalParamsPlatformLineItemTypeNotFound", "GlobalParamsPlatformLineItemTypeNotFound", ["0x0000000000000000000000000000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000000000000000000000000000002"]],
  ])("parses %s", (expectedName, errorName, args) => {
    const data = encode(abi, errorName, args);
    const result = parseGlobalParamsError(data as `0x${string}`);
    expect(result).not.toBeNull();
    expect(result!.name).toBe(expectedName);
  });

  it("returns null for unknown selector", () => {
    expect(parseGlobalParamsError("0xdeadbeef" as `0x${string}`)).toBeNull();
  });
});

describe("parseCampaignInfoFactoryError — all branches", () => {
  const abi = CAMPAIGN_INFO_FACTORY_ABI as Abi;

  it.each([
    ["CampaignInfoFactoryCampaignInitializationFailed", "CampaignInfoFactoryCampaignInitializationFailed", []],
    ["CampaignInfoFactoryInvalidInput", "CampaignInfoFactoryInvalidInput", []],
    ["CampaignInfoFactoryPlatformNotListed", "CampaignInfoFactoryPlatformNotListed", ["0x0000000000000000000000000000000000000000000000000000000000000001"]],
    ["CampaignInfoFactoryCampaignWithSameIdentifierExists", "CampaignInfoFactoryCampaignWithSameIdentifierExists", ["0x0000000000000000000000000000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000001"]],
    ["CampaignInfoInvalidTokenList", "CampaignInfoInvalidTokenList", []],
  ])("parses %s", (expectedName, errorName, args) => {
    const data = encode(abi, errorName, args);
    const result = parseCampaignInfoFactoryError(data as `0x${string}`);
    expect(result).not.toBeNull();
    expect(result!.name).toBe(expectedName);
  });
});

describe("parseCampaignInfoError — all branches", () => {
  const abi = CAMPAIGN_INFO_ABI as Abi;

  it.each([
    ["CampaignInfoInvalidInput", "CampaignInfoInvalidInput", []],
    ["CampaignInfoInvalidPlatformUpdate", "CampaignInfoInvalidPlatformUpdate", ["0x0000000000000000000000000000000000000000000000000000000000000001", true]],
    ["CampaignInfoPlatformNotSelected", "CampaignInfoPlatformNotSelected", ["0x0000000000000000000000000000000000000000000000000000000000000001"]],
    ["CampaignInfoPlatformAlreadyApproved", "CampaignInfoPlatformAlreadyApproved", ["0x0000000000000000000000000000000000000000000000000000000000000001"]],
    ["CampaignInfoUnauthorized", "CampaignInfoUnauthorized", []],
    ["CampaignInfoIsLocked", "CampaignInfoIsLocked", []],
  ])("parses %s", (expectedName, errorName, args) => {
    const data = encode(abi, errorName, args);
    const result = parseCampaignInfoError(data as `0x${string}`);
    expect(result).not.toBeNull();
    expect(result!.name).toBe(expectedName);
  });
});

describe("parseAllOrNothingError — all branches", () => {
  const abi = ALL_OR_NOTHING_ABI as Abi;

  it.each([
    ["AllOrNothingFeeNotDisbursed", "AllOrNothingFeeNotDisbursed", []],
    ["AllOrNothingFeeAlreadyDisbursed", "AllOrNothingFeeAlreadyDisbursed", []],
    ["AllOrNothingInvalidInput", "AllOrNothingInvalidInput", []],
    ["AllOrNothingNotClaimable", "AllOrNothingNotClaimable", [1n]],
    ["AllOrNothingNotSuccessful", "AllOrNothingNotSuccessful", []],
    ["AllOrNothingRewardExists", "AllOrNothingRewardExists", []],
    ["AllOrNothingTransferFailed", "AllOrNothingTransferFailed", []],
    ["AllOrNothingUnAuthorized", "AllOrNothingUnAuthorized", []],
    ["AllOrNothingTokenNotAccepted", "AllOrNothingTokenNotAccepted", ["0x0000000000000000000000000000000000000001"]],
    ["TreasurySuccessConditionNotFulfilled", "TreasurySuccessConditionNotFulfilled", []],
  ])("parses %s", (expectedName, errorName, args) => {
    const data = encode(abi, errorName, args);
    const result = parseAllOrNothingError(data as `0x${string}`);
    expect(result).not.toBeNull();
    expect(result!.name).toBe(expectedName);
  });
});

describe("parseKeepWhatsRaisedError — all branches", () => {
  const abi = KEEP_WHATS_RAISED_ABI as Abi;

  it.each([
    ["KeepWhatsRaisedUnAuthorized", "KeepWhatsRaisedUnAuthorized", []],
    ["KeepWhatsRaisedInvalidInput", "KeepWhatsRaisedInvalidInput", []],
    ["KeepWhatsRaisedTokenNotAccepted", "KeepWhatsRaisedTokenNotAccepted", ["0x0000000000000000000000000000000000000001"]],
    ["KeepWhatsRaisedRewardExists", "KeepWhatsRaisedRewardExists", []],
    ["KeepWhatsRaisedDisabled", "KeepWhatsRaisedDisabled", []],
    ["KeepWhatsRaisedAlreadyEnabled", "KeepWhatsRaisedAlreadyEnabled", []],
    ["KeepWhatsRaisedInsufficientFundsForWithdrawalAndFee", "KeepWhatsRaisedInsufficientFundsForWithdrawalAndFee", [100n, 90n, 20n]],
    ["KeepWhatsRaisedInsufficientFundsForFee", "KeepWhatsRaisedInsufficientFundsForFee", [90n, 20n]],
    ["KeepWhatsRaisedAlreadyWithdrawn", "KeepWhatsRaisedAlreadyWithdrawn", []],
    ["KeepWhatsRaisedAlreadyClaimed", "KeepWhatsRaisedAlreadyClaimed", []],
    ["KeepWhatsRaisedNotClaimable", "KeepWhatsRaisedNotClaimable", [1n]],
    ["KeepWhatsRaisedNotClaimableAdmin", "KeepWhatsRaisedNotClaimableAdmin", []],
    ["KeepWhatsRaisedConfigLocked", "KeepWhatsRaisedConfigLocked", []],
    ["KeepWhatsRaisedDisbursementBlocked", "KeepWhatsRaisedDisbursementBlocked", []],
    ["KeepWhatsRaisedPledgeAlreadyProcessed", "KeepWhatsRaisedPledgeAlreadyProcessed", ["0x0000000000000000000000000000000000000000000000000000000000000001"]],
  ])("parses %s", (expectedName, errorName, args) => {
    const data = encode(abi, errorName, args);
    const result = parseKeepWhatsRaisedError(data as `0x${string}`);
    expect(result).not.toBeNull();
    expect(result!.name).toBe(expectedName);
  });
});

describe("parseItemRegistryError — all branches", () => {
  const abi = ITEM_REGISTRY_ABI as Abi;

  it("parses ItemRegistryMismatchedArraysLength", () => {
    const data = encode(abi, "ItemRegistryMismatchedArraysLength", []);
    const result = parseItemRegistryError(data as `0x${string}`);
    expect(result).not.toBeNull();
    expect(result!.name).toBe("ItemRegistryMismatchedArraysLength");
  });
});

describe("parsePaymentTreasuryError — all branches", () => {
  const abi = PAYMENT_TREASURY_ABI as Abi;

  it.each([
    ["PaymentTreasuryUnAuthorized", "PaymentTreasuryUnAuthorized", []],
    ["PaymentTreasuryInvalidInput", "PaymentTreasuryInvalidInput", []],
    ["PaymentTreasuryPaymentAlreadyExist", "PaymentTreasuryPaymentAlreadyExist", ["0x0000000000000000000000000000000000000000000000000000000000000001"]],
    ["PaymentTreasuryPaymentAlreadyConfirmed", "PaymentTreasuryPaymentAlreadyConfirmed", ["0x0000000000000000000000000000000000000000000000000000000000000001"]],
    ["PaymentTreasuryPaymentAlreadyExpired", "PaymentTreasuryPaymentAlreadyExpired", ["0x0000000000000000000000000000000000000000000000000000000000000001"]],
    ["PaymentTreasuryPaymentNotExist", "PaymentTreasuryPaymentNotExist", ["0x0000000000000000000000000000000000000000000000000000000000000001"]],
    ["PaymentTreasuryCampaignInfoIsPaused", "PaymentTreasuryCampaignInfoIsPaused", []],
    ["PaymentTreasuryTokenNotAccepted", "PaymentTreasuryTokenNotAccepted", ["0x0000000000000000000000000000000000000001"]],
    ["PaymentTreasurySuccessConditionNotFulfilled", "PaymentTreasurySuccessConditionNotFulfilled", []],
    ["PaymentTreasuryFeeNotDisbursed", "PaymentTreasuryFeeNotDisbursed", []],
    ["PaymentTreasuryPaymentNotConfirmed", "PaymentTreasuryPaymentNotConfirmed", ["0x0000000000000000000000000000000000000000000000000000000000000001"]],
    ["PaymentTreasuryPaymentNotClaimable", "PaymentTreasuryPaymentNotClaimable", ["0x0000000000000000000000000000000000000000000000000000000000000001"]],
    ["PaymentTreasuryAlreadyWithdrawn", "PaymentTreasuryAlreadyWithdrawn", []],
    ["PaymentTreasuryCryptoPayment", "PaymentTreasuryCryptoPayment", ["0x0000000000000000000000000000000000000000000000000000000000000001"]],
    ["PaymentTreasuryInsufficientFundsForFee", "PaymentTreasuryInsufficientFundsForFee", [100n, 10n]],
    ["PaymentTreasuryInsufficientBalance", "PaymentTreasuryInsufficientBalance", [100n, 50n]],
    ["PaymentTreasuryExpirationExceedsMax", "PaymentTreasuryExpirationExceedsMax", [1000n, 500n]],
    ["PaymentTreasuryClaimWindowNotReached", "PaymentTreasuryClaimWindowNotReached", [9999999n]],
    ["PaymentTreasuryNoFundsToClaim", "PaymentTreasuryNoFundsToClaim", []],
  ])("parses %s", (expectedName, errorName, args) => {
    const data = encode(abi, errorName, args);
    const result = parsePaymentTreasuryError(data as `0x${string}`);
    expect(result).not.toBeNull();
    expect(result!.name).toBe(expectedName);
  });
});

describe("parseTreasuryFactoryError — all branches", () => {
  const abi = TREASURY_FACTORY_ABI as Abi;

  it.each([
    ["TreasuryFactoryUnauthorized", "TreasuryFactoryUnauthorized", []],
    ["TreasuryFactoryInvalidKey", "TreasuryFactoryInvalidKey", []],
    ["TreasuryFactoryTreasuryCreationFailed", "TreasuryFactoryTreasuryCreationFailed", []],
    ["TreasuryFactoryInvalidAddress", "TreasuryFactoryInvalidAddress", []],
    ["TreasuryFactoryImplementationNotSet", "TreasuryFactoryImplementationNotSet", []],
    ["TreasuryFactoryImplementationNotSetOrApproved", "TreasuryFactoryImplementationNotSetOrApproved", []],
    ["TreasuryFactoryTreasuryInitializationFailed", "TreasuryFactoryTreasuryInitializationFailed", []],
    ["TreasuryFactorySettingPlatformInfoFailed", "TreasuryFactorySettingPlatformInfoFailed", []],
  ])("parses %s", (expectedName, errorName, args) => {
    const data = encode(abi, errorName, args);
    const result = parseTreasuryFactoryError(data as `0x${string}`);
    expect(result).not.toBeNull();
    expect(result!.name).toBe(expectedName);
  });
});

describe("parseContractError — end-to-end", () => {
  it("decodes a GlobalParams error via the aggregator", () => {
    const abi = GLOBAL_PARAMS_ABI as Abi;
    const data = encode(abi, "GlobalParamsInvalidInput", []);
    const result = parseContractError(data);
    expect(result).not.toBeNull();
    expect(result!.name).toBe("GlobalParamsInvalidInput");
  });

  it("decodes a PaymentTreasury error via the aggregator", () => {
    const abi = PAYMENT_TREASURY_ABI as Abi;
    const data = encode(abi, "PaymentTreasuryNoFundsToClaim", []);
    const result = parseContractError(data);
    expect(result).not.toBeNull();
    expect(result!.name).toBe("PaymentTreasuryNoFundsToClaim");
  });

  it("decodes a TreasuryFactory error via the aggregator", () => {
    const abi = TREASURY_FACTORY_ABI as Abi;
    const data = encode(abi, "TreasuryFactoryInvalidKey", []);
    const result = parseContractError(data);
    expect(result).not.toBeNull();
    expect(result!.name).toBe("TreasuryFactoryInvalidKey");
  });
});
