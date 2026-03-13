import type { ContractErrorBase } from "../base";

/** AllOrNothing + TreasurySuccessConditionNotFulfilled error name strings. */
export const AllOrNothingErrorNames = {
  FeeNotDisbursed: "AllOrNothingFeeNotDisbursed",
  FeeAlreadyDisbursed: "AllOrNothingFeeAlreadyDisbursed",
  InvalidInput: "AllOrNothingInvalidInput",
  NotClaimable: "AllOrNothingNotClaimable",
  NotSuccessful: "AllOrNothingNotSuccessful",
  RewardExists: "AllOrNothingRewardExists",
  TransferFailed: "AllOrNothingTransferFailed",
  UnAuthorized: "AllOrNothingUnAuthorized",
  TokenNotAccepted: "AllOrNothingTokenNotAccepted",
  TreasurySuccessConditionNotFulfilled: "TreasurySuccessConditionNotFulfilled",
} as const;

/** Thrown when a withdrawal is attempted before protocol/platform fees have been disbursed. */
export class AllOrNothingFeeNotDisbursedError extends Error implements ContractErrorBase {
  readonly name = AllOrNothingErrorNames.FeeNotDisbursed;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Fees have not been disbursed yet. Call disburseFees() before withdrawing.";

  constructor() {
    super(`${AllOrNothingErrorNames.FeeNotDisbursed}()`);
    Object.setPrototypeOf(this, AllOrNothingFeeNotDisbursedError.prototype);
  }
}

/** Thrown when disburseFees is called after fees have already been disbursed. */
export class AllOrNothingFeeAlreadyDisbursedError extends Error implements ContractErrorBase {
  readonly name = AllOrNothingErrorNames.FeeAlreadyDisbursed;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Fees have already been disbursed for this campaign.";

  constructor() {
    super(`${AllOrNothingErrorNames.FeeAlreadyDisbursed}()`);
    Object.setPrototypeOf(this, AllOrNothingFeeAlreadyDisbursedError.prototype);
  }
}

/** Thrown when one or more inputs to an AllOrNothing write are invalid. */
export class AllOrNothingInvalidInputError extends Error implements ContractErrorBase {
  readonly name = AllOrNothingErrorNames.InvalidInput;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "One or more inputs are invalid. Check all provided parameters.";

  constructor() {
    super(`${AllOrNothingErrorNames.InvalidInput}()`);
    Object.setPrototypeOf(this, AllOrNothingInvalidInputError.prototype);
  }
}

/** Thrown when claimRefund is called for a pledge NFT that is not eligible for a refund. */
export class AllOrNothingNotClaimableError extends Error implements ContractErrorBase {
  readonly name = AllOrNothingErrorNames.NotClaimable;
  readonly args: { tokenId: string };
  readonly recoveryHint =
    "This pledge NFT is not claimable as a refund. The campaign may have succeeded or the refund window has not opened.";

  constructor(args: { tokenId: string }) {
    super(`${AllOrNothingErrorNames.NotClaimable}(tokenId: ${args.tokenId})`);
    this.args = args;
    Object.setPrototypeOf(this, AllOrNothingNotClaimableError.prototype);
  }
}

/** Thrown when a withdrawal or success-gated operation is attempted on a campaign that did not reach its goal. */
export class AllOrNothingNotSuccessfulError extends Error implements ContractErrorBase {
  readonly name = AllOrNothingErrorNames.NotSuccessful;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The campaign has not reached its goal. This operation requires a successful campaign.";

  constructor() {
    super(`${AllOrNothingErrorNames.NotSuccessful}()`);
    Object.setPrototypeOf(this, AllOrNothingNotSuccessfulError.prototype);
  }
}

/** Thrown when addRewards is called with a reward name that is already registered. */
export class AllOrNothingRewardExistsError extends Error implements ContractErrorBase {
  readonly name = AllOrNothingErrorNames.RewardExists;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "A reward with this name already exists. Use a different reward name or remove the existing one first.";

  constructor() {
    super(`${AllOrNothingErrorNames.RewardExists}()`);
    Object.setPrototypeOf(this, AllOrNothingRewardExistsError.prototype);
  }
}

/** Thrown when an ERC-20 token transfer within the AllOrNothing treasury fails. */
export class AllOrNothingTransferFailedError extends Error implements ContractErrorBase {
  readonly name = AllOrNothingErrorNames.TransferFailed;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Token transfer failed. Check token balances and allowances.";

  constructor() {
    super(`${AllOrNothingErrorNames.TransferFailed}()`);
    Object.setPrototypeOf(this, AllOrNothingTransferFailedError.prototype);
  }
}

/** Thrown when the caller is not authorised for the attempted AllOrNothing operation. */
export class AllOrNothingUnAuthorizedError extends Error implements ContractErrorBase {
  readonly name = AllOrNothingErrorNames.UnAuthorized;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Caller is not authorized for this operation on the AllOrNothing treasury.";

  constructor() {
    super(`${AllOrNothingErrorNames.UnAuthorized}()`);
    Object.setPrototypeOf(this, AllOrNothingUnAuthorizedError.prototype);
  }
}

/** Thrown when a pledge token is not on the accepted list for this campaign's currency. */
export class AllOrNothingTokenNotAcceptedError extends Error implements ContractErrorBase {
  readonly name = AllOrNothingErrorNames.TokenNotAccepted;
  readonly args: { token: string };
  readonly recoveryHint = "This token is not accepted for pledging. Use an accepted token for this campaign.";

  constructor(args: { token: string }) {
    super(`${AllOrNothingErrorNames.TokenNotAccepted}(token: ${args.token})`);
    this.args = args;
    Object.setPrototypeOf(this, AllOrNothingTokenNotAcceptedError.prototype);
  }
}

/** Thrown when a success-gated operation is attempted before the campaign goal has been met. */
export class TreasurySuccessConditionNotFulfilledError extends Error implements ContractErrorBase {
  readonly name = AllOrNothingErrorNames.TreasurySuccessConditionNotFulfilled;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "The campaign success condition has not been fulfilled. The goal amount must be reached before withdrawing.";

  constructor() {
    super(`${AllOrNothingErrorNames.TreasurySuccessConditionNotFulfilled}()`);
    Object.setPrototypeOf(this, TreasurySuccessConditionNotFulfilledError.prototype);
  }
}

/** Union of all typed errors that can be thrown by AllOrNothing treasury contract calls. */
export type AllOrNothingError =
  | AllOrNothingFeeNotDisbursedError
  | AllOrNothingFeeAlreadyDisbursedError
  | AllOrNothingInvalidInputError
  | AllOrNothingNotClaimableError
  | AllOrNothingNotSuccessfulError
  | AllOrNothingRewardExistsError
  | AllOrNothingTransferFailedError
  | AllOrNothingUnAuthorizedError
  | AllOrNothingTokenNotAcceptedError
  | TreasurySuccessConditionNotFulfilledError;
