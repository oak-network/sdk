import type { ContractErrorBase } from "../base";

/** PaymentTreasury error name strings. */
export const PaymentTreasuryErrorNames = {
  UnAuthorized: "PaymentTreasuryUnAuthorized",
  InvalidInput: "PaymentTreasuryInvalidInput",
  PaymentAlreadyExist: "PaymentTreasuryPaymentAlreadyExist",
  PaymentAlreadyConfirmed: "PaymentTreasuryPaymentAlreadyConfirmed",
  PaymentAlreadyExpired: "PaymentTreasuryPaymentAlreadyExpired",
  PaymentNotExist: "PaymentTreasuryPaymentNotExist",
  CampaignInfoIsPaused: "PaymentTreasuryCampaignInfoIsPaused",
  TokenNotAccepted: "PaymentTreasuryTokenNotAccepted",
  SuccessConditionNotFulfilled: "PaymentTreasurySuccessConditionNotFulfilled",
  FeeNotDisbursed: "PaymentTreasuryFeeNotDisbursed",
  PaymentNotConfirmed: "PaymentTreasuryPaymentNotConfirmed",
  PaymentNotClaimable: "PaymentTreasuryPaymentNotClaimable",
  AlreadyWithdrawn: "PaymentTreasuryAlreadyWithdrawn",
  CryptoPayment: "PaymentTreasuryCryptoPayment",
  InsufficientFundsForFee: "PaymentTreasuryInsufficientFundsForFee",
  InsufficientBalance: "PaymentTreasuryInsufficientBalance",
  ExpirationExceedsMax: "PaymentTreasuryExpirationExceedsMax",
  ClaimWindowNotReached: "PaymentTreasuryClaimWindowNotReached",
  NoFundsToClaim: "PaymentTreasuryNoFundsToClaim",
} as const;

/** Thrown when the caller is not authorised for the attempted PaymentTreasury operation. */
export class PaymentTreasuryUnAuthorizedError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.UnAuthorized;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Caller is not authorized for this operation on the PaymentTreasury.";

  constructor() {
    super("PaymentTreasuryUnAuthorized()");
    Object.setPrototypeOf(this, PaymentTreasuryUnAuthorizedError.prototype);
  }
}

/** Thrown when one or more inputs to a PaymentTreasury write are invalid. */
export class PaymentTreasuryInvalidInputError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.InvalidInput;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "One or more inputs are invalid. Check all provided parameters.";

  constructor() {
    super("PaymentTreasuryInvalidInput()");
    Object.setPrototypeOf(this, PaymentTreasuryInvalidInputError.prototype);
  }
}

/** Thrown when createPayment is called with a payment ID that already exists. */
export class PaymentTreasuryPaymentAlreadyExistError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.PaymentAlreadyExist;
  readonly args: { paymentId: string };
  readonly recoveryHint = "A payment with this ID already exists. Use a unique payment ID.";

  constructor(args: { paymentId: string }) {
    super(`PaymentTreasuryPaymentAlreadyExist(paymentId: ${args.paymentId})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryPaymentAlreadyExistError.prototype);
  }
}

/** Thrown when confirmPayment is called for a payment that has already been confirmed. */
export class PaymentTreasuryPaymentAlreadyConfirmedError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.PaymentAlreadyConfirmed;
  readonly args: { paymentId: string };
  readonly recoveryHint = "This payment has already been confirmed and cannot be confirmed again.";

  constructor(args: { paymentId: string }) {
    super(`PaymentTreasuryPaymentAlreadyConfirmed(paymentId: ${args.paymentId})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryPaymentAlreadyConfirmedError.prototype);
  }
}

/** Thrown when an operation is attempted on a payment that has passed its expiration timestamp. */
export class PaymentTreasuryPaymentAlreadyExpiredError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.PaymentAlreadyExpired;
  readonly args: { paymentId: string };
  readonly recoveryHint = "This payment has expired and can no longer be confirmed or modified.";

  constructor(args: { paymentId: string }) {
    super(`PaymentTreasuryPaymentAlreadyExpired(paymentId: ${args.paymentId})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryPaymentAlreadyExpiredError.prototype);
  }
}

/** Thrown when an operation references a payment ID that does not exist. */
export class PaymentTreasuryPaymentNotExistError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.PaymentNotExist;
  readonly args: { paymentId: string };
  readonly recoveryHint = "No payment found with this ID. Check the payment ID and try again.";

  constructor(args: { paymentId: string }) {
    super(`PaymentTreasuryPaymentNotExist(paymentId: ${args.paymentId})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryPaymentNotExistError.prototype);
  }
}

/** Thrown when a payment operation is attempted while the linked CampaignInfo is paused. */
export class PaymentTreasuryCampaignInfoIsPausedError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.CampaignInfoIsPaused;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The campaign is paused. Unpause the campaign before performing this operation.";

  constructor() {
    super("PaymentTreasuryCampaignInfoIsPaused()");
    Object.setPrototypeOf(this, PaymentTreasuryCampaignInfoIsPausedError.prototype);
  }
}

