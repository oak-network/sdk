import type { ContractErrorBase } from "../base";

/** CampaignInfo error name strings. */
export const CampaignInfoErrorNames = {
  InvalidInput: "CampaignInfoInvalidInput",
  InvalidPlatformUpdate: "CampaignInfoInvalidPlatformUpdate",
  PlatformNotSelected: "CampaignInfoPlatformNotSelected",
  PlatformAlreadyApproved: "CampaignInfoPlatformAlreadyApproved",
  Unauthorized: "CampaignInfoUnauthorized",
  IsLocked: "CampaignInfoIsLocked",
} as const;

/** Thrown when one or more campaign info inputs are invalid. */
export class CampaignInfoInvalidInputError extends Error implements ContractErrorBase {
  readonly name = CampaignInfoErrorNames.InvalidInput;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "One or more campaign info inputs are invalid. Check all provided parameters.";

  constructor() {
    super("CampaignInfoInvalidInput()");
    Object.setPrototypeOf(this, CampaignInfoInvalidInputError.prototype);
  }
}

/** Thrown when a platform selection update is invalid (e.g. already in the requested state). */
export class CampaignInfoInvalidPlatformUpdateError extends Error implements ContractErrorBase {
  readonly name = CampaignInfoErrorNames.InvalidPlatformUpdate;
  readonly args: { platformBytes: string; selection: boolean };
  readonly recoveryHint =
    "Invalid platform selection update. The platform may already be in the requested state.";

  constructor(args: { platformBytes: string; selection: boolean }) {
    super(
      `CampaignInfoInvalidPlatformUpdate(platformBytes: ${args.platformBytes}, selection: ${args.selection})`,
    );
    this.args = args;
    Object.setPrototypeOf(this, CampaignInfoInvalidPlatformUpdateError.prototype);
  }
}

/** Thrown when an operation targets a platform that was not selected for the campaign. */
export class CampaignInfoPlatformNotSelectedError extends Error implements ContractErrorBase {
  readonly name = CampaignInfoErrorNames.PlatformNotSelected;
  readonly args: { platformBytes: string };
  readonly recoveryHint = "The platform is not selected for this campaign. Select the platform first.";

  constructor(args: { platformBytes: string }) {
    super(`CampaignInfoPlatformNotSelected(platformBytes: ${args.platformBytes})`);
    this.args = args;
    Object.setPrototypeOf(this, CampaignInfoPlatformNotSelectedError.prototype);
  }
}

/** Thrown when approving a platform that is already approved for the campaign. */
export class CampaignInfoPlatformAlreadyApprovedError extends Error implements ContractErrorBase {
  readonly name = CampaignInfoErrorNames.PlatformAlreadyApproved;
  readonly args: { platformHash: string };
  readonly recoveryHint = "The platform is already approved for this campaign. No action required.";

  constructor(args: { platformHash: string }) {
    super(`CampaignInfoPlatformAlreadyApproved(platformHash: ${args.platformHash})`);
    this.args = args;
    Object.setPrototypeOf(this, CampaignInfoPlatformAlreadyApprovedError.prototype);
  }
}

/** Thrown when the caller is not authorised to modify this campaign. */
export class CampaignInfoUnauthorizedError extends Error implements ContractErrorBase {
  readonly name = CampaignInfoErrorNames.Unauthorized;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Caller is not authorized for this campaign operation.";

  constructor() {
    super("CampaignInfoUnauthorized()");
    Object.setPrototypeOf(this, CampaignInfoUnauthorizedError.prototype);
  }
}

/** Thrown when a modification is attempted on a locked CampaignInfo. */
export class CampaignInfoIsLockedError extends Error implements ContractErrorBase {
  readonly name = CampaignInfoErrorNames.IsLocked;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The campaign info is locked and cannot be modified.";

  constructor() {
    super("CampaignInfoIsLocked()");
    Object.setPrototypeOf(this, CampaignInfoIsLockedError.prototype);
  }
}

/** Union of all typed errors that can be thrown by CampaignInfo contract calls. */
export type CampaignInfoError =
  | CampaignInfoInvalidInputError
  | CampaignInfoInvalidPlatformUpdateError
  | CampaignInfoPlatformNotSelectedError
  | CampaignInfoPlatformAlreadyApprovedError
  | CampaignInfoUnauthorizedError
  | CampaignInfoIsLockedError;
