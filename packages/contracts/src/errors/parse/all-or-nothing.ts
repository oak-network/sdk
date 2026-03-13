import type { Hex } from "../../lib";
import type { ContractErrorBase } from "../base";
import { ALL_OR_NOTHING_ABI } from "../../contracts/all-or-nothing/abi";
import {
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
} from "../contracts/all-or-nothing";
import type { ErrorAbiEntry } from "./shared";
import { toSharedContractError, tryDecodeContractError } from "./shared";

/**
 * Maps a decoded AllOrNothing error name and args to a typed SDK error instance.
 * @param name - Decoded error name string
 * @param args - Decoded error arguments
 * @returns Typed AllOrNothing error, or a shared/generic fallback
 */
function toAllOrNothingError(name: string, args: Record<string, unknown>): ContractErrorBase {
  switch (name) {
    case AllOrNothingErrorNames.FeeNotDisbursed:
      return new AllOrNothingFeeNotDisbursedError();
    case AllOrNothingErrorNames.FeeAlreadyDisbursed:
      return new AllOrNothingFeeAlreadyDisbursedError();
    case AllOrNothingErrorNames.InvalidInput:
      return new AllOrNothingInvalidInputError();
    case AllOrNothingErrorNames.NotClaimable:
      return new AllOrNothingNotClaimableError({ tokenId: args["tokenId"] as string });
    case AllOrNothingErrorNames.NotSuccessful:
      return new AllOrNothingNotSuccessfulError();
    case AllOrNothingErrorNames.RewardExists:
      return new AllOrNothingRewardExistsError();
    case AllOrNothingErrorNames.TransferFailed:
      return new AllOrNothingTransferFailedError();
    case AllOrNothingErrorNames.UnAuthorized:
      return new AllOrNothingUnAuthorizedError();
    case AllOrNothingErrorNames.TokenNotAccepted:
      return new AllOrNothingTokenNotAcceptedError({ token: args["token"] as string });
    case AllOrNothingErrorNames.TreasurySuccessConditionNotFulfilled:
      return new TreasurySuccessConditionNotFulfilledError();
    default:
      return (
        toSharedContractError(name, args) ??
        new (class extends Error implements ContractErrorBase {
          readonly name = name;
          readonly args = args;
        })(`${name}(${JSON.stringify(args)})`)
      );
  }
}

/**
 * Decodes raw revert data from an AllOrNothing treasury contract call into a typed SDK error.
 * @param data - 0x-prefixed hex revert data
 * @returns Typed AllOrNothing error instance, or null if the selector is not recognised
 */
export function parseAllOrNothingError(data: Hex): ContractErrorBase | null {
  return tryDecodeContractError(
    ALL_OR_NOTHING_ABI as readonly ErrorAbiEntry[],
    data,
    toAllOrNothingError,
  );
}
