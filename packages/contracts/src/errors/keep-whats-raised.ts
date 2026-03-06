import type { ContractErrorBase } from "./contract-error.js";

export class KeepWhatsRaisedUnAuthorizedError extends Error implements ContractErrorBase {
  readonly name = "KeepWhatsRaisedUnAuthorized";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Caller is not authorized for this operation on the KeepWhatsRaised treasury.";

  constructor() {
    super("KeepWhatsRaisedUnAuthorized()");
    Object.setPrototypeOf(this, KeepWhatsRaisedUnAuthorizedError.prototype);
  }
}

export class KeepWhatsRaisedInvalidInputError extends Error implements ContractErrorBase {
  readonly name = "KeepWhatsRaisedInvalidInput";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "One or more inputs are invalid. Check all provided parameters.";

  constructor() {
    super("KeepWhatsRaisedInvalidInput()");
    Object.setPrototypeOf(this, KeepWhatsRaisedInvalidInputError.prototype);
  }
}

export class KeepWhatsRaisedTokenNotAcceptedError extends Error implements ContractErrorBase {
  readonly name = "KeepWhatsRaisedTokenNotAccepted";
  readonly args: { token: string };
  readonly recoveryHint = "This token is not accepted for pledging. Use an accepted token for this campaign.";

  constructor(args: { token: string }) {
    super(`KeepWhatsRaisedTokenNotAccepted(token: ${args.token})`);
    this.args = args;
    Object.setPrototypeOf(this, KeepWhatsRaisedTokenNotAcceptedError.prototype);
  }
}

export class KeepWhatsRaisedRewardExistsError extends Error implements ContractErrorBase {
  readonly name = "KeepWhatsRaisedRewardExists";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "A reward with this name already exists. Use a different reward name or remove the existing one first.";

  constructor() {
    super("KeepWhatsRaisedRewardExists()");
    Object.setPrototypeOf(this, KeepWhatsRaisedRewardExistsError.prototype);
  }
}

export class KeepWhatsRaisedDisabledError extends Error implements ContractErrorBase {
  readonly name = "KeepWhatsRaisedDisabled";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The KeepWhatsRaised treasury is disabled. Enable it before performing this operation.";

  constructor() {
    super("KeepWhatsRaisedDisabled()");
    Object.setPrototypeOf(this, KeepWhatsRaisedDisabledError.prototype);
  }
}

export class KeepWhatsRaisedAlreadyEnabledError extends Error implements ContractErrorBase {
  readonly name = "KeepWhatsRaisedAlreadyEnabled";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The KeepWhatsRaised treasury is already enabled.";

  constructor() {
    super("KeepWhatsRaisedAlreadyEnabled()");
    Object.setPrototypeOf(this, KeepWhatsRaisedAlreadyEnabledError.prototype);
  }
}

export class KeepWhatsRaisedInsufficientFundsForWithdrawalAndFeeError
  extends Error
  implements ContractErrorBase
{
  readonly name = "KeepWhatsRaisedInsufficientFundsForWithdrawalAndFee";
  readonly args: { availableAmount: string; withdrawalAmount: string; fee: string };
  readonly recoveryHint =
    "Insufficient funds to cover both the withdrawal amount and fee. Reduce the withdrawal amount or wait for more pledges.";

  constructor(args: { availableAmount: string; withdrawalAmount: string; fee: string }) {
    super(
      `KeepWhatsRaisedInsufficientFundsForWithdrawalAndFee(availableAmount: ${args.availableAmount}, withdrawalAmount: ${args.withdrawalAmount}, fee: ${args.fee})`,
    );
    this.args = args;
    Object.setPrototypeOf(
      this,
      KeepWhatsRaisedInsufficientFundsForWithdrawalAndFeeError.prototype,
    );
  }
}

export class KeepWhatsRaisedInsufficientFundsForFeeError extends Error implements ContractErrorBase {
  readonly name = "KeepWhatsRaisedInsufficientFundsForFee";
  readonly args: { withdrawalAmount: string; fee: string };
  readonly recoveryHint =
    "Insufficient funds to cover the withdrawal fee. Ensure the treasury has enough balance to pay the fee.";

  constructor(args: { withdrawalAmount: string; fee: string }) {
    super(
      `KeepWhatsRaisedInsufficientFundsForFee(withdrawalAmount: ${args.withdrawalAmount}, fee: ${args.fee})`,
    );
    this.args = args;
    Object.setPrototypeOf(this, KeepWhatsRaisedInsufficientFundsForFeeError.prototype);
  }
}

