import type { Hex } from "../../lib";
import type { ContractErrorBase } from "../base";
import { GLOBAL_PARAMS_ABI } from "../../contracts/global-params/abi";
import {
  GlobalParamsCurrencyHasNoTokensError,
  GlobalParamsCurrencyTokenLengthMismatchError,
  GlobalParamsErrorNames,
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
} from "../contracts/global-params";
import type { ErrorAbiEntry } from "./shared";
import { toSharedContractError, tryDecodeContractError } from "./shared";

/**
 * Maps a decoded GlobalParams error name and args to a typed SDK error instance.
 * @param name - Decoded error name string
 * @param args - Decoded error arguments
 * @returns Typed GlobalParams error, or a shared/generic fallback
 */
function toGlobalParamsError(name: string, args: Record<string, unknown>): ContractErrorBase {
  switch (name) {
    case GlobalParamsErrorNames.InvalidInput:
      return new GlobalParamsInvalidInputError();
    case GlobalParamsErrorNames.PlatformAdminNotSet:
      return new GlobalParamsPlatformAdminNotSetError({
        platformBytes: args["platformBytes"] as string,
      });
    case GlobalParamsErrorNames.PlatformAlreadyListed:
      return new GlobalParamsPlatformAlreadyListedError({
        platformBytes: args["platformBytes"] as string,
      });
    case GlobalParamsErrorNames.PlatformDataAlreadySet:
      return new GlobalParamsPlatformDataAlreadySetError();
    case GlobalParamsErrorNames.PlatformDataNotSet:
      return new GlobalParamsPlatformDataNotSetError();
    case GlobalParamsErrorNames.PlatformDataSlotTaken:
      return new GlobalParamsPlatformDataSlotTakenError();
    case GlobalParamsErrorNames.PlatformFeePercentIsZero:
      return new GlobalParamsPlatformFeePercentIsZeroError({
        platformBytes: args["platformBytes"] as string,
      });
    case GlobalParamsErrorNames.PlatformNotListed:
      return new GlobalParamsPlatformNotListedError({
        platformBytes: args["platformBytes"] as string,
      });
    case GlobalParamsErrorNames.Unauthorized:
      return new GlobalParamsUnauthorizedError();
    case GlobalParamsErrorNames.CurrencyTokenLengthMismatch:
      return new GlobalParamsCurrencyTokenLengthMismatchError();
    case GlobalParamsErrorNames.CurrencyHasNoTokens:
      return new GlobalParamsCurrencyHasNoTokensError({
        currency: args["currency"] as string,
      });
    case GlobalParamsErrorNames.TokenNotInCurrency:
      return new GlobalParamsTokenNotInCurrencyError({
        currency: args["currency"] as string,
        token: args["token"] as string,
      });
    case GlobalParamsErrorNames.PlatformLineItemTypeNotFound:
      return new GlobalParamsPlatformLineItemTypeNotFoundError({
        platformHash: args["platformHash"] as string,
        typeId: args["typeId"] as string,
      });
    /* istanbul ignore next -- defensive fallback; GlobalParams ABI has no shared error selectors */
    default: {
      const shared = toSharedContractError(name, args);
      if (!shared) {
        return new (class extends Error implements ContractErrorBase {
          readonly name = name;
          readonly args = args;
        })(`${name}(${JSON.stringify(args)})`);
      }
      return shared;
    }
  }
}

/**
 * Decodes raw revert data from a GlobalParams contract call into a typed SDK error.
 * @param data - 0x-prefixed hex revert data
 * @returns Typed GlobalParams error instance, or null if the selector is not recognised
 */
export function parseGlobalParamsError(data: Hex): ContractErrorBase | null {
  return tryDecodeContractError(
    GLOBAL_PARAMS_ABI as readonly ErrorAbiEntry[],
    data,
    toGlobalParamsError,
  );
}
