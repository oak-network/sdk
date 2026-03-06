import type { ContractErrorBase } from "./contract-error.js";

export class PaymentTreasuryUnAuthorizedError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryUnAuthorized";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Caller is not authorized for this operation on the PaymentTreasury.";

  constructor() {
    super("PaymentTreasuryUnAuthorized()");
    Object.setPrototypeOf(this, PaymentTreasuryUnAuthorizedError.prototype);
  }
}

export class PaymentTreasuryInvalidInputError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryInvalidInput";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "One or more inputs are invalid. Check all provided parameters.";

  constructor() {
    super("PaymentTreasuryInvalidInput()");
    Object.setPrototypeOf(this, PaymentTreasuryInvalidInputError.prototype);
  }
}

export class PaymentTreasuryPaymentAlreadyExistError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryPaymentAlreadyExist";
  readonly args: { paymentId: string };
  readonly recoveryHint = "A payment with this ID already exists. Use a unique payment ID.";

  constructor(args: { paymentId: string }) {
    super(`PaymentTreasuryPaymentAlreadyExist(paymentId: ${args.paymentId})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryPaymentAlreadyExistError.prototype);
  }
}

export class PaymentTreasuryPaymentAlreadyConfirmedError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryPaymentAlreadyConfirmed";
  readonly args: { paymentId: string };
  readonly recoveryHint = "This payment has already been confirmed and cannot be confirmed again.";

  constructor(args: { paymentId: string }) {
    super(`PaymentTreasuryPaymentAlreadyConfirmed(paymentId: ${args.paymentId})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryPaymentAlreadyConfirmedError.prototype);
  }
}

export class PaymentTreasuryPaymentAlreadyExpiredError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryPaymentAlreadyExpired";
  readonly args: { paymentId: string };
  readonly recoveryHint = "This payment has expired and can no longer be confirmed or modified.";

  constructor(args: { paymentId: string }) {
    super(`PaymentTreasuryPaymentAlreadyExpired(paymentId: ${args.paymentId})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryPaymentAlreadyExpiredError.prototype);
  }
}

export class PaymentTreasuryPaymentNotExistError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryPaymentNotExist";
  readonly args: { paymentId: string };
  readonly recoveryHint = "No payment found with this ID. Check the payment ID and try again.";

  constructor(args: { paymentId: string }) {
    super(`PaymentTreasuryPaymentNotExist(paymentId: ${args.paymentId})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryPaymentNotExistError.prototype);
  }
}

export class PaymentTreasuryCampaignInfoIsPausedError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryCampaignInfoIsPaused";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The campaign is paused. Unpause the campaign before performing this operation.";

  constructor() {
    super("PaymentTreasuryCampaignInfoIsPaused()");
    Object.setPrototypeOf(this, PaymentTreasuryCampaignInfoIsPausedError.prototype);
  }
}

export class PaymentTreasuryTokenNotAcceptedError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryTokenNotAccepted";
  readonly args: { token: string };
  readonly recoveryHint = "This token is not accepted for payment. Use an accepted token for this campaign.";

  constructor(args: { token: string }) {
    super(`PaymentTreasuryTokenNotAccepted(token: ${args.token})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryTokenNotAcceptedError.prototype);
  }
}

export class PaymentTreasurySuccessConditionNotFulfilledError
  extends Error
  implements ContractErrorBase
{
  readonly name = "PaymentTreasurySuccessConditionNotFulfilled";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "The campaign success condition has not been fulfilled. The goal amount must be reached before withdrawing.";

  constructor() {
    super("PaymentTreasurySuccessConditionNotFulfilled()");
    Object.setPrototypeOf(this, PaymentTreasurySuccessConditionNotFulfilledError.prototype);
  }
}

export class PaymentTreasuryFeeNotDisbursedError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryFeeNotDisbursed";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Fees have not been disbursed yet. Call disburseFees() before withdrawing.";

  constructor() {
    super("PaymentTreasuryFeeNotDisbursed()");
    Object.setPrototypeOf(this, PaymentTreasuryFeeNotDisbursedError.prototype);
  }
}

export class PaymentTreasuryPaymentNotConfirmedError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryPaymentNotConfirmed";
  readonly args: { paymentId: string };
  readonly recoveryHint = "This payment has not been confirmed yet. Confirm the payment before claiming.";

  constructor(args: { paymentId: string }) {
    super(`PaymentTreasuryPaymentNotConfirmed(paymentId: ${args.paymentId})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryPaymentNotConfirmedError.prototype);
  }
}