export class KeepWhatsRaisedAlreadyWithdrawnError extends Error implements ContractErrorBase {
  readonly name = "KeepWhatsRaisedAlreadyWithdrawn";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Funds have already been withdrawn from this treasury.";

  constructor() {
    super("KeepWhatsRaisedAlreadyWithdrawn()");
    Object.setPrototypeOf(this, KeepWhatsRaisedAlreadyWithdrawnError.prototype);
  }
}

export class KeepWhatsRaisedAlreadyClaimedError extends Error implements ContractErrorBase {
  readonly name = "KeepWhatsRaisedAlreadyClaimed";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "This pledge has already been claimed or refunded.";

  constructor() {
    super("KeepWhatsRaisedAlreadyClaimed()");
    Object.setPrototypeOf(this, KeepWhatsRaisedAlreadyClaimedError.prototype);
  }
}

export class KeepWhatsRaisedNotClaimableError extends Error implements ContractErrorBase {
  readonly name = "KeepWhatsRaisedNotClaimable";
  readonly args: { tokenId: string };
  readonly recoveryHint =
    "This pledge NFT is not claimable for a refund. The campaign may still be active or refund conditions are not met.";

  constructor(args: { tokenId: string }) {
    super(`KeepWhatsRaisedNotClaimable(tokenId: ${args.tokenId})`);
    this.args = args;
    Object.setPrototypeOf(this, KeepWhatsRaisedNotClaimableError.prototype);
  }
}

export class KeepWhatsRaisedNotClaimableAdminError extends Error implements ContractErrorBase {
  readonly name = "KeepWhatsRaisedNotClaimableAdmin";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "The admin claim conditions are not met. Ensure the campaign is in the correct state before claiming.";

  constructor() {
    super("KeepWhatsRaisedNotClaimableAdmin()");
    Object.setPrototypeOf(this, KeepWhatsRaisedNotClaimableAdminError.prototype);
  }
}

export class KeepWhatsRaisedConfigLockedError extends Error implements ContractErrorBase {
  readonly name = "KeepWhatsRaisedConfigLocked";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "The treasury configuration is locked and cannot be modified. Wait for the lock period to expire.";

  constructor() {
    super("KeepWhatsRaisedConfigLocked()");
    Object.setPrototypeOf(this, KeepWhatsRaisedConfigLockedError.prototype);
  }
}

export class KeepWhatsRaisedDisbursementBlockedError extends Error implements ContractErrorBase {
  readonly name = "KeepWhatsRaisedDisbursementBlocked";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "Fee disbursement is blocked. Ensure all required conditions are met before disbursing fees.";

  constructor() {
    super("KeepWhatsRaisedDisbursementBlocked()");
    Object.setPrototypeOf(this, KeepWhatsRaisedDisbursementBlockedError.prototype);
  }
}

export class KeepWhatsRaisedPledgeAlreadyProcessedError extends Error implements ContractErrorBase {
  readonly name = "KeepWhatsRaisedPledgeAlreadyProcessed";
  readonly args: { pledgeId: string };
  readonly recoveryHint = "This pledge ID has already been processed. Each pledge ID can only be used once.";

  constructor(args: { pledgeId: string }) {
    super(`KeepWhatsRaisedPledgeAlreadyProcessed(pledgeId: ${args.pledgeId})`);
    this.args = args;
    Object.setPrototypeOf(this, KeepWhatsRaisedPledgeAlreadyProcessedError.prototype);
  }
}

export type KeepWhatsRaisedError =
  | KeepWhatsRaisedUnAuthorizedError
  | KeepWhatsRaisedInvalidInputError
  | KeepWhatsRaisedTokenNotAcceptedError
  | KeepWhatsRaisedRewardExistsError
  | KeepWhatsRaisedDisabledError
  | KeepWhatsRaisedAlreadyEnabledError
  | KeepWhatsRaisedInsufficientFundsForWithdrawalAndFeeError
  | KeepWhatsRaisedInsufficientFundsForFeeError
  | KeepWhatsRaisedAlreadyWithdrawnError
  | KeepWhatsRaisedAlreadyClaimedError
  | KeepWhatsRaisedNotClaimableError
  | KeepWhatsRaisedNotClaimableAdminError
  | KeepWhatsRaisedConfigLockedError
  | KeepWhatsRaisedDisbursementBlockedError
  | KeepWhatsRaisedPledgeAlreadyProcessedError;
