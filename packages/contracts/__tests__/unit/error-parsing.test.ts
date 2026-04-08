import { encodeErrorResult } from "viem";
import { decodeErrorArgs, toSharedContractError, tryDecodeContractError } from "../../src/errors/parse/shared";
import type { ErrorAbiEntry } from "../../src/errors/parse/shared";
import {
  parseContractError,
  getRevertData,
  simulateWithErrorDecode,
  toSimulationResult,
} from "../../src/errors/parse-contract-error";
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

function encodeError(abi: readonly unknown[], errorName: string, args?: readonly unknown[]) {
  return encodeErrorResult({
    abi: abi as Parameters<typeof encodeErrorResult>[0]["abi"],
    errorName,
    args: args as never,
  });
}

describe("decodeErrorArgs", () => {
  const abi: ErrorAbiEntry[] = [
    { type: "error", name: "TestErr", inputs: [{ name: "val" }] },
    { type: "function", name: "foo" },
    { type: "error", name: "NoInputs" },
  ];

  it("maps decoded args to a named record", () => {
    const result = decodeErrorArgs(abi, "TestErr", [42]);
    expect(result).toEqual({ val: 42 });
  });

  it("returns empty record for unknown error name", () => {
    expect(decodeErrorArgs(abi, "Unknown", [1])).toEqual({});
  });

  it("skips undefined decoded values", () => {
    const result = decodeErrorArgs(abi, "TestErr", []);
    expect(result).toEqual({});
  });

  it("handles errors with no inputs", () => {
    const result = decodeErrorArgs(abi, "NoInputs", []);
    expect(result).toEqual({});
  });
});

describe("toSharedContractError", () => {
  it("maps AccessCheckerUnauthorized", () => {
    const e = toSharedContractError("AccessCheckerUnauthorized", {});
    expect(e).not.toBeNull();
    expect(e!.name).toBe("AccessCheckerUnauthorized");
  });

  it("maps AdminAccessCheckerUnauthorized", () => {
    const e = toSharedContractError("AdminAccessCheckerUnauthorized", {});
    expect(e!.name).toBe("AdminAccessCheckerUnauthorized");
  });

  it("maps CurrentTimeIsGreater", () => {
    const e = toSharedContractError("CurrentTimeIsGreater", { inputTime: "1", currentTime: "2" });
    expect(e!.name).toBe("CurrentTimeIsGreater");
  });

  it("maps CurrentTimeIsLess", () => {
    const e = toSharedContractError("CurrentTimeIsLess", { inputTime: "2", currentTime: "1" });
    expect(e!.name).toBe("CurrentTimeIsLess");
  });

  it("maps CurrentTimeIsNotWithinRange", () => {
    const e = toSharedContractError("CurrentTimeIsNotWithinRange", { initialTime: "1", finalTime: "2" });
    expect(e!.name).toBe("CurrentTimeIsNotWithinRange");
  });

  it("maps TreasuryCampaignInfoIsPaused", () => {
    const e = toSharedContractError("TreasuryCampaignInfoIsPaused", {});
    expect(e!.name).toBe("TreasuryCampaignInfoIsPaused");
  });

  it("maps TreasuryFeeNotDisbursed", () => {
    const e = toSharedContractError("TreasuryFeeNotDisbursed", {});
    expect(e!.name).toBe("TreasuryFeeNotDisbursed");
  });

  it("maps TreasuryTransferFailed", () => {
    const e = toSharedContractError("TreasuryTransferFailed", {});
    expect(e!.name).toBe("TreasuryTransferFailed");
  });

  it("returns null for unknown error names", () => {
    expect(toSharedContractError("SomethingElse", {})).toBeNull();
  });
});

describe("tryDecodeContractError", () => {
  it("returns null for non-decodable data", () => {
    const abi: ErrorAbiEntry[] = [{ type: "error", name: "Foo" }];
    const result = tryDecodeContractError(abi, "0xdeadbeef", () => {
      throw new Error("should not be called");
    });
    expect(result).toBeNull();
  });
});