/** Thrown when a payment token is not on the accepted list for this campaign's currency. */
export class PaymentTreasuryTokenNotAcceptedError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.TokenNotAccepted;
  readonly args: { token: string };
  readonly recoveryHint = "This token is not accepted for payment. Use an accepted token for this campaign.";

  constructor(args: { token: string }) {
    super(`PaymentTreasuryTokenNotAccepted(token: ${args.token})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryTokenNotAcceptedError.prototype);
  }
}

/** Thrown when withdraw is attempted before the campaign funding goal has been reached. */
export class PaymentTreasurySuccessConditionNotFulfilledError
  extends Error
  implements ContractErrorBase
{
  readonly name = PaymentTreasuryErrorNames.SuccessConditionNotFulfilled;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "The campaign success condition has not been fulfilled. The goal amount must be reached before withdrawing.";

  constructor() {
    super("PaymentTreasurySuccessConditionNotFulfilled()");
    Object.setPrototypeOf(this, PaymentTreasurySuccessConditionNotFulfilledError.prototype);
  }
}

/** Thrown when withdraw is called before disburseFees has been executed. */
export class PaymentTreasuryFeeNotDisbursedError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.FeeNotDisbursed;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Fees have not been disbursed yet. Call disburseFees() before withdrawing.";

  constructor() {
    super("PaymentTreasuryFeeNotDisbursed()");
    Object.setPrototypeOf(this, PaymentTreasuryFeeNotDisbursedError.prototype);
  }
}

/** Thrown when a claim or fund-release operation requires confirmation that has not yet occurred. */
export class PaymentTreasuryPaymentNotConfirmedError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.PaymentNotConfirmed;
  readonly args: { paymentId: string };
  readonly recoveryHint = "This payment has not been confirmed yet. Confirm the payment before claiming.";

  constructor(args: { paymentId: string }) {
    super(`PaymentTreasuryPaymentNotConfirmed(paymentId: ${args.paymentId})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryPaymentNotConfirmedError.prototype);
  }
}

/** Thrown when claimRefund is called for a payment that does not meet refund eligibility conditions. */
export class PaymentTreasuryPaymentNotClaimableError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.PaymentNotClaimable;
  readonly args: { paymentId: string };
  readonly recoveryHint =
    "This payment is not claimable. It may not be confirmed, may have expired, or the claim window has not been reached.";

  constructor(args: { paymentId: string }) {
    super(`PaymentTreasuryPaymentNotClaimable(paymentId: ${args.paymentId})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryPaymentNotClaimableError.prototype);
  }
}

/** Thrown when withdraw is called after funds have already been withdrawn. */
export class PaymentTreasuryAlreadyWithdrawnError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.AlreadyWithdrawn;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Funds have already been withdrawn from this treasury.";

  constructor() {
    super("PaymentTreasuryAlreadyWithdrawn()");
    Object.setPrototypeOf(this, PaymentTreasuryAlreadyWithdrawnError.prototype);
  }
}

/** Thrown when a non-crypto payment flow is used for a payment that was created as a crypto payment. */
export class PaymentTreasuryCryptoPaymentError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.CryptoPayment;
  readonly args: { paymentId: string };
  readonly recoveryHint =
    "This payment is a crypto payment and cannot be processed through this flow. Use processCryptoPayment() instead.";

  constructor(args: { paymentId: string }) {
    super(`PaymentTreasuryCryptoPayment(paymentId: ${args.paymentId})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryCryptoPaymentError.prototype);
  }
}

/** Thrown when the treasury balance is insufficient to cover the withdrawal fee. */
export class PaymentTreasuryInsufficientFundsForFeeError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.InsufficientFundsForFee;
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

/** Thrown when a requested amount exceeds the available treasury balance. */
export class PaymentTreasuryInsufficientBalanceError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.InsufficientBalance;
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

/** Thrown when a payment expiration timestamp exceeds the maximum allowed duration. */
export class PaymentTreasuryExpirationExceedsMaxError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.ExpirationExceedsMax;
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

/** Thrown when a claim is attempted before the claimable timestamp has been reached. */
export class PaymentTreasuryClaimWindowNotReachedError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.ClaimWindowNotReached;
  readonly args: { claimableAt: string };
  readonly recoveryHint =
    "The claim window has not been reached yet. Wait until the claimableAt timestamp before claiming.";

  constructor(args: { claimableAt: string }) {
    super(`PaymentTreasuryClaimWindowNotReached(claimableAt: ${args.claimableAt})`);
    this.args = args;
    Object.setPrototypeOf(this, PaymentTreasuryClaimWindowNotReachedError.prototype);
  }
}

/** Thrown when claimExpiredFunds or a similar operation finds no claimable funds available. */
export class PaymentTreasuryNoFundsToClaimError extends Error implements ContractErrorBase {
  readonly name = PaymentTreasuryErrorNames.NoFundsToClaim;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "There are no funds available to claim at this time.";

  constructor() {
    super("PaymentTreasuryNoFundsToClaim()");
    Object.setPrototypeOf(this, PaymentTreasuryNoFundsToClaimError.prototype);
  }
}

/** Union of all typed errors that can be thrown by PaymentTreasury contract calls. */
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
