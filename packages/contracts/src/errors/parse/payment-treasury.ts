import type { Hex } from "../../lib";
import type { ContractErrorBase } from "../base";
import { PAYMENT_TREASURY_ABI } from "../../contracts/payment-treasury/abi";
import {
  PaymentTreasuryAlreadyWithdrawnError,
  PaymentTreasuryCampaignInfoIsPausedError,
  PaymentTreasuryClaimWindowNotReachedError,
  PaymentTreasuryCryptoPaymentError,
  PaymentTreasuryErrorNames,
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
} from "../contracts/payment-treasury";
import type { ErrorAbiEntry } from "./shared";
import { tryDecodeContractError } from "./shared";

/**
 * Maps a decoded PaymentTreasury error name and args to a typed SDK error instance.
 * @param name - Decoded error name string
 * @param args - Decoded error arguments
 * @returns Typed PaymentTreasury error, or a shared/generic fallback
 */
function toPaymentTreasuryError(name: string, args: Record<string, unknown>): ContractErrorBase {
  switch (name) {
    case PaymentTreasuryErrorNames.UnAuthorized:
      return new PaymentTreasuryUnAuthorizedError();
    case PaymentTreasuryErrorNames.InvalidInput:
      return new PaymentTreasuryInvalidInputError();
    case PaymentTreasuryErrorNames.PaymentAlreadyExist:
      return new PaymentTreasuryPaymentAlreadyExistError({
        paymentId: args["paymentId"] as string,
      });
    case PaymentTreasuryErrorNames.PaymentAlreadyConfirmed:
      return new PaymentTreasuryPaymentAlreadyConfirmedError({
        paymentId: args["paymentId"] as string,
      });
    case PaymentTreasuryErrorNames.PaymentAlreadyExpired:
      return new PaymentTreasuryPaymentAlreadyExpiredError({
        paymentId: args["paymentId"] as string,
      });
    case PaymentTreasuryErrorNames.PaymentNotExist:
      return new PaymentTreasuryPaymentNotExistError({
        paymentId: args["paymentId"] as string,
      });
    case PaymentTreasuryErrorNames.CampaignInfoIsPaused:
      return new PaymentTreasuryCampaignInfoIsPausedError();
    case PaymentTreasuryErrorNames.TokenNotAccepted:
      return new PaymentTreasuryTokenNotAcceptedError({ token: args["token"] as string });
    case PaymentTreasuryErrorNames.SuccessConditionNotFulfilled:
      return new PaymentTreasurySuccessConditionNotFulfilledError();
    case PaymentTreasuryErrorNames.FeeNotDisbursed:
      return new PaymentTreasuryFeeNotDisbursedError();
    case PaymentTreasuryErrorNames.PaymentNotConfirmed:
      return new PaymentTreasuryPaymentNotConfirmedError({
        paymentId: args["paymentId"] as string,
      });
    case PaymentTreasuryErrorNames.PaymentNotClaimable:
      return new PaymentTreasuryPaymentNotClaimableError({
        paymentId: args["paymentId"] as string,
      });
    case PaymentTreasuryErrorNames.AlreadyWithdrawn:
      return new PaymentTreasuryAlreadyWithdrawnError();
    case PaymentTreasuryErrorNames.CryptoPayment:
      return new PaymentTreasuryCryptoPaymentError({
        paymentId: args["paymentId"] as string,
      });
    case PaymentTreasuryErrorNames.InsufficientFundsForFee:
      return new PaymentTreasuryInsufficientFundsForFeeError({
        withdrawalAmount: args["withdrawalAmount"] as string,
        fee: args["fee"] as string,
      });
    case PaymentTreasuryErrorNames.InsufficientBalance:
      return new PaymentTreasuryInsufficientBalanceError({
        required: args["required"] as string,
        available: args["available"] as string,
      });
    case PaymentTreasuryErrorNames.ExpirationExceedsMax:
      return new PaymentTreasuryExpirationExceedsMaxError({
        expiration: args["expiration"] as string,
        maxExpiration: args["maxExpiration"] as string,
      });
    case PaymentTreasuryErrorNames.ClaimWindowNotReached:
      return new PaymentTreasuryClaimWindowNotReachedError({
        claimableAt: args["claimableAt"] as string,
      });
    case PaymentTreasuryErrorNames.NoFundsToClaim:
      return new PaymentTreasuryNoFundsToClaimError();
    /* istanbul ignore next -- defensive fallback; all ABI errors are handled above */
    default:
      return new (class extends Error implements ContractErrorBase {
        readonly name = name;
        readonly args = args;
      })(`${name}(${JSON.stringify(args)})`);
  }
}

/**
 * Decodes raw revert data from a PaymentTreasury contract call into a typed SDK error.
 * @param data - 0x-prefixed hex revert data
 * @returns Typed PaymentTreasury error instance, or null if the selector is not recognised
 */
export function parsePaymentTreasuryError(data: Hex): ContractErrorBase | null {
  return tryDecodeContractError(
    PAYMENT_TREASURY_ABI as readonly ErrorAbiEntry[],
    data,
    toPaymentTreasuryError,
  );
}