describe("getRevertData", () => {
  it("extracts data from { data: '0x...' }", () => {
    expect(getRevertData({ data: "0xabcd" })).toBe("0xabcd");
  });

  it("extracts data from nested { data: { data: '0x...' } }", () => {
    expect(getRevertData({ data: { data: "0xef01" } })).toBe("0xef01");
  });

  it("walks the cause chain", () => {
    expect(getRevertData({ cause: { data: "0x1234" } })).toBe("0x1234");
  });

  it("returns null for no data", () => {
    expect(getRevertData({})).toBeNull();
    expect(getRevertData(null)).toBeNull();
    expect(getRevertData(undefined)).toBeNull();
    expect(getRevertData("string")).toBeNull();
  });

  it("extracts data from { raw: '0x...' }", () => {
    expect(getRevertData({ raw: "0xabcd" })).toBe("0xabcd");
  });

  it("returns null for non-hex data string", () => {
    expect(getRevertData({ data: "not-hex" })).toBeNull();
  });

  it("returns null for non-object data that is not hex", () => {
    expect(getRevertData({ data: 42 })).toBeNull();
  });
});

describe("simulateWithErrorDecode", () => {
  it("returns the operation result on success", async () => {
    await expect(simulateWithErrorDecode(async () => "ok")).resolves.toBe("ok");
  });

  it("throws typed error when revert data is parseable", async () => {
    const revertData = encodeError(GLOBAL_PARAMS_ABI, "GlobalParamsInvalidInput");
    const op = async () => {
      throw { data: revertData };
    };
    await expect(simulateWithErrorDecode(op)).rejects.toMatchObject({
      name: "GlobalParamsInvalidInput",
    });
  });

  it("rethrows original error when not parseable", async () => {
    const err = new Error("something else");
    await expect(simulateWithErrorDecode(async () => { throw err; })).rejects.toBe(err);
  });
});

describe("toSimulationResult", () => {
  it("maps viem simulate response to SimulationResult", () => {
    const response = {
      result: 42n,
      request: {
        to: "0x0000000000000000000000000000000000000001",
        data: "0xdeadbeef",
        value: 100n,
        gas: 21000n,
      },
    };
    const mapped = toSimulationResult(response);
    expect(mapped.result).toBe(42n);
    expect(mapped.request.to).toBe("0x0000000000000000000000000000000000000001");
    expect(mapped.request.data).toBe("0xdeadbeef");
    expect(mapped.request.value).toBe(100n);
    expect(mapped.request.gas).toBe(21000n);
  });

  it("handles undefined value and gas", () => {
    const response = {
      result: undefined,
      request: {
        to: "0x0000000000000000000000000000000000000001",
        data: "0x00",
      },
    };
    const mapped = toSimulationResult(response);
    expect(mapped.result).toBeUndefined();
    expect(mapped.request.value).toBeUndefined();
    expect(mapped.request.gas).toBeUndefined();
  });
});

