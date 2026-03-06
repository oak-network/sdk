import { decodeErrorResult, type Hex } from "viem";
import { GLOBAL_PARAMS_ABI } from "../abis/global-params.js";
import { CAMPAIGN_INFO_FACTORY_ABI } from "../abis/campaign-info-factory.js";
import { CAMPAIGN_INFO_ABI } from "../abis/campaign-info.js";
import { ALL_OR_NOTHING_ABI } from "../abis/all-or-nothing.js";
import { KEEP_WHATS_RAISED_ABI } from "../abis/keep-whats-raised.js";
import { ITEM_REGISTRY_ABI } from "../abis/item-registry.js";
import { PAYMENT_TREASURY_ABI } from "../abis/payment-treasury.js";
import { TREASURY_FACTORY_ABI } from "../abis/treasury-factory.js";
import type { ContractErrorBase } from "./contract-error.js";
import {
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
import {
  CampaignInfoFactoryCampaignInitializationFailedError,
  CampaignInfoFactoryCampaignWithSameIdentifierExistsError,
  CampaignInfoFactoryInvalidInputError,
  CampaignInfoFactoryPlatformNotListedError,
  CampaignInfoInvalidTokenListError,
} from "./campaign-info-factory.js";
import {
  CampaignInfoInvalidInputError,
  CampaignInfoInvalidPlatformUpdateError,
  CampaignInfoIsLockedError,
  CampaignInfoPlatformAlreadyApprovedError,
  CampaignInfoPlatformNotSelectedError,
  CampaignInfoUnauthorizedError,
} from "./campaign-info.js";
import {
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
import {
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
import { ItemRegistryMismatchedArraysLengthError } from "./item-registry.js";
import {
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
import {
  TreasuryFactoryImplementationNotSetError,
  TreasuryFactoryImplementationNotSetOrApprovedError,
  TreasuryFactoryInvalidAddressError,
  TreasuryFactoryInvalidKeyError,
  TreasuryFactorySettingPlatformInfoFailedError,
  TreasuryFactoryTreasuryCreationFailedError,
  TreasuryFactoryTreasuryInitializationFailedError,
  TreasuryFactoryUnauthorizedError,
} from "./treasury-factory.js";
import {
  AccessCheckerUnauthorizedError,
  AdminAccessCheckerUnauthorizedError,
  CurrentTimeIsGreaterError,
  CurrentTimeIsLessError,
  CurrentTimeIsNotWithinRangeError,
  TreasuryCampaignInfoIsPausedError,
  TreasuryFeeNotDisbursedError,
  TreasuryTransferFailedError,
} from "./shared.js";

function isHex(data: string): data is Hex {
  return typeof data === "string" && data.startsWith("0x") && /^0x[0-9a-fA-F]*$/.test(data);
}

function decodeArgs(
  abi: readonly { type: string; name?: string; inputs?: readonly { name: string }[] }[],
  errorName: string,
  decodedArgs: readonly unknown[],
): Record<string, unknown> {
  const args: Record<string, unknown> = {};
  const errorAbi = abi.find((item) => item.type === "error" && item.name === errorName);
  if (errorAbi && "inputs" in errorAbi && errorAbi.inputs) {
    errorAbi.inputs.forEach((input, i) => {
      if (input.name && decodedArgs[i] !== undefined) {
        args[input.name] = decodedArgs[i];
      }
    });
  }
  return args;
}

function toSharedError(name: string, args: Record<string, unknown>): ContractErrorBase | null {
  switch (name) {
    case "AccessCheckerUnauthorized":
      return new AccessCheckerUnauthorizedError();
    case "AdminAccessCheckerUnauthorized":
      return new AdminAccessCheckerUnauthorizedError();
    case "CurrentTimeIsGreater":
      return new CurrentTimeIsGreaterError({
        inputTime: args["inputTime"] as string,
        currentTime: args["currentTime"] as string,
      });
    case "CurrentTimeIsLess":
      return new CurrentTimeIsLessError({
        inputTime: args["inputTime"] as string,
        currentTime: args["currentTime"] as string,
      });
    case "CurrentTimeIsNotWithinRange":
      return new CurrentTimeIsNotWithinRangeError({
        initialTime: args["initialTime"] as string,
        finalTime: args["finalTime"] as string,
      });
    case "TreasuryCampaignInfoIsPaused":
      return new TreasuryCampaignInfoIsPausedError();
    case "TreasuryFeeNotDisbursed":
      return new TreasuryFeeNotDisbursedError();
    case "TreasuryTransferFailed":
      return new TreasuryTransferFailedError();
    default:
      return null;
  }
}

function toGlobalParamsError(name: string, args: Record<string, unknown>): ContractErrorBase {
  switch (name) {
    case "GlobalParamsInvalidInput":
      return new GlobalParamsInvalidInputError();
    case "GlobalParamsPlatformAdminNotSet":
      return new GlobalParamsPlatformAdminNotSetError({
        platformBytes: args["platformBytes"] as string,
      });
    case "GlobalParamsPlatformAlreadyListed":
      return new GlobalParamsPlatformAlreadyListedError({
        platformBytes: args["platformBytes"] as string,
      });
    case "GlobalParamsPlatformDataAlreadySet":
      return new GlobalParamsPlatformDataAlreadySetError();
    case "GlobalParamsPlatformDataNotSet":
      return new GlobalParamsPlatformDataNotSetError();
    case "GlobalParamsPlatformDataSlotTaken":
      return new GlobalParamsPlatformDataSlotTakenError();
    case "GlobalParamsPlatformFeePercentIsZero":
      return new GlobalParamsPlatformFeePercentIsZeroError({
        platformBytes: args["platformBytes"] as string,
      });
    case "GlobalParamsPlatformNotListed":
      return new GlobalParamsPlatformNotListedError({
        platformBytes: args["platformBytes"] as string,
      });
    case "GlobalParamsUnauthorized":
      return new GlobalParamsUnauthorizedError();
    case "GlobalParamsCurrencyTokenLengthMismatch":
      return new GlobalParamsCurrencyTokenLengthMismatchError();
    case "GlobalParamsCurrencyHasNoTokens":
      return new GlobalParamsCurrencyHasNoTokensError({
        currency: args["currency"] as string,
      });
    case "GlobalParamsTokenNotInCurrency":
      return new GlobalParamsTokenNotInCurrencyError({
        currency: args["currency"] as string,
        token: args["token"] as string,
      });
    case "GlobalParamsPlatformLineItemTypeNotFound":
      return new GlobalParamsPlatformLineItemTypeNotFoundError({
        platformHash: args["platformHash"] as string,
        typeId: args["typeId"] as string,
      });
    default:
      return new (class extends Error implements ContractErrorBase {
        readonly name = name;
        readonly args = args;
      })(`${name}(${JSON.stringify(args)})`);
  }
}

function toCampaignInfoFactoryError(
  name: string,
  args: Record<string, unknown>,
): ContractErrorBase {
  switch (name) {
    case "CampaignInfoFactoryCampaignInitializationFailed":
      return new CampaignInfoFactoryCampaignInitializationFailedError();
    case "CampaignInfoFactoryInvalidInput":
      return new CampaignInfoFactoryInvalidInputError();
    case "CampaignInfoFactoryPlatformNotListed":
      return new CampaignInfoFactoryPlatformNotListedError({
        platformHash: args["platformHash"] as string,
      });
    case "CampaignInfoFactoryCampaignWithSameIdentifierExists":
      return new CampaignInfoFactoryCampaignWithSameIdentifierExistsError({
        identifierHash: args["identifierHash"] as string,
        cloneExists: args["cloneExists"] as string,
      });
    case "CampaignInfoInvalidTokenList":
      return new CampaignInfoInvalidTokenListError();
    default:
      return (
        toSharedError(name, args) ??
        new (class extends Error implements ContractErrorBase {
          readonly name = name;
          readonly args = args;
        })(`${name}(${JSON.stringify(args)})`)
      );
  }
}

function toCampaignInfoError(name: string, args: Record<string, unknown>): ContractErrorBase {
  switch (name) {
    case "CampaignInfoInvalidInput":
      return new CampaignInfoInvalidInputError();
    case "CampaignInfoInvalidPlatformUpdate":
      return new CampaignInfoInvalidPlatformUpdateError({
        platformBytes: args["platformBytes"] as string,
        selection: args["selection"] as boolean,
      });
    case "CampaignInfoPlatformNotSelected":
      return new CampaignInfoPlatformNotSelectedError({
        platformBytes: args["platformBytes"] as string,
      });
    case "CampaignInfoPlatformAlreadyApproved":
      return new CampaignInfoPlatformAlreadyApprovedError({
        platformHash: args["platformHash"] as string,
      });
    case "CampaignInfoUnauthorized":
      return new CampaignInfoUnauthorizedError();
    case "CampaignInfoIsLocked":
      return new CampaignInfoIsLockedError();
    default:
      return (
        toSharedError(name, args) ??
        new (class extends Error implements ContractErrorBase {
          readonly name = name;
          readonly args = args;
        })(`${name}(${JSON.stringify(args)})`)
      );
  }
}

function toAllOrNothingError(name: string, args: Record<string, unknown>): ContractErrorBase {
  switch (name) {
    case "AllOrNothingFeeNotDisbursed":
      return new AllOrNothingFeeNotDisbursedError();
    case "AllOrNothingFeeAlreadyDisbursed":
      return new AllOrNothingFeeAlreadyDisbursedError();
    case "AllOrNothingInvalidInput":
      return new AllOrNothingInvalidInputError();
    case "AllOrNothingNotClaimable":
      return new AllOrNothingNotClaimableError({ tokenId: args["tokenId"] as string });
    case "AllOrNothingNotSuccessful":
      return new AllOrNothingNotSuccessfulError();
    case "AllOrNothingRewardExists":
      return new AllOrNothingRewardExistsError();
    case "AllOrNothingTransferFailed":
      return new AllOrNothingTransferFailedError();
    case "AllOrNothingUnAuthorized":
      return new AllOrNothingUnAuthorizedError();
    case "AllOrNothingTokenNotAccepted":
      return new AllOrNothingTokenNotAcceptedError({ token: args["token"] as string });
    case "TreasurySuccessConditionNotFulfilled":
      return new TreasurySuccessConditionNotFulfilledError();
    default:
      return (
        toSharedError(name, args) ??
        new (class extends Error implements ContractErrorBase {
          readonly name = name;
          readonly args = args;
        })(`${name}(${JSON.stringify(args)})`)
      );
  }
}

function toKeepWhatsRaisedError(name: string, args: Record<string, unknown>): ContractErrorBase {
  switch (name) {
    case "KeepWhatsRaisedUnAuthorized":
      return new KeepWhatsRaisedUnAuthorizedError();
    case "KeepWhatsRaisedInvalidInput":
      return new KeepWhatsRaisedInvalidInputError();
    case "KeepWhatsRaisedTokenNotAccepted":
      return new KeepWhatsRaisedTokenNotAcceptedError({ token: args["token"] as string });
    case "KeepWhatsRaisedRewardExists":
      return new KeepWhatsRaisedRewardExistsError();
    case "KeepWhatsRaisedDisabled":
      return new KeepWhatsRaisedDisabledError();
    case "KeepWhatsRaisedAlreadyEnabled":
      return new KeepWhatsRaisedAlreadyEnabledError();
    case "KeepWhatsRaisedInsufficientFundsForWithdrawalAndFee":
      return new KeepWhatsRaisedInsufficientFundsForWithdrawalAndFeeError({
        availableAmount: args["availableAmount"] as string,
        withdrawalAmount: args["withdrawalAmount"] as string,
        fee: args["fee"] as string,
      });
    case "KeepWhatsRaisedInsufficientFundsForFee":
      return new KeepWhatsRaisedInsufficientFundsForFeeError({
        withdrawalAmount: args["withdrawalAmount"] as string,
        fee: args["fee"] as string,
      });
    case "KeepWhatsRaisedAlreadyWithdrawn":
      return new KeepWhatsRaisedAlreadyWithdrawnError();
    case "KeepWhatsRaisedAlreadyClaimed":
      return new KeepWhatsRaisedAlreadyClaimedError();
    case "KeepWhatsRaisedNotClaimable":
      return new KeepWhatsRaisedNotClaimableError({ tokenId: args["tokenId"] as string });
    case "KeepWhatsRaisedNotClaimableAdmin":
      return new KeepWhatsRaisedNotClaimableAdminError();
    case "KeepWhatsRaisedConfigLocked":
      return new KeepWhatsRaisedConfigLockedError();
    case "KeepWhatsRaisedDisbursementBlocked":
      return new KeepWhatsRaisedDisbursementBlockedError();
    case "KeepWhatsRaisedPledgeAlreadyProcessed":
      return new KeepWhatsRaisedPledgeAlreadyProcessedError({
        pledgeId: args["pledgeId"] as string,
      });
    default:
      return (
        toSharedError(name, args) ??
        new (class extends Error implements ContractErrorBase {
          readonly name = name;
          readonly args = args;
        })(`${name}(${JSON.stringify(args)})`)
      );
  }
}

function toItemRegistryError(name: string, args: Record<string, unknown>): ContractErrorBase {
  switch (name) {
    case "ItemRegistryMismatchedArraysLength":
      return new ItemRegistryMismatchedArraysLengthError();
    default:
      return new (class extends Error implements ContractErrorBase {
        readonly name = name;
        readonly args = args;
      })(`${name}(${JSON.stringify(args)})`);
  }
}

function toPaymentTreasuryError(name: string, args: Record<string, unknown>): ContractErrorBase {
  switch (name) {
    case "PaymentTreasuryUnAuthorized":
      return new PaymentTreasuryUnAuthorizedError();
    case "PaymentTreasuryInvalidInput":
      return new PaymentTreasuryInvalidInputError();
    case "PaymentTreasuryPaymentAlreadyExist":
      return new PaymentTreasuryPaymentAlreadyExistError({
        paymentId: args["paymentId"] as string,
      });
    case "PaymentTreasuryPaymentAlreadyConfirmed":
      return new PaymentTreasuryPaymentAlreadyConfirmedError({
        paymentId: args["paymentId"] as string,
      });
    case "PaymentTreasuryPaymentAlreadyExpired":
      return new PaymentTreasuryPaymentAlreadyExpiredError({
        paymentId: args["paymentId"] as string,
      });
    case "PaymentTreasuryPaymentNotExist":
      return new PaymentTreasuryPaymentNotExistError({
        paymentId: args["paymentId"] as string,
      });
    case "PaymentTreasuryCampaignInfoIsPaused":
      return new PaymentTreasuryCampaignInfoIsPausedError();
    case "PaymentTreasuryTokenNotAccepted":
      return new PaymentTreasuryTokenNotAcceptedError({ token: args["token"] as string });
    case "PaymentTreasurySuccessConditionNotFulfilled":
      return new PaymentTreasurySuccessConditionNotFulfilledError();
    case "PaymentTreasuryFeeNotDisbursed":
      return new PaymentTreasuryFeeNotDisbursedError();
    case "PaymentTreasuryPaymentNotConfirmed":
      return new PaymentTreasuryPaymentNotConfirmedError({
        paymentId: args["paymentId"] as string,
      });
    case "PaymentTreasuryPaymentNotClaimable":
      return new PaymentTreasuryPaymentNotClaimableError({
        paymentId: args["paymentId"] as string,
      });
    case "PaymentTreasuryAlreadyWithdrawn":
      return new PaymentTreasuryAlreadyWithdrawnError();
    case "PaymentTreasuryCryptoPayment":
      return new PaymentTreasuryCryptoPaymentError({
        paymentId: args["paymentId"] as string,
      });
    case "PaymentTreasuryInsufficientFundsForFee":
      return new PaymentTreasuryInsufficientFundsForFeeError({
        withdrawalAmount: args["withdrawalAmount"] as string,
        fee: args["fee"] as string,
      });
    case "PaymentTreasuryInsufficientBalance":
      return new PaymentTreasuryInsufficientBalanceError({
        required: args["required"] as string,
        available: args["available"] as string,
      });
    case "PaymentTreasuryExpirationExceedsMax":
      return new PaymentTreasuryExpirationExceedsMaxError({
        expiration: args["expiration"] as string,
        maxExpiration: args["maxExpiration"] as string,
      });
    case "PaymentTreasuryClaimWindowNotReached":
      return new PaymentTreasuryClaimWindowNotReachedError({
        claimableAt: args["claimableAt"] as string,
      });
    case "PaymentTreasuryNoFundsToClaim":
      return new PaymentTreasuryNoFundsToClaimError();
    default:
      return new (class extends Error implements ContractErrorBase {
        readonly name = name;
        readonly args = args;
      })(`${name}(${JSON.stringify(args)})`);
  }
}

function toTreasuryFactoryError(name: string, args: Record<string, unknown>): ContractErrorBase {
  switch (name) {
    case "TreasuryFactoryUnauthorized":
      return new TreasuryFactoryUnauthorizedError();
    case "TreasuryFactoryInvalidKey":
      return new TreasuryFactoryInvalidKeyError();
    case "TreasuryFactoryTreasuryCreationFailed":
      return new TreasuryFactoryTreasuryCreationFailedError();
    case "TreasuryFactoryInvalidAddress":
      return new TreasuryFactoryInvalidAddressError();
    case "TreasuryFactoryImplementationNotSet":
      return new TreasuryFactoryImplementationNotSetError();
    case "TreasuryFactoryImplementationNotSetOrApproved":
      return new TreasuryFactoryImplementationNotSetOrApprovedError();
    case "TreasuryFactoryTreasuryInitializationFailed":
      return new TreasuryFactoryTreasuryInitializationFailedError();
    case "TreasuryFactorySettingPlatformInfoFailed":
      return new TreasuryFactorySettingPlatformInfoFailedError();
    default:
      return (
        toSharedError(name, args) ??
        new (class extends Error implements ContractErrorBase {
          readonly name = name;
          readonly args = args;
        })(`${name}(${JSON.stringify(args)})`)
      );
  }
}

type AbiEntry = { type: string; name?: string; inputs?: readonly { name: string }[] };

function tryDecode(
  abi: readonly AbiEntry[],
  data: Hex,
  toError: (name: string, args: Record<string, unknown>) => ContractErrorBase,
): ContractErrorBase | null {
  try {
    const decoded = decodeErrorResult({ abi: abi as Parameters<typeof decodeErrorResult>[0]["abi"], data });
    const decodedArgs = (decoded.args ?? []) as readonly unknown[];
    const args = decodeArgs(abi, decoded.errorName, decodedArgs);
    return toError(decoded.errorName, args);
  } catch {
    return null;
  }
}

/**
 * Parses raw revert data from a contract call and returns a typed SDK error if the error
 * is recognized. Supports: GlobalParams, CampaignInfoFactory, CampaignInfo, AllOrNothing,
 * KeepWhatsRaised, ItemRegistry, PaymentTreasury, TreasuryFactory.
 * Returns null if the data is not valid or not from a known contract.
 *
 * Use this when you have raw revert data (e.g. from a provider or estimateGas) and want
 * to get a typed, discriminable error with decoded args and optional recovery hints.
 *
 * @param revertData - Hex string (0x + selector + encoded args), e.g. from catch (e) \{ e.data \}
 * @returns Typed ContractErrorBase instance or null
 */
export function parseContractError(revertData: string): ContractErrorBase | null {
  if (!revertData || !isHex(revertData) || revertData.length < 10) {
    return null;
  }

  const data = revertData as Hex;

  return (
    tryDecode(GLOBAL_PARAMS_ABI, data, toGlobalParamsError) ??
    tryDecode(CAMPAIGN_INFO_FACTORY_ABI, data, toCampaignInfoFactoryError) ??
    tryDecode(CAMPAIGN_INFO_ABI, data, toCampaignInfoError) ??
    tryDecode(ALL_OR_NOTHING_ABI, data, toAllOrNothingError) ??
    tryDecode(KEEP_WHATS_RAISED_ABI, data, toKeepWhatsRaisedError) ??
    tryDecode(ITEM_REGISTRY_ABI, data, toItemRegistryError) ??
    tryDecode(PAYMENT_TREASURY_ABI, data, toPaymentTreasuryError) ??
    tryDecode(TREASURY_FACTORY_ABI, data, toTreasuryFactoryError) ??
    null
  );
}
