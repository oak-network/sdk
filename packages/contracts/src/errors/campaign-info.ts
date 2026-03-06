import type { ContractErrorBase } from "./contract-error.js";

export class CampaignInfoInvalidInputError extends Error implements ContractErrorBase {
  readonly name = "CampaignInfoInvalidInput";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "One or more campaign info inputs are invalid. Check all provided parameters.";

  constructor() {
    super("CampaignInfoInvalidInput()");
    Object.setPrototypeOf(this, CampaignInfoInvalidInputError.prototype);
  }
}

export class CampaignInfoInvalidPlatformUpdateError extends Error implements ContractErrorBase {
  readonly name = "CampaignInfoInvalidPlatformUpdate";
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

export class CampaignInfoPlatformNotSelectedError extends Error implements ContractErrorBase {
  readonly name = "CampaignInfoPlatformNotSelected";
  readonly args: { platformBytes: string };
  readonly recoveryHint = "The platform is not selected for this campaign. Select the platform first.";

  constructor(args: { platformBytes: string }) {
    super(`CampaignInfoPlatformNotSelected(platformBytes: ${args.platformBytes})`);
    this.args = args;
    Object.setPrototypeOf(this, CampaignInfoPlatformNotSelectedError.prototype);
  }
}

export class CampaignInfoPlatformAlreadyApprovedError extends Error implements ContractErrorBase {
  readonly name = "CampaignInfoPlatformAlreadyApproved";
  readonly args: { platformHash: string };
  readonly recoveryHint = "The platform is already approved for this campaign. No action required.";

  constructor(args: { platformHash: string }) {
    super(`CampaignInfoPlatformAlreadyApproved(platformHash: ${args.platformHash})`);
    this.args = args;
    Object.setPrototypeOf(this, CampaignInfoPlatformAlreadyApprovedError.prototype);
  }
}

export class CampaignInfoUnauthorizedError extends Error implements ContractErrorBase {
  readonly name = "CampaignInfoUnauthorized";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Caller is not authorized for this campaign operation.";

  constructor() {
    super("CampaignInfoUnauthorized()");
    Object.setPrototypeOf(this, CampaignInfoUnauthorizedError.prototype);
  }
}

export class CampaignInfoIsLockedError extends Error implements ContractErrorBase {
  readonly name = "CampaignInfoIsLocked";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The campaign info is locked and cannot be modified.";

  constructor() {
    super("CampaignInfoIsLocked()");
    Object.setPrototypeOf(this, CampaignInfoIsLockedError.prototype);
  }
}

export type CampaignInfoError =
  | CampaignInfoInvalidInputError
  | CampaignInfoInvalidPlatformUpdateError
  | CampaignInfoPlatformNotSelectedError
  | CampaignInfoPlatformAlreadyApprovedError
  | CampaignInfoUnauthorizedError
  | CampaignInfoIsLockedError;