describe("parseContractError", () => {
  it("returns null for empty string", () => {
    expect(parseContractError("")).toBeNull();
  });

  it("returns null for non-hex string", () => {
    expect(parseContractError("not-hex")).toBeNull();
  });

  it("returns null for hex shorter than 10 chars (no selector)", () => {
    expect(parseContractError("0xabcd")).toBeNull();
  });

  it("returns null for unrecognized selector", () => {
    expect(parseContractError("0x12345678")).toBeNull();
  });

  it("parses a GlobalParams error", () => {
    const data = encodeError(GLOBAL_PARAMS_ABI, "GlobalParamsInvalidInput");
    const err = parseContractError(data);
    expect(err).not.toBeNull();
    expect(err!.name).toBe("GlobalParamsInvalidInput");
  });

  it("parses a CampaignInfoFactory error", () => {
    const data = encodeError(CAMPAIGN_INFO_FACTORY_ABI, "CampaignInfoFactoryInvalidInput");
    const err = parseContractError(data);
    expect(err).not.toBeNull();
    expect(err!.name).toBe("CampaignInfoFactoryInvalidInput");
  });

  it("parses a CampaignInfo error", () => {
    const data = encodeError(CAMPAIGN_INFO_ABI, "CampaignInfoInvalidInput");
    const err = parseContractError(data);
    expect(err).not.toBeNull();
    expect(err!.name).toBe("CampaignInfoInvalidInput");
  });

  it("parses an AllOrNothing error", () => {
    const data = encodeError(ALL_OR_NOTHING_ABI, "AllOrNothingInvalidInput");
    const err = parseContractError(data);
    expect(err).not.toBeNull();
    expect(err!.name).toBe("AllOrNothingInvalidInput");
  });

  it("parses a KeepWhatsRaised error", () => {
    const data = encodeError(KEEP_WHATS_RAISED_ABI, "KeepWhatsRaisedInvalidInput");
    const err = parseContractError(data);
    expect(err).not.toBeNull();
    expect(err!.name).toBe("KeepWhatsRaisedInvalidInput");
  });

  it("parses an ItemRegistry error", () => {
    const data = encodeError(ITEM_REGISTRY_ABI, "ItemRegistryMismatchedArraysLength");
    const err = parseContractError(data);
    expect(err).not.toBeNull();
    expect(err!.name).toBe("ItemRegistryMismatchedArraysLength");
  });

  it("parses a PaymentTreasury error", () => {
    const data = encodeError(PAYMENT_TREASURY_ABI, "PaymentTreasuryInvalidInput");
    const err = parseContractError(data);
    expect(err).not.toBeNull();
    expect(err!.name).toBe("PaymentTreasuryInvalidInput");
  });

  it("parses a TreasuryFactory error", () => {
    const data = encodeError(TREASURY_FACTORY_ABI, "TreasuryFactoryUnauthorized");
    const err = parseContractError(data);
    expect(err).not.toBeNull();
    expect(err!.name).toBe("TreasuryFactoryUnauthorized");
  });
});

describe("parseGlobalParamsError", () => {
  function encode(name: string, args?: readonly unknown[]) {
    return encodeError(GLOBAL_PARAMS_ABI, name, args);
  }

  it.each([
    "GlobalParamsInvalidInput",
    "GlobalParamsPlatformDataAlreadySet",
    "GlobalParamsPlatformDataNotSet",
    "GlobalParamsPlatformDataSlotTaken",
    "GlobalParamsUnauthorized",
    "GlobalParamsCurrencyTokenLengthMismatch",
  ])("parses %s", (name) => {
    const err = parseGlobalParamsError(encode(name));
    expect(err!.name).toBe(name);
  });

  it("parses GlobalParamsPlatformAdminNotSet", () => {
    const data = encode("GlobalParamsPlatformAdminNotSet", ["0x" + "ab".repeat(32)]);
    expect(parseGlobalParamsError(data)!.name).toBe("GlobalParamsPlatformAdminNotSet");
  });

  it("parses GlobalParamsPlatformAlreadyListed", () => {
    const data = encode("GlobalParamsPlatformAlreadyListed", ["0x" + "cd".repeat(32)]);
    expect(parseGlobalParamsError(data)!.name).toBe("GlobalParamsPlatformAlreadyListed");
  });

  it("parses GlobalParamsPlatformFeePercentIsZero", () => {
    const data = encode("GlobalParamsPlatformFeePercentIsZero", ["0x" + "ee".repeat(32)]);
    expect(parseGlobalParamsError(data)!.name).toBe("GlobalParamsPlatformFeePercentIsZero");
  });

  it("parses GlobalParamsPlatformNotListed", () => {
    const data = encode("GlobalParamsPlatformNotListed", ["0x" + "ff".repeat(32)]);
    expect(parseGlobalParamsError(data)!.name).toBe("GlobalParamsPlatformNotListed");
  });

  it("parses GlobalParamsCurrencyHasNoTokens", () => {
    const data = encode("GlobalParamsCurrencyHasNoTokens", ["0x" + "aa".repeat(32)]);
    expect(parseGlobalParamsError(data)!.name).toBe("GlobalParamsCurrencyHasNoTokens");
  });

  it("parses GlobalParamsTokenNotInCurrency", () => {
    const data = encode("GlobalParamsTokenNotInCurrency", [
      "0x" + "bb".repeat(32),
      "0x0000000000000000000000000000000000000001",
    ]);
    expect(parseGlobalParamsError(data)!.name).toBe("GlobalParamsTokenNotInCurrency");
  });

  it("parses GlobalParamsPlatformLineItemTypeNotFound", () => {
    const data = encode("GlobalParamsPlatformLineItemTypeNotFound", [
      "0x" + "11".repeat(32),
      "0x" + "22".repeat(32),
    ]);
    expect(parseGlobalParamsError(data)!.name).toBe("GlobalParamsPlatformLineItemTypeNotFound");
  });

  it("returns null for unrecognized data", () => {
    expect(parseGlobalParamsError("0x12345678")).toBeNull();
  });
});

