import type { ContractErrorBase } from "./contract-error.js";

export class AllOrNothingFeeNotDisbursedError extends Error implements ContractErrorBase {
  readonly name = "AllOrNothingFeeNotDisbursed";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Fees have not been disbursed yet. Call disburseFees() before withdrawing.";

  constructor() {
    super("AllOrNothingFeeNotDisbursed()");
    Object.setPrototypeOf(this, AllOrNothingFeeNotDisbursedError.prototype);
  }
}

export class AllOrNothingFeeAlreadyDisbursedError extends Error implements ContractErrorBase {
  readonly name = "AllOrNothingFeeAlreadyDisbursed";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Fees have already been disbursed for this campaign.";

  constructor() {
    super("AllOrNothingFeeAlreadyDisbursed()");
    Object.setPrototypeOf(this, AllOrNothingFeeAlreadyDisbursedError.prototype);
  }
}

export class AllOrNothingInvalidInputError extends Error implements ContractErrorBase {
  readonly name = "AllOrNothingInvalidInput";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "One or more inputs are invalid. Check all provided parameters.";

  constructor() {
    super("AllOrNothingInvalidInput()");
    Object.setPrototypeOf(this, AllOrNothingInvalidInputError.prototype);
  }
}

export class AllOrNothingNotClaimableError extends Error implements ContractErrorBase {
  readonly name = "AllOrNothingNotClaimable";
  readonly args: { tokenId: string };
  readonly recoveryHint =
    "This pledge NFT is not claimable as a refund. The campaign may have succeeded or the refund window has not opened.";

  constructor(args: { tokenId: string }) {
    super(`AllOrNothingNotClaimable(tokenId: ${args.tokenId})`);
    this.args = args;
    Object.setPrototypeOf(this, AllOrNothingNotClaimableError.prototype);
  }
}

export class AllOrNothingNotSuccessfulError extends Error implements ContractErrorBase {
  readonly name = "AllOrNothingNotSuccessful";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The campaign has not reached its goal. This operation requires a successful campaign.";

  constructor() {
    super("AllOrNothingNotSuccessful()");
    Object.setPrototypeOf(this, AllOrNothingNotSuccessfulError.prototype);
  }
}

export class AllOrNothingRewardExistsError extends Error implements ContractErrorBase {
  readonly name = "AllOrNothingRewardExists";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "A reward with this name already exists. Use a different reward name or remove the existing one first.";

  constructor() {
    super("AllOrNothingRewardExists()");
    Object.setPrototypeOf(this, AllOrNothingRewardExistsError.prototype);
  }
}

export class AllOrNothingTransferFailedError extends Error implements ContractErrorBase {
  readonly name = "AllOrNothingTransferFailed";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Token transfer failed. Check token balances and allowances.";

  constructor() {
    super("AllOrNothingTransferFailed()");
    Object.setPrototypeOf(this, AllOrNothingTransferFailedError.prototype);
  }
}

export class AllOrNothingUnAuthorizedError extends Error implements ContractErrorBase {
  readonly name = "AllOrNothingUnAuthorized";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Caller is not authorized for this operation on the AllOrNothing treasury.";

  constructor() {
    super("AllOrNothingUnAuthorized()");
    Object.setPrototypeOf(this, AllOrNothingUnAuthorizedError.prototype);
  }
}

export class AllOrNothingTokenNotAcceptedError extends Error implements ContractErrorBase {
  readonly name = "AllOrNothingTokenNotAccepted";
  readonly args: { token: string };
  readonly recoveryHint = "This token is not accepted for pledging. Use an accepted token for this campaign.";

  constructor(args: { token: string }) {
    super(`AllOrNothingTokenNotAccepted(token: ${args.token})`);
    this.args = args;
    Object.setPrototypeOf(this, AllOrNothingTokenNotAcceptedError.prototype);
  }
}

export class TreasurySuccessConditionNotFulfilledError extends Error implements ContractErrorBase {
  readonly name = "TreasurySuccessConditionNotFulfilled";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "The campaign success condition has not been fulfilled. The goal amount must be reached before withdrawing.";

  constructor() {
    super("TreasurySuccessConditionNotFulfilled()");
    Object.setPrototypeOf(this, TreasurySuccessConditionNotFulfilledError.prototype);
  }
}

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