export class PaymentTreasuryPaymentNotClaimableError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryPaymentNotClaimable";
  readonly args: { paymentId: string };
  readonly recoveryHint =
    "This payment is not claimable. It may not be confirmed, may have expired, or the claim window has not been reached.";

  constructor(args: { paymentId: string }) {
    super(`PaymentTreasuryPaymentNotClaimable(paymentId: ${args.paymentId})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryPaymentNotClaimableError.prototype);
  }
}

export class PaymentTreasuryAlreadyWithdrawnError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryAlreadyWithdrawn";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Funds have already been withdrawn from this treasury.";

  constructor() {
    super("PaymentTreasuryAlreadyWithdrawn()");
    Object.setPrototypeOf(this, PaymentTreasuryAlreadyWithdrawnError.prototype);
  }
}

export class PaymentTreasuryCryptoPaymentError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryCryptoPayment";
  readonly args: { paymentId: string };
  readonly recoveryHint =
    "This payment is a crypto payment and cannot be processed through this flow. Use processCryptoPayment() instead.";

  constructor(args: { paymentId: string }) {
    super(`PaymentTreasuryCryptoPayment(paymentId: ${args.paymentId})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryCryptoPaymentError.prototype);
  }
}

export class PaymentTreasuryInsufficientFundsForFeeError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryInsufficientFundsForFee";
  readonly args: { withdrawalAmount: string; fee: string };
  readonly recoveryHint =
    "Insufficient funds to cover the withdrawal fee. Ensure the treasury has enough balance to pay the fee.";

  constructor(args: { withdrawalAmount: string; fee: string }) {
    super(
      `PaymentTreasuryInsufficientFundsForFee(withdrawalAmount: ${args.withdrawalAmount}, fee: ${args.fee})`,
    );
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryInsufficientFundsForFeeError.prototype);
  }
}

export class PaymentTreasuryInsufficientBalanceError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryInsufficientBalance";
  readonly args: { required: string; available: string };
  readonly recoveryHint =
    "Insufficient balance in the treasury. The required amount exceeds the available funds.";

  constructor(args: { required: string; available: string }) {
    super(
      `PaymentTreasuryInsufficientBalance(required: ${args.required}, available: ${args.available})`,
    );
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryInsufficientBalanceError.prototype);
  }
}

export class PaymentTreasuryExpirationExceedsMaxError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryExpirationExceedsMax";
  readonly args: { expiration: string; maxExpiration: string };
  readonly recoveryHint =
    "The payment expiration exceeds the maximum allowed expiration. Use a shorter expiration time.";

  constructor(args: { expiration: string; maxExpiration: string }) {
    super(
      `PaymentTreasuryExpirationExceedsMax(expiration: ${args.expiration}, maxExpiration: ${args.maxExpiration})`,
    );
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryExpirationExceedsMaxError.prototype);
  }
}

export class PaymentTreasuryClaimWindowNotReachedError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryClaimWindowNotReached";
  readonly args: { claimableAt: string };
  readonly recoveryHint =
    "The claim window has not been reached yet. Wait until the claimableAt timestamp before claiming.";

  constructor(args: { claimableAt: string }) {
    super(`PaymentTreasuryClaimWindowNotReached(claimableAt: ${args.claimableAt})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryClaimWindowNotReachedError.prototype);
  }
}

export class PaymentTreasuryNoFundsToClaimError extends Error implements ContractErrorBase {
  readonly name = "PaymentTreasuryNoFundsToClaim";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "There are no funds available to claim at this time.";

  constructor() {
    super("PaymentTreasuryNoFundsToClaim()");
    Object.setPrototypeOf(this, PaymentTreasuryNoFundsToClaimError.prototype);
  }
}

export type PaymentTreasuryError =
  | PaymentTreasuryUnAuthorizedError
  | PaymentTreasuryInvalidInputError
  | PaymentTreasuryPaymentAlreadyExistError
  | PaymentTreasuryPaymentAlreadyConfirmedError
  | PaymentTreasuryPaymentAlreadyExpiredError
  | PaymentTreasuryPaymentNotExistError
  | PaymentTreasuryCampaignInfoIsPausedError
  | PaymentTreasuryTokenNotAcceptedError
  | PaymentTreasurySuccessConditionNotFulfilledError
  | PaymentTreasuryFeeNotDisbursedError
  | PaymentTreasuryPaymentNotConfirmedError
  | PaymentTreasuryPaymentNotClaimableError
  | PaymentTreasuryAlreadyWithdrawnError
  | PaymentTreasuryCryptoPaymentError
  | PaymentTreasuryInsufficientFundsForFeeError
  | PaymentTreasuryInsufficientBalanceError
  | PaymentTreasuryExpirationExceedsMaxError
  | PaymentTreasuryClaimWindowNotReachedError
  | PaymentTreasuryNoFundsToClaimError;