describe("parseCampaignInfoFactoryError", () => {
  function encode(name: string, args?: readonly unknown[]) {
    return encodeError(CAMPAIGN_INFO_FACTORY_ABI, name, args);
  }

  it.each([
    "CampaignInfoFactoryCampaignInitializationFailed",
    "CampaignInfoFactoryInvalidInput",
    "CampaignInfoInvalidTokenList",
  ])("parses %s", (name) => {
    expect(parseCampaignInfoFactoryError(encode(name))!.name).toBe(name);
  });

  it("parses CampaignInfoFactoryPlatformNotListed", () => {
    const data = encode("CampaignInfoFactoryPlatformNotListed", ["0x" + "ab".repeat(32)]);
    expect(parseCampaignInfoFactoryError(data)!.name).toBe("CampaignInfoFactoryPlatformNotListed");
  });

  it("parses CampaignInfoFactoryCampaignWithSameIdentifierExists", () => {
    const data = encode("CampaignInfoFactoryCampaignWithSameIdentifierExists", [
      "0x" + "ab".repeat(32),
      "0x0000000000000000000000000000000000000002",
    ]);
    expect(parseCampaignInfoFactoryError(data)!.name).toBe(
      "CampaignInfoFactoryCampaignWithSameIdentifierExists",
    );
  });

  it("returns null for unrecognized data", () => {
    expect(parseCampaignInfoFactoryError("0x12345678")).toBeNull();
  });
});

describe("parseCampaignInfoError", () => {
  function encode(name: string, args?: readonly unknown[]) {
    return encodeError(CAMPAIGN_INFO_ABI, name, args);
  }

  it.each([
    "CampaignInfoInvalidInput",
    "CampaignInfoUnauthorized",
    "CampaignInfoIsLocked",
  ])("parses %s", (name) => {
    expect(parseCampaignInfoError(encode(name))!.name).toBe(name);
  });

  it("parses CampaignInfoInvalidPlatformUpdate", () => {
    const data = encode("CampaignInfoInvalidPlatformUpdate", ["0x" + "ab".repeat(32), true]);
    expect(parseCampaignInfoError(data)!.name).toBe("CampaignInfoInvalidPlatformUpdate");
  });

  it("parses CampaignInfoPlatformNotSelected", () => {
    const data = encode("CampaignInfoPlatformNotSelected", ["0x" + "ab".repeat(32)]);
    expect(parseCampaignInfoError(data)!.name).toBe("CampaignInfoPlatformNotSelected");
  });

  it("parses CampaignInfoPlatformAlreadyApproved", () => {
    const data = encode("CampaignInfoPlatformAlreadyApproved", ["0x" + "ab".repeat(32)]);
    expect(parseCampaignInfoError(data)!.name).toBe("CampaignInfoPlatformAlreadyApproved");
  });

  it("falls through to shared error for AdminAccessCheckerUnauthorized", () => {
    const data = encode("AdminAccessCheckerUnauthorized");
    const err = parseCampaignInfoError(data);
    expect(err).not.toBeNull();
    expect(err!.name).toBe("AdminAccessCheckerUnauthorized");
  });

  it("falls through to shared error for CurrentTimeIsGreater", () => {
    const data = encode("CurrentTimeIsGreater", [100n, 200n]);
    const err = parseCampaignInfoError(data);
    expect(err).not.toBeNull();
    expect(err!.name).toBe("CurrentTimeIsGreater");
  });

  it("returns null for unrecognized data", () => {
    expect(parseCampaignInfoError("0x12345678")).toBeNull();
  });
});

