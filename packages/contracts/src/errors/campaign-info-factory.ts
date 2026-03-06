import type { ContractErrorBase } from "./contract-error.js";

export class CampaignInfoFactoryCampaignInitializationFailedError
  extends Error
  implements ContractErrorBase
{
  readonly name = "CampaignInfoFactoryCampaignInitializationFailed";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "Campaign initialization failed. Check campaign data, platform listing, and implementation.";

  constructor() {
    super("CampaignInfoFactoryCampaignInitializationFailed()");
    Object.setPrototypeOf(this, CampaignInfoFactoryCampaignInitializationFailedError.prototype);
  }
}

export class CampaignInfoFactoryInvalidInputError extends Error implements ContractErrorBase {
  readonly name = "CampaignInfoFactoryInvalidInput";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "Invalid input for campaign creation. Check creator, platforms, and campaign data.";

  constructor() {
    super("CampaignInfoFactoryInvalidInput()");
    Object.setPrototypeOf(this, CampaignInfoFactoryInvalidInputError.prototype);
  }
}

export class CampaignInfoFactoryPlatformNotListedError extends Error implements ContractErrorBase {
  readonly name = "CampaignInfoFactoryPlatformNotListed";
  readonly args: { platformHash: string };
  readonly recoveryHint = "The given platform is not listed in GlobalParams. Enlist the platform first.";

  constructor(args: { platformHash: string }) {
    super(`CampaignInfoFactoryPlatformNotListed(platformHash: ${args.platformHash})`);
    this.args = args;
    Object.setPrototypeOf(this, CampaignInfoFactoryPlatformNotListedError.prototype);
  }
}

export class CampaignInfoFactoryCampaignWithSameIdentifierExistsError
  extends Error
  implements ContractErrorBase
{
  readonly name = "CampaignInfoFactoryCampaignWithSameIdentifierExists";
  readonly args: { identifierHash: string; cloneExists: string };
  readonly recoveryHint =
    "A campaign with this identifier already exists. Use a different identifier or the existing campaign.";

  constructor(args: { identifierHash: string; cloneExists: string }) {
    super(
      `CampaignInfoFactoryCampaignWithSameIdentifierExists(identifierHash: ${args.identifierHash}, cloneExists: ${args.cloneExists})`,
    );
    this.args = args;
    Object.setPrototypeOf(this, CampaignInfoFactoryCampaignWithSameIdentifierExistsError.prototype);
  }
}

export class CampaignInfoInvalidTokenListError extends Error implements ContractErrorBase {
  readonly name = "CampaignInfoInvalidTokenList";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "Campaign currency tokens do not match GlobalParams for the campaign currency. Fix token list.";

  constructor() {
    super("CampaignInfoInvalidTokenList()");
    Object.setPrototypeOf(this, CampaignInfoInvalidTokenListError.prototype);
  }
}

export type CampaignInfoFactoryError =
  | CampaignInfoFactoryCampaignInitializationFailedError
  | CampaignInfoFactoryInvalidInputError
  | CampaignInfoFactoryPlatformNotListedError
  | CampaignInfoFactoryCampaignWithSameIdentifierExistsError
  | CampaignInfoInvalidTokenListError;
