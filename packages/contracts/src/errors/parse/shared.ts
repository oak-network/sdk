/**
 * Shared error-decoding helpers used by all per-contract error parsers.
 */

import { decodeErrorResult } from "../../lib";
import type { Hex } from "../../lib";
import type { ContractErrorBase } from "../base";
import {
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
  SharedErrorNames,
  TreasuryCampaignInfoIsPausedError,
  TreasuryFeeNotDisbursedError,
  TreasuryTransferFailedError,
} from "../contracts/shared";

/** Minimal ABI entry shape used by error decoders. */
export type ErrorAbiEntry = {
  type: string;
  name?: string;
  inputs?: readonly { name: string }[];
};

/**
 * Maps a decoded error args tuple to a named record using the ABI parameter names.
 * @param abi - ABI array containing error entries
 * @param errorName - Solidity error name to look up in the ABI
 * @param decodedArgs - Raw decoded args tuple from decodeErrorResult
 * @returns Record mapping each parameter name to its decoded value
 */
export function decodeErrorArgs(
  abi: readonly ErrorAbiEntry[],
  errorName: string,
  decodedArgs: readonly unknown[],
): Record<string, unknown> {
  const args: Record<string, unknown> = {};
  const errorAbi = abi.find((item) => item.type === "error" && item.name === errorName);
  if (errorAbi?.inputs) {
    errorAbi.inputs.forEach((input, i) => {
      if (input.name && decodedArgs[i] !== undefined) {
        const value = decodedArgs[i];
        args[input.name] = typeof value === "bigint" ? String(value) : value;
      }
    });
  }
  return args;
}

/**
 * Maps a shared (cross-contract) error name to a typed SDK error instance.
 * Called by per-contract parsers when they encounter an error they do not own.
 * @param name - Solidity error name from the decoded revert data
 * @param args - Named argument record produced by decodeErrorArgs
 * @returns Typed shared error instance, or null if the name is not a known shared error
 */
export function toSharedContractError(
  name: string,
  args: Record<string, unknown>,
): ContractErrorBase | null {
  switch (name) {
    case SharedErrorNames.AccessCheckerUnauthorized:
      return new AccessCheckerUnauthorizedError();
    case SharedErrorNames.AdminAccessCheckerUnauthorized:
      return new AdminAccessCheckerUnauthorizedError();
    case SharedErrorNames.CurrentTimeIsGreater:
      return new CurrentTimeIsGreaterError({
        inputTime: args["inputTime"] as string,
        currentTime: args["currentTime"] as string,
      });
    case SharedErrorNames.CurrentTimeIsLess:
      return new CurrentTimeIsLessError({
        inputTime: args["inputTime"] as string,
        currentTime: args["currentTime"] as string,
      });
    case SharedErrorNames.CurrentTimeIsNotWithinRange:
      return new CurrentTimeIsNotWithinRangeError({
        initialTime: args["initialTime"] as string,
        finalTime: args["finalTime"] as string,
      });
    case SharedErrorNames.TreasuryCampaignInfoIsPaused:
      return new TreasuryCampaignInfoIsPausedError();
    case SharedErrorNames.TreasuryFeeNotDisbursed:
      return new TreasuryFeeNotDisbursedError();
    case SharedErrorNames.TreasuryTransferFailed:
      return new TreasuryTransferFailedError();
    case SharedErrorNames.PausedError:
      return new PausedErrorError();
    case SharedErrorNames.NotPausedError:
      return new NotPausedErrorError();
    case SharedErrorNames.CancelledError:
      return new CancelledErrorError();
    case SharedErrorNames.NotCancelledError:
      return new NotCancelledErrorError();
    case SharedErrorNames.CannotCancel:
      return new CannotCancelError();
    case SharedErrorNames.PledgeNFTUnAuthorized:
      return new PledgeNFTUnAuthorizedError();
    case SharedErrorNames.PledgeNFTInvalidJsonString:
      return new PledgeNFTInvalidJsonStringError();
    default:
      return null;
  }
}

/**
 * Attempts to decode raw revert data using the given ABI, then maps the result to a typed error.
 * @param abi - Contract ABI containing error definitions
 * @param data - 0x-prefixed hex revert data from a contract call
 * @param toError - Per-contract mapper that converts a decoded error name and args to a typed class
 * @returns Typed error instance if decoding and mapping succeed, null otherwise
 */
export function tryDecodeContractError(
  abi: readonly ErrorAbiEntry[],
  data: Hex,
  toError: (name: string, args: Record<string, unknown>) => ContractErrorBase,
): ContractErrorBase | null {
  try {
    const decoded = decodeErrorResult({
      abi: abi as Parameters<typeof decodeErrorResult>[0]["abi"],
      data,
    });
    const decodedArgs = (decoded.args ?? []) as readonly unknown[];
    const args = decodeErrorArgs(abi, decoded.errorName, decodedArgs);
    return toError(decoded.errorName, args);
  } catch {
    return null;
  }
}