describe("parseAllOrNothingError", () => {
  function encode(name: string, args?: readonly unknown[]) {
    return encodeError(ALL_OR_NOTHING_ABI, name, args);
  }

  it.each([
    "AllOrNothingFeeNotDisbursed",
    "AllOrNothingFeeAlreadyDisbursed",
    "AllOrNothingInvalidInput",
    "AllOrNothingNotSuccessful",
    "AllOrNothingRewardExists",
    "AllOrNothingTransferFailed",
    "AllOrNothingUnAuthorized",
    "TreasurySuccessConditionNotFulfilled",
  ])("parses %s", (name) => {
    expect(parseAllOrNothingError(encode(name))!.name).toBe(name);
  });

  it("parses AllOrNothingNotClaimable", () => {
    const data = encode("AllOrNothingNotClaimable", [42n]);
    expect(parseAllOrNothingError(data)!.name).toBe("AllOrNothingNotClaimable");
  });

  it("parses AllOrNothingTokenNotAccepted", () => {
    const data = encode("AllOrNothingTokenNotAccepted", ["0x0000000000000000000000000000000000000003"]);
    expect(parseAllOrNothingError(data)!.name).toBe("AllOrNothingTokenNotAccepted");
  });

  it("falls through to shared error for AccessCheckerUnauthorized", () => {
    const data = encode("AccessCheckerUnauthorized");
    const err = parseAllOrNothingError(data);
    expect(err).not.toBeNull();
    expect(err!.name).toBe("AccessCheckerUnauthorized");
  });

  it("falls through to shared error for TreasuryCampaignInfoIsPaused", () => {
    const data = encode("TreasuryCampaignInfoIsPaused");
    const err = parseAllOrNothingError(data);
    expect(err).not.toBeNull();
    expect(err!.name).toBe("TreasuryCampaignInfoIsPaused");
  });

  it("returns null for unrecognized data", () => {
    expect(parseAllOrNothingError("0x12345678")).toBeNull();
  });
});

