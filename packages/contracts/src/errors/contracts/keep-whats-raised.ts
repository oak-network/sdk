import type { ContractErrorBase } from "../base";

/** KeepWhatsRaised error name strings. */
export const KeepWhatsRaisedErrorNames = {
  UnAuthorized: "KeepWhatsRaisedUnAuthorized",
  InvalidInput: "KeepWhatsRaisedInvalidInput",
  TokenNotAccepted: "KeepWhatsRaisedTokenNotAccepted",
  RewardExists: "KeepWhatsRaisedRewardExists",
  Disabled: "KeepWhatsRaisedDisabled",
  AlreadyEnabled: "KeepWhatsRaisedAlreadyEnabled",
  InsufficientFundsForWithdrawalAndFee: "KeepWhatsRaisedInsufficientFundsForWithdrawalAndFee",
  InsufficientFundsForFee: "KeepWhatsRaisedInsufficientFundsForFee",
  AlreadyWithdrawn: "KeepWhatsRaisedAlreadyWithdrawn",
  AlreadyClaimed: "KeepWhatsRaisedAlreadyClaimed",
  NotClaimable: "KeepWhatsRaisedNotClaimable",
  NotClaimableAdmin: "KeepWhatsRaisedNotClaimableAdmin",
  ConfigLocked: "KeepWhatsRaisedConfigLocked",
  DisbursementBlocked: "KeepWhatsRaisedDisbursementBlocked",
  PledgeAlreadyProcessed: "KeepWhatsRaisedPledgeAlreadyProcessed",
} as const;

/** Thrown when the caller is not authorised for the attempted KeepWhatsRaised operation. */
export class KeepWhatsRaisedUnAuthorizedError extends Error implements ContractErrorBase {
  readonly name = KeepWhatsRaisedErrorNames.UnAuthorized;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Caller is not authorized for this operation on the KeepWhatsRaised treasury.";

  constructor() {
    super("KeepWhatsRaisedUnAuthorized()");
    Object.setPrototypeOf(this, KeepWhatsRaisedUnAuthorizedError.prototype);
  }
}

/** Thrown when one or more inputs to a KeepWhatsRaised write are invalid. */
export class KeepWhatsRaisedInvalidInputError extends Error implements ContractErrorBase {
  readonly name = KeepWhatsRaisedErrorNames.InvalidInput;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "One or more inputs are invalid. Check all provided parameters.";

  constructor() {
    super("KeepWhatsRaisedInvalidInput()");
    Object.setPrototypeOf(this, KeepWhatsRaisedInvalidInputError.prototype);
  }
}

/** Thrown when a pledge token is not accepted for this campaign's currency. */
export class KeepWhatsRaisedTokenNotAcceptedError extends Error implements ContractErrorBase {
  readonly name = KeepWhatsRaisedErrorNames.TokenNotAccepted;
  readonly args: { token: string };
  readonly recoveryHint = "This token is not accepted for pledging. Use an accepted token for this campaign.";

  constructor(args: { token: string }) {
    super(`KeepWhatsRaisedTokenNotAccepted(token: ${args.token})`);
    this.args = args;
    Object.setPrototypeOf(this, KeepWhatsRaisedTokenNotAcceptedError.prototype);
  }
}

/** Thrown when addRewards is called with a reward name that is already registered. */
export class KeepWhatsRaisedRewardExistsError extends Error implements ContractErrorBase {
  readonly name = KeepWhatsRaisedErrorNames.RewardExists;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "A reward with this name already exists. Use a different reward name or remove the existing one first.";

  constructor() {
    super("KeepWhatsRaisedRewardExists()");
    Object.setPrototypeOf(this, KeepWhatsRaisedRewardExistsError.prototype);
  }
}

/** Thrown when an operation is attempted on a treasury that has been disabled. */
export class KeepWhatsRaisedDisabledError extends Error implements ContractErrorBase {
  readonly name = KeepWhatsRaisedErrorNames.Disabled;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The KeepWhatsRaised treasury is disabled. Enable it before performing this operation.";

  constructor() {
    super("KeepWhatsRaisedDisabled()");
    Object.setPrototypeOf(this, KeepWhatsRaisedDisabledError.prototype);
  }
}

/** Thrown when an enable operation is attempted on a treasury that is already enabled. */
export class KeepWhatsRaisedAlreadyEnabledError extends Error implements ContractErrorBase {
  readonly name = KeepWhatsRaisedErrorNames.AlreadyEnabled;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The KeepWhatsRaised treasury is already enabled.";

  constructor() {
    super("KeepWhatsRaisedAlreadyEnabled()");
    Object.setPrototypeOf(this, KeepWhatsRaisedAlreadyEnabledError.prototype);
  }
}

