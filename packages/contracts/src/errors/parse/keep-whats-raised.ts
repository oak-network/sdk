import type { Hex } from "../../lib";
import type { ContractErrorBase } from "../base";
import { KEEP_WHATS_RAISED_ABI } from "../../contracts/keep-whats-raised/abi";
import {
  KeepWhatsRaisedAlreadyClaimedError,
  KeepWhatsRaisedAlreadyEnabledError,
  KeepWhatsRaisedAlreadyWithdrawnError,
  KeepWhatsRaisedConfigLockedError,
  KeepWhatsRaisedDisabledError,
  KeepWhatsRaisedDisbursementBlockedError,
  KeepWhatsRaisedErrorNames,
  KeepWhatsRaisedInsufficientFundsForFeeError,
  KeepWhatsRaisedInsufficientFundsForWithdrawalAndFeeError,
  KeepWhatsRaisedInvalidInputError,
  KeepWhatsRaisedNotClaimableAdminError,
  KeepWhatsRaisedNotClaimableError,
  KeepWhatsRaisedPledgeAlreadyProcessedError,
  KeepWhatsRaisedRewardExistsError,
  KeepWhatsRaisedTokenNotAcceptedError,
  KeepWhatsRaisedUnAuthorizedError,
} from "../contracts/keep-whats-raised";
import type { ErrorAbiEntry } from "./shared";
import { toSharedContractError, tryDecodeContractError } from "./shared";

/**
 * Maps a decoded KeepWhatsRaised error name and args to a typed SDK error instance.
 * @param name - Decoded error name string
 * @param args - Decoded error arguments
 * @returns Typed KeepWhatsRaised error, or a shared/generic fallback
 */
function toKeepWhatsRaisedError(name: string, args: Record<string, unknown>): ContractErrorBase {
  switch (name) {
    case KeepWhatsRaisedErrorNames.UnAuthorized:
      return new KeepWhatsRaisedUnAuthorizedError();
    case KeepWhatsRaisedErrorNames.InvalidInput:
      return new KeepWhatsRaisedInvalidInputError();
    case KeepWhatsRaisedErrorNames.TokenNotAccepted:
      return new KeepWhatsRaisedTokenNotAcceptedError({ token: args["token"] as string });
    case KeepWhatsRaisedErrorNames.RewardExists:
      return new KeepWhatsRaisedRewardExistsError();
    case KeepWhatsRaisedErrorNames.Disabled:
      return new KeepWhatsRaisedDisabledError();
    case KeepWhatsRaisedErrorNames.AlreadyEnabled:
      return new KeepWhatsRaisedAlreadyEnabledError();
    case KeepWhatsRaisedErrorNames.InsufficientFundsForWithdrawalAndFee:
      return new KeepWhatsRaisedInsufficientFundsForWithdrawalAndFeeError({
        availableAmount: args["availableAmount"] as string,
        withdrawalAmount: args["withdrawalAmount"] as string,
        fee: args["fee"] as string,
      });
    case KeepWhatsRaisedErrorNames.InsufficientFundsForFee:
      return new KeepWhatsRaisedInsufficientFundsForFeeError({
        withdrawalAmount: args["withdrawalAmount"] as string,
        fee: args["fee"] as string,
      });
    case KeepWhatsRaisedErrorNames.AlreadyWithdrawn:
      return new KeepWhatsRaisedAlreadyWithdrawnError();
    case KeepWhatsRaisedErrorNames.AlreadyClaimed:
      return new KeepWhatsRaisedAlreadyClaimedError();
    case KeepWhatsRaisedErrorNames.NotClaimable:
      return new KeepWhatsRaisedNotClaimableError({ tokenId: args["tokenId"] as string });
    case KeepWhatsRaisedErrorNames.NotClaimableAdmin:
      return new KeepWhatsRaisedNotClaimableAdminError();
    case KeepWhatsRaisedErrorNames.ConfigLocked:
      return new KeepWhatsRaisedConfigLockedError();
    case KeepWhatsRaisedErrorNames.DisbursementBlocked:
      return new KeepWhatsRaisedDisbursementBlockedError();
    case KeepWhatsRaisedErrorNames.PledgeAlreadyProcessed:
      return new KeepWhatsRaisedPledgeAlreadyProcessedError({
        pledgeId: args["pledgeId"] as string,
      });
    default: {
      const shared = toSharedContractError(name, args);
      /* istanbul ignore next -- defensive fallback; all shared errors are recognised */
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
 * Decodes raw revert data from a KeepWhatsRaised treasury contract call into a typed SDK error.
 * @param data - 0x-prefixed hex revert data
 * @returns Typed KeepWhatsRaised error instance, or null if the selector is not recognised
 */
export function parseKeepWhatsRaisedError(data: Hex): ContractErrorBase | null {
  return tryDecodeContractError(
    KEEP_WHATS_RAISED_ABI as readonly ErrorAbiEntry[],
    data,
    toKeepWhatsRaisedError,
  );
}