describe("parseKeepWhatsRaisedError", () => {
  function encode(name: string, args?: readonly unknown[]) {
    return encodeError(KEEP_WHATS_RAISED_ABI, name, args);
  }

  it.each([
    "KeepWhatsRaisedUnAuthorized",
    "KeepWhatsRaisedInvalidInput",
    "KeepWhatsRaisedRewardExists",
    "KeepWhatsRaisedDisabled",
    "KeepWhatsRaisedAlreadyEnabled",
    "KeepWhatsRaisedAlreadyWithdrawn",
    "KeepWhatsRaisedAlreadyClaimed",
    "KeepWhatsRaisedNotClaimableAdmin",
    "KeepWhatsRaisedConfigLocked",
    "KeepWhatsRaisedDisbursementBlocked",
  ])("parses %s", (name) => {
    expect(parseKeepWhatsRaisedError(encode(name))!.name).toBe(name);
  });

  it("parses KeepWhatsRaisedTokenNotAccepted", () => {
    const data = encode("KeepWhatsRaisedTokenNotAccepted", ["0x0000000000000000000000000000000000000004"]);
    expect(parseKeepWhatsRaisedError(data)!.name).toBe("KeepWhatsRaisedTokenNotAccepted");
  });

  it("parses KeepWhatsRaisedInsufficientFundsForWithdrawalAndFee", () => {
    const data = encode("KeepWhatsRaisedInsufficientFundsForWithdrawalAndFee", [100n, 200n, 10n]);
    expect(parseKeepWhatsRaisedError(data)!.name).toBe("KeepWhatsRaisedInsufficientFundsForWithdrawalAndFee");
  });

  it("parses KeepWhatsRaisedInsufficientFundsForFee", () => {
    const data = encode("KeepWhatsRaisedInsufficientFundsForFee", [50n, 5n]);
    expect(parseKeepWhatsRaisedError(data)!.name).toBe("KeepWhatsRaisedInsufficientFundsForFee");
  });

  it("parses KeepWhatsRaisedNotClaimable", () => {
    const data = encode("KeepWhatsRaisedNotClaimable", [7n]);
    expect(parseKeepWhatsRaisedError(data)!.name).toBe("KeepWhatsRaisedNotClaimable");
  });

  it("parses KeepWhatsRaisedPledgeAlreadyProcessed", () => {
    const data = encode("KeepWhatsRaisedPledgeAlreadyProcessed", ["0x" + "cc".repeat(32)]);
    expect(parseKeepWhatsRaisedError(data)!.name).toBe("KeepWhatsRaisedPledgeAlreadyProcessed");
  });

  it("falls through to shared error for AccessCheckerUnauthorized", () => {
    const data = encode("AccessCheckerUnauthorized");
    const err = parseKeepWhatsRaisedError(data);
    expect(err).not.toBeNull();
    expect(err!.name).toBe("AccessCheckerUnauthorized");
  });

  it("falls through to shared error for TreasuryFeeNotDisbursed", () => {
    const data = encode("TreasuryFeeNotDisbursed");
    const err = parseKeepWhatsRaisedError(data);
    expect(err).not.toBeNull();
    expect(err!.name).toBe("TreasuryFeeNotDisbursed");
  });

  it("returns null for unrecognized data", () => {
    expect(parseKeepWhatsRaisedError("0x12345678")).toBeNull();
  });
});

describe("parseItemRegistryError", () => {
  it("parses ItemRegistryMismatchedArraysLength", () => {
    const data = encodeError(ITEM_REGISTRY_ABI, "ItemRegistryMismatchedArraysLength");
    expect(parseItemRegistryError(data)!.name).toBe("ItemRegistryMismatchedArraysLength");
  });

  it("returns null for unrecognized data", () => {
    expect(parseItemRegistryError("0x12345678")).toBeNull();
  });
});

