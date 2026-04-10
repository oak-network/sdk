import type { ContractErrorBase } from "../base";

/** Shared (cross-contract) error name strings. Use in classes and parse layer. */
export const SharedErrorNames = {
  AccessCheckerUnauthorized: "AccessCheckerUnauthorized",
  AdminAccessCheckerUnauthorized: "AdminAccessCheckerUnauthorized",
  CannotCancel: "CannotCancel",
  CancelledError: "CancelledError",
  CurrentTimeIsGreater: "CurrentTimeIsGreater",
  CurrentTimeIsLess: "CurrentTimeIsLess",
  CurrentTimeIsNotWithinRange: "CurrentTimeIsNotWithinRange",
  NotCancelledError: "NotCancelledError",
  NotPausedError: "NotPausedError",
  PausedError: "PausedError",
  PledgeNFTInvalidJsonString: "PledgeNFTInvalidJsonString",
  PledgeNFTUnAuthorized: "PledgeNFTUnAuthorized",
  TreasuryCampaignInfoIsPaused: "TreasuryCampaignInfoIsPaused",
  TreasuryFeeNotDisbursed: "TreasuryFeeNotDisbursed",
  TreasuryTransferFailed: "TreasuryTransferFailed",
} as const;

/** Thrown when the caller fails the generic access control check. */
export class AccessCheckerUnauthorizedError extends Error implements ContractErrorBase {
  readonly name = SharedErrorNames.AccessCheckerUnauthorized;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Caller is not authorized. Check access control permissions.";

  constructor() {
    super(`${SharedErrorNames.AccessCheckerUnauthorized}()`);
    Object.setPrototypeOf(this, AccessCheckerUnauthorizedError.prototype);
  }
}

/** Thrown when the caller is not the admin for the accessed resource. */
export class AdminAccessCheckerUnauthorizedError extends Error implements ContractErrorBase {
  readonly name = SharedErrorNames.AdminAccessCheckerUnauthorized;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Caller is not an admin. Only admins can perform this operation.";

  constructor() {
    super(`${SharedErrorNames.AdminAccessCheckerUnauthorized}()`);
    Object.setPrototypeOf(this, AdminAccessCheckerUnauthorizedError.prototype);
  }
}

/** Thrown when the provided timestamp is in the past relative to the current block time. */
export class CurrentTimeIsGreaterError extends Error implements ContractErrorBase {
  readonly name = SharedErrorNames.CurrentTimeIsGreater;
  readonly args: { inputTime: string; currentTime: string };
  readonly recoveryHint = "The input time is in the past. Provide a future timestamp.";

  constructor(args: { inputTime: string; currentTime: string }) {
    super(`${SharedErrorNames.CurrentTimeIsGreater}(inputTime: ${args.inputTime}, currentTime: ${args.currentTime})`);
    this.args = args;
    Object.setPrototypeOf(this, CurrentTimeIsGreaterError.prototype);
  }
}

/** Thrown when the current block time has not yet reached the required timestamp. */
export class CurrentTimeIsLessError extends Error implements ContractErrorBase {
  readonly name = SharedErrorNames.CurrentTimeIsLess;
  readonly args: { inputTime: string; currentTime: string };
  readonly recoveryHint = "The operation is not yet available. Wait until the specified time has passed.";

  constructor(args: { inputTime: string; currentTime: string }) {
    super(`${SharedErrorNames.CurrentTimeIsLess}(inputTime: ${args.inputTime}, currentTime: ${args.currentTime})`);
    this.args = args;
    Object.setPrototypeOf(this, CurrentTimeIsLessError.prototype);
  }
}

/** Thrown when the current block time falls outside the allowed [initialTime, finalTime] window. */
export class CurrentTimeIsNotWithinRangeError extends Error implements ContractErrorBase {
  readonly name = SharedErrorNames.CurrentTimeIsNotWithinRange;
  readonly args: { initialTime: string; finalTime: string };
  readonly recoveryHint =
    "Current time is outside the allowed range. The operation is only valid between the initial and final times.";

  constructor(args: { initialTime: string; finalTime: string }) {
    super(
      `${SharedErrorNames.CurrentTimeIsNotWithinRange}(initialTime: ${args.initialTime}, finalTime: ${args.finalTime})`,
    );
    this.args = args;
    Object.setPrototypeOf(this, CurrentTimeIsNotWithinRangeError.prototype);
  }
}

/** Thrown when a treasury operation is attempted while the linked CampaignInfo is paused. */
export class TreasuryCampaignInfoIsPausedError extends Error implements ContractErrorBase {
  readonly name = SharedErrorNames.TreasuryCampaignInfoIsPaused;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The campaign is paused. Unpause the campaign before performing this operation.";

  constructor() {
    super(`${SharedErrorNames.TreasuryCampaignInfoIsPaused}()`);
    Object.setPrototypeOf(this, TreasuryCampaignInfoIsPausedError.prototype);
  }
}