/** Thrown when the treasury balance is insufficient to cover both the withdrawal amount and the fee. */
export class KeepWhatsRaisedInsufficientFundsForWithdrawalAndFeeError
  extends Error
  implements ContractErrorBase
{
  readonly name = KeepWhatsRaisedErrorNames.InsufficientFundsForWithdrawalAndFee;
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

/** Thrown when the treasury balance is insufficient to cover the withdrawal fee alone. */
export class KeepWhatsRaisedInsufficientFundsForFeeError extends Error implements ContractErrorBase {
  readonly name = KeepWhatsRaisedErrorNames.InsufficientFundsForFee;
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

/** Thrown when a withdrawal is attempted after funds have already been withdrawn. */
export class KeepWhatsRaisedAlreadyWithdrawnError extends Error implements ContractErrorBase {
  readonly name = KeepWhatsRaisedErrorNames.AlreadyWithdrawn;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Funds have already been withdrawn from this treasury.";

  constructor() {
    super("KeepWhatsRaisedAlreadyWithdrawn()");
    Object.setPrototypeOf(this, KeepWhatsRaisedAlreadyWithdrawnError.prototype);
  }
}

/** Thrown when claimRefund is called for a pledge that has already been claimed or refunded. */
export class KeepWhatsRaisedAlreadyClaimedError extends Error implements ContractErrorBase {
  readonly name = KeepWhatsRaisedErrorNames.AlreadyClaimed;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "This pledge has already been claimed or refunded.";

  constructor() {
    super("KeepWhatsRaisedAlreadyClaimed()");
    Object.setPrototypeOf(this, KeepWhatsRaisedAlreadyClaimedError.prototype);
  }
}

/** Thrown when claimRefund is called for a pledge NFT that does not meet refund conditions. */
export class KeepWhatsRaisedNotClaimableError extends Error implements ContractErrorBase {
  readonly name = KeepWhatsRaisedErrorNames.NotClaimable;
  readonly args: { tokenId: string };
  readonly recoveryHint =
    "This pledge NFT is not claimable for a refund. The campaign may still be active or refund conditions are not met.";

  constructor(args: { tokenId: string }) {
    super(`KeepWhatsRaisedNotClaimable(tokenId: ${args.tokenId})`);
    this.args = args;
    Object.setPrototypeOf(this, KeepWhatsRaisedNotClaimableError.prototype);
  }
}

/** Thrown when an admin claim is attempted but the required campaign state conditions are not met. */
export class KeepWhatsRaisedNotClaimableAdminError extends Error implements ContractErrorBase {
  readonly name = KeepWhatsRaisedErrorNames.NotClaimableAdmin;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "The admin claim conditions are not met. Ensure the campaign is in the correct state before claiming.";

  constructor() {
    super("KeepWhatsRaisedNotClaimableAdmin()");
    Object.setPrototypeOf(this, KeepWhatsRaisedNotClaimableAdminError.prototype);
  }
}

/** Thrown when a configuration change is attempted during the config lock period. */
export class KeepWhatsRaisedConfigLockedError extends Error implements ContractErrorBase {
  readonly name = KeepWhatsRaisedErrorNames.ConfigLocked;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "The treasury configuration is locked and cannot be modified. Wait for the lock period to expire.";

  constructor() {
    super("KeepWhatsRaisedConfigLocked()");
    Object.setPrototypeOf(this, KeepWhatsRaisedConfigLockedError.prototype);
  }
}

/** Thrown when fee disbursement is blocked due to unmet conditions. */
export class KeepWhatsRaisedDisbursementBlockedError extends Error implements ContractErrorBase {
  readonly name = KeepWhatsRaisedErrorNames.DisbursementBlocked;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "Fee disbursement is blocked. Ensure all required conditions are met before disbursing fees.";

  constructor() {
    super("KeepWhatsRaisedDisbursementBlocked()");
    Object.setPrototypeOf(this, KeepWhatsRaisedDisbursementBlockedError.prototype);
  }
}

/** Thrown when a pledge ID has already been used; each pledge ID can only be processed once. */
export class KeepWhatsRaisedPledgeAlreadyProcessedError extends Error implements ContractErrorBase {
  readonly name = KeepWhatsRaisedErrorNames.PledgeAlreadyProcessed;
  readonly args: { pledgeId: string };
  readonly recoveryHint = "This pledge ID has already been processed. Each pledge ID can only be used once.";

  constructor(args: { pledgeId: string }) {
    super(`KeepWhatsRaisedPledgeAlreadyProcessed(pledgeId: ${args.pledgeId})`);
    this.args = args;
    Object.setPrototypeOf(this, KeepWhatsRaisedPledgeAlreadyProcessedError.prototype);
  }
}

/** Union of all typed errors that can be thrown by KeepWhatsRaised treasury contract calls. */
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