describe("parsePaymentTreasuryError", () => {
  function encode(name: string, args?: readonly unknown[]) {
    return encodeError(PAYMENT_TREASURY_ABI, name, args);
  }

  it.each([
    "PaymentTreasuryUnAuthorized",
    "PaymentTreasuryInvalidInput",
    "PaymentTreasuryCampaignInfoIsPaused",
    "PaymentTreasurySuccessConditionNotFulfilled",
    "PaymentTreasuryFeeNotDisbursed",
    "PaymentTreasuryAlreadyWithdrawn",
    "PaymentTreasuryNoFundsToClaim",
  ])("parses %s", (name) => {
    expect(parsePaymentTreasuryError(encode(name))!.name).toBe(name);
  });

  it("parses PaymentTreasuryPaymentAlreadyExist", () => {
    const data = encode("PaymentTreasuryPaymentAlreadyExist", ["0x" + "ab".repeat(32)]);
    expect(parsePaymentTreasuryError(data)!.name).toBe("PaymentTreasuryPaymentAlreadyExist");
  });

  it("parses PaymentTreasuryPaymentAlreadyConfirmed", () => {
    const data = encode("PaymentTreasuryPaymentAlreadyConfirmed", ["0x" + "ab".repeat(32)]);
    expect(parsePaymentTreasuryError(data)!.name).toBe("PaymentTreasuryPaymentAlreadyConfirmed");
  });

  it("parses PaymentTreasuryPaymentAlreadyExpired", () => {
    const data = encode("PaymentTreasuryPaymentAlreadyExpired", ["0x" + "ab".repeat(32)]);
    expect(parsePaymentTreasuryError(data)!.name).toBe("PaymentTreasuryPaymentAlreadyExpired");
  });

  it("parses PaymentTreasuryPaymentNotExist", () => {
    const data = encode("PaymentTreasuryPaymentNotExist", ["0x" + "ab".repeat(32)]);
    expect(parsePaymentTreasuryError(data)!.name).toBe("PaymentTreasuryPaymentNotExist");
  });

  it("parses PaymentTreasuryTokenNotAccepted", () => {
    const data = encode("PaymentTreasuryTokenNotAccepted", ["0x0000000000000000000000000000000000000005"]);
    expect(parsePaymentTreasuryError(data)!.name).toBe("PaymentTreasuryTokenNotAccepted");
  });

  it("parses PaymentTreasuryPaymentNotConfirmed", () => {
    const data = encode("PaymentTreasuryPaymentNotConfirmed", ["0x" + "ab".repeat(32)]);
    expect(parsePaymentTreasuryError(data)!.name).toBe("PaymentTreasuryPaymentNotConfirmed");
  });

  it("parses PaymentTreasuryPaymentNotClaimable", () => {
    const data = encode("PaymentTreasuryPaymentNotClaimable", ["0x" + "ab".repeat(32)]);
    expect(parsePaymentTreasuryError(data)!.name).toBe("PaymentTreasuryPaymentNotClaimable");
  });

  it("parses PaymentTreasuryCryptoPayment", () => {
    const data = encode("PaymentTreasuryCryptoPayment", ["0x" + "ab".repeat(32)]);
    expect(parsePaymentTreasuryError(data)!.name).toBe("PaymentTreasuryCryptoPayment");
  });

  it("parses PaymentTreasuryInsufficientFundsForFee", () => {
    const data = encode("PaymentTreasuryInsufficientFundsForFee", [100n, 10n]);
    expect(parsePaymentTreasuryError(data)!.name).toBe("PaymentTreasuryInsufficientFundsForFee");
  });

  it("parses PaymentTreasuryInsufficientBalance", () => {
    const data = encode("PaymentTreasuryInsufficientBalance", [500n, 100n]);
    expect(parsePaymentTreasuryError(data)!.name).toBe("PaymentTreasuryInsufficientBalance");
  });

  it("parses PaymentTreasuryExpirationExceedsMax", () => {
    const data = encode("PaymentTreasuryExpirationExceedsMax", [999n, 100n]);
    expect(parsePaymentTreasuryError(data)!.name).toBe("PaymentTreasuryExpirationExceedsMax");
  });

  it("parses PaymentTreasuryClaimWindowNotReached", () => {
    const data = encode("PaymentTreasuryClaimWindowNotReached", [9999n]);
    expect(parsePaymentTreasuryError(data)!.name).toBe("PaymentTreasuryClaimWindowNotReached");
  });

  it("returns null for unrecognized data", () => {
    expect(parsePaymentTreasuryError("0x12345678")).toBeNull();
  });
});

describe("parseTreasuryFactoryError", () => {
  function encode(name: string, args?: readonly unknown[]) {
    return encodeError(TREASURY_FACTORY_ABI, name, args);
  }

  it.each([
    "TreasuryFactoryUnauthorized",
    "TreasuryFactoryInvalidKey",
    "TreasuryFactoryTreasuryCreationFailed",
    "TreasuryFactoryInvalidAddress",
    "TreasuryFactoryImplementationNotSet",
    "TreasuryFactoryImplementationNotSetOrApproved",
    "TreasuryFactoryTreasuryInitializationFailed",
    "TreasuryFactorySettingPlatformInfoFailed",
  ])("parses %s", (name) => {
    expect(parseTreasuryFactoryError(encode(name))!.name).toBe(name);
  });

  it("falls through to shared error for AdminAccessCheckerUnauthorized", () => {
    const data = encode("AdminAccessCheckerUnauthorized");
    const err = parseTreasuryFactoryError(data);
    expect(err).not.toBeNull();
    expect(err!.name).toBe("AdminAccessCheckerUnauthorized");
  });

  it("returns null for unrecognized data", () => {
    expect(parseTreasuryFactoryError("0x12345678")).toBeNull();
  });
});