/** Thrown when a treasury withdrawal is attempted before fees have been disbursed. */
export class TreasuryFeeNotDisbursedError extends Error implements ContractErrorBase {
  readonly name = SharedErrorNames.TreasuryFeeNotDisbursed;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Fees have not been disbursed yet. Call disburseFees() before this operation.";

  constructor() {
    super(`${SharedErrorNames.TreasuryFeeNotDisbursed}()`);
    Object.setPrototypeOf(this, TreasuryFeeNotDisbursedError.prototype);
  }
}

/** Thrown when an ERC-20 token transfer from the treasury fails. */
export class TreasuryTransferFailedError extends Error implements ContractErrorBase {
  readonly name = SharedErrorNames.TreasuryTransferFailed;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Token transfer failed. Check token balances and allowances.";

  constructor() {
    super(`${SharedErrorNames.TreasuryTransferFailed}()`);
    Object.setPrototypeOf(this, TreasuryTransferFailedError.prototype);
  }
}

/** Thrown when an operation is attempted while the contract is paused. */
export class PausedErrorError extends Error implements ContractErrorBase {
  readonly name = SharedErrorNames.PausedError;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The contract is currently paused. Wait for it to be unpaused.";

  constructor() {
    super(`${SharedErrorNames.PausedError}()`);
    Object.setPrototypeOf(this, PausedErrorError.prototype);
  }
}

/** Thrown when an operation requires the contract to be paused but it is not. */
export class NotPausedErrorError extends Error implements ContractErrorBase {
  readonly name = SharedErrorNames.NotPausedError;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The contract is not paused. This operation can only be performed when paused.";

  constructor() {
    super(`${SharedErrorNames.NotPausedError}()`);
    Object.setPrototypeOf(this, NotPausedErrorError.prototype);
  }
}

/** Thrown when an operation is attempted after the contract has been cancelled. */
export class CancelledErrorError extends Error implements ContractErrorBase {
  readonly name = SharedErrorNames.CancelledError;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The contract has been cancelled. This operation is no longer available.";

  constructor() {
    super(`${SharedErrorNames.CancelledError}()`);
    Object.setPrototypeOf(this, CancelledErrorError.prototype);
  }
}

/** Thrown when an operation requires the contract to be cancelled but it is not. */
export class NotCancelledErrorError extends Error implements ContractErrorBase {
  readonly name = SharedErrorNames.NotCancelledError;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The contract has not been cancelled. This operation requires cancellation first.";

  constructor() {
    super(`${SharedErrorNames.NotCancelledError}()`);
    Object.setPrototypeOf(this, NotCancelledErrorError.prototype);
  }
}

/** Thrown when attempting to cancel a contract that is already cancelled. */
export class CannotCancelError extends Error implements ContractErrorBase {
  readonly name = SharedErrorNames.CannotCancel;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The contract is already cancelled and cannot be cancelled again.";

  constructor() {
    super(`${SharedErrorNames.CannotCancel}()`);
    Object.setPrototypeOf(this, CannotCancelError.prototype);
  }
}

/** Thrown when an unauthorized PledgeNFT operation is attempted. */
export class PledgeNFTUnAuthorizedError extends Error implements ContractErrorBase {
  readonly name = SharedErrorNames.PledgeNFTUnAuthorized;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Caller is not authorized for this PledgeNFT operation.";

  constructor() {
    super(`${SharedErrorNames.PledgeNFTUnAuthorized}()`);
    Object.setPrototypeOf(this, PledgeNFTUnAuthorizedError.prototype);
  }
}

/** Thrown when a string contains invalid characters for on-chain JSON embedding. */
export class PledgeNFTInvalidJsonStringError extends Error implements ContractErrorBase {
  readonly name = SharedErrorNames.PledgeNFTInvalidJsonString;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The string contains invalid characters (quotes, backslashes, control characters, or non-ASCII). Use only printable ASCII.";

  constructor() {
    super(`${SharedErrorNames.PledgeNFTInvalidJsonString}()`);
    Object.setPrototypeOf(this, PledgeNFTInvalidJsonStringError.prototype);
  }
}

/** Union of all typed errors shared across multiple contract types. */
export type SharedError =
  | AccessCheckerUnauthorizedError
  | AdminAccessCheckerUnauthorizedError
  | CannotCancelError
  | CancelledErrorError
  | CurrentTimeIsGreaterError
  | CurrentTimeIsLessError
  | CurrentTimeIsNotWithinRangeError
  | NotCancelledErrorError
  | NotPausedErrorError
  | PausedErrorError
  | PledgeNFTInvalidJsonStringError
  | PledgeNFTUnAuthorizedError
  | TreasuryCampaignInfoIsPausedError
  | TreasuryFeeNotDisbursedError
  | TreasuryTransferFailedError;
