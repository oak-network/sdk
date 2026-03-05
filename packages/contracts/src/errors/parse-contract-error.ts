import { decodeErrorResult, type Hex } from "viem";
import { GLOBAL_PARAMS_ABI } from "../abis/global-params.js";
import { CAMPAIGN_INFO_FACTORY_ABI } from "../abis/campaign-info-factory.js";
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

function isHex(data: string): data is Hex {
  return typeof data === "string" && data.startsWith("0x") && /^0x[0-9a-fA-F]*$/.test(data);
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
        platformAdminAddress: args["platformAdminAddress"] as string,
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
      return new (class extends Error implements ContractErrorBase {
        readonly name = name;
        readonly args = args;
      })(`${name}(${JSON.stringify(args)})`);
  }
}

/**
 * Parses raw revert data from a contract call and returns a typed SDK error if the error
 * is recognized. Currently supports: GlobalParams, CampaignInfoFactory. Returns null if
 * the data is not valid or not from a known contract.
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

  try {
    const decoded = decodeErrorResult({ abi: GLOBAL_PARAMS_ABI, data });
    const args: Record<string, unknown> = {};
    if (decoded.args) {
      const decodedArgs = decoded.args as readonly unknown[];
      const errorAbi = GLOBAL_PARAMS_ABI.find(
        (item) => item.type === "error" && item.name === decoded.errorName,
      );
      if (errorAbi && "inputs" in errorAbi && errorAbi.inputs) {
        errorAbi.inputs.forEach((input, i) => {
          if (input.name && decodedArgs[i] !== undefined) {
            args[input.name] = decodedArgs[i];
          }
        });
      }
    }
    return toGlobalParamsError(decoded.errorName, args);
  } catch {
    // not a GlobalParams error, try next
  }

  try {
    const decoded = decodeErrorResult({ abi: CAMPAIGN_INFO_FACTORY_ABI, data });
    const args: Record<string, unknown> = {};
    if (decoded.args) {
      const decodedArgs = decoded.args as readonly unknown[];
      const errorAbi = CAMPAIGN_INFO_FACTORY_ABI.find(
        (item) => item.type === "error" && item.name === decoded.errorName,
      );
      if (errorAbi && "inputs" in errorAbi && errorAbi.inputs) {
        errorAbi.inputs.forEach((input, i) => {
          if (input.name && decodedArgs[i] !== undefined) {
            args[input.name] = decodedArgs[i];
          }
        });
      }
    }
    return toCampaignInfoFactoryError(decoded.errorName, args);
  } catch {
    // unknown error
  }

  return null;
}
