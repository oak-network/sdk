import type { ContractErrorBase } from "../base";

/** CampaignInfoFactory + CampaignInfoInvalidTokenList error name strings. */
export const CampaignInfoFactoryErrorNames = {
  CampaignInitializationFailed: "CampaignInfoFactoryCampaignInitializationFailed",
  InvalidInput: "CampaignInfoFactoryInvalidInput",
  PlatformNotListed: "CampaignInfoFactoryPlatformNotListed",
  CampaignWithSameIdentifierExists: "CampaignInfoFactoryCampaignWithSameIdentifierExists",
  CampaignInfoInvalidTokenList: "CampaignInfoInvalidTokenList",
} as const;

/** Thrown when the campaign clone is deployed but fails to initialise with the provided data. */
export class CampaignInfoFactoryCampaignInitializationFailedError
  extends Error
  implements ContractErrorBase
{
  readonly name = CampaignInfoFactoryErrorNames.CampaignInitializationFailed;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "Campaign initialization failed. Check campaign data, platform listing, and implementation.";

  constructor() {
    super("CampaignInfoFactoryCampaignInitializationFailed()");
    Object.setPrototypeOf(this, CampaignInfoFactoryCampaignInitializationFailedError.prototype);
  }
}

/** Thrown when one or more createCampaign inputs are invalid (e.g. zero address, empty arrays). */
export class CampaignInfoFactoryInvalidInputError extends Error implements ContractErrorBase {
  readonly name = CampaignInfoFactoryErrorNames.InvalidInput;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "Invalid input for campaign creation. Check creator, platforms, and campaign data.";

  constructor() {
    super("CampaignInfoFactoryInvalidInput()");
    Object.setPrototypeOf(this, CampaignInfoFactoryInvalidInputError.prototype);
  }
}

/** Thrown when a selected platform is not enlisted in GlobalParams. */
export class CampaignInfoFactoryPlatformNotListedError extends Error implements ContractErrorBase {
  readonly name = CampaignInfoFactoryErrorNames.PlatformNotListed;
  readonly args: { platformHash: string };
  readonly recoveryHint = "The given platform is not listed in GlobalParams. Enlist the platform first.";

  constructor(args: { platformHash: string }) {
    super(`CampaignInfoFactoryPlatformNotListed(platformHash: ${args.platformHash})`);
    this.args = args;
    Object.setPrototypeOf(this, CampaignInfoFactoryPlatformNotListedError.prototype);
  }
}

/** Thrown when createCampaign is called with an identifier hash that is already in use. */
export class CampaignInfoFactoryCampaignWithSameIdentifierExistsError
  extends Error
  implements ContractErrorBase
{
  readonly name = CampaignInfoFactoryErrorNames.CampaignWithSameIdentifierExists;
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

/** Thrown when the campaign currency's token list does not match the GlobalParams registry. */
export class CampaignInfoInvalidTokenListError extends Error implements ContractErrorBase {
  readonly name = CampaignInfoFactoryErrorNames.CampaignInfoInvalidTokenList;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "Campaign currency tokens do not match GlobalParams for the campaign currency. Fix token list.";

  constructor() {
    super("CampaignInfoInvalidTokenList()");
    Object.setPrototypeOf(this, CampaignInfoInvalidTokenListError.prototype);
  }
}

/** Union of all typed errors that can be thrown by CampaignInfoFactory contract calls. */
export type CampaignInfoFactoryError =
  | CampaignInfoFactoryCampaignInitializationFailedError
  | CampaignInfoFactoryInvalidInputError
  | CampaignInfoFactoryPlatformNotListedError
  | CampaignInfoFactoryCampaignWithSameIdentifierExistsError
  | CampaignInfoInvalidTokenListError;
