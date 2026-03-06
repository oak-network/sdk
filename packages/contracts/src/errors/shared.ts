import type { ContractErrorBase } from "./contract-error.js";

export class AccessCheckerUnauthorizedError extends Error implements ContractErrorBase {
  readonly name = "AccessCheckerUnauthorized";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Caller is not authorized. Check access control permissions.";

  constructor() {
    super("AccessCheckerUnauthorized()");
    Object.setPrototypeOf(this, AccessCheckerUnauthorizedError.prototype);
  }
}

export class AdminAccessCheckerUnauthorizedError extends Error implements ContractErrorBase {
  readonly name = "AdminAccessCheckerUnauthorized";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Caller is not an admin. Only admins can perform this operation.";

  constructor() {
    super("AdminAccessCheckerUnauthorized()");
    Object.setPrototypeOf(this, AdminAccessCheckerUnauthorizedError.prototype);
  }
}

export class CurrentTimeIsGreaterError extends Error implements ContractErrorBase {
  readonly name = "CurrentTimeIsGreater";
  readonly args: { inputTime: string; currentTime: string };
  readonly recoveryHint = "The input time is in the past. Provide a future timestamp.";

  constructor(args: { inputTime: string; currentTime: string }) {
    super(`CurrentTimeIsGreater(inputTime: ${args.inputTime}, currentTime: ${args.currentTime})`);
    this.args = args;
    Object.setPrototypeOf(this, CurrentTimeIsGreaterError.prototype);
  }
}

export class CurrentTimeIsLessError extends Error implements ContractErrorBase {
  readonly name = "CurrentTimeIsLess";
  readonly args: { inputTime: string; currentTime: string };
  readonly recoveryHint = "The operation is not yet available. Wait until the specified time has passed.";

  constructor(args: { inputTime: string; currentTime: string }) {
    super(`CurrentTimeIsLess(inputTime: ${args.inputTime}, currentTime: ${args.currentTime})`);
    this.args = args;
    Object.setPrototypeOf(this, CurrentTimeIsLessError.prototype);
  }
}

export class CurrentTimeIsNotWithinRangeError extends Error implements ContractErrorBase {
  readonly name = "CurrentTimeIsNotWithinRange";
  readonly args: { initialTime: string; finalTime: string };
  readonly recoveryHint =
    "Current time is outside the allowed range. The operation is only valid between the initial and final times.";

  constructor(args: { initialTime: string; finalTime: string }) {
    super(
      `CurrentTimeIsNotWithinRange(initialTime: ${args.initialTime}, finalTime: ${args.finalTime})`,
    );
    this.args = args;
    Object.setPrototypeOf(this, CurrentTimeIsNotWithinRangeError.prototype);
  }
}

export class TreasuryCampaignInfoIsPausedError extends Error implements ContractErrorBase {
  readonly name = "TreasuryCampaignInfoIsPaused";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The campaign is paused. Unpause the campaign before performing this operation.";

  constructor() {
    super("TreasuryCampaignInfoIsPaused()");
    Object.setPrototypeOf(this, TreasuryCampaignInfoIsPausedError.prototype);
  }
}

export class TreasuryFeeNotDisbursedError extends Error implements ContractErrorBase {
  readonly name = "TreasuryFeeNotDisbursed";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Fees have not been disbursed yet. Call disburseFees() before this operation.";

  constructor() {
    super("TreasuryFeeNotDisbursed()");
    Object.setPrototypeOf(this, TreasuryFeeNotDisbursedError.prototype);
  }
}

export class TreasuryTransferFailedError extends Error implements ContractErrorBase {
  readonly name = "TreasuryTransferFailed";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Token transfer failed. Check token balances and allowances.";

  constructor() {
    super("TreasuryTransferFailed()");
    Object.setPrototypeOf(this, TreasuryTransferFailedError.prototype);
  }
}

export type SharedError =
  | AccessCheckerUnauthorizedError
  | AdminAccessCheckerUnauthorizedError
  | CurrentTimeIsGreaterError
  | CurrentTimeIsLessError
  | CurrentTimeIsNotWithinRangeError
  | TreasuryCampaignInfoIsPausedError
  | TreasuryFeeNotDisbursedError
  | TreasuryTransferFailedError;
