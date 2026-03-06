import type { ContractErrorBase } from "./contract-error.js";

export class TreasuryFactoryUnauthorizedError extends Error implements ContractErrorBase {
  readonly name = "TreasuryFactoryUnauthorized";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Caller is not authorized for this operation on the TreasuryFactory.";

  constructor() {
    super("TreasuryFactoryUnauthorized()");
    Object.setPrototypeOf(this, TreasuryFactoryUnauthorizedError.prototype);
  }
}

export class TreasuryFactoryInvalidKeyError extends Error implements ContractErrorBase {
  readonly name = "TreasuryFactoryInvalidKey";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The provided implementation key is invalid. Check the platform hash and implementation ID.";

  constructor() {
    super("TreasuryFactoryInvalidKey()");
    Object.setPrototypeOf(this, TreasuryFactoryInvalidKeyError.prototype);
  }
}

export class TreasuryFactoryTreasuryCreationFailedError extends Error implements ContractErrorBase {
  readonly name = "TreasuryFactoryTreasuryCreationFailed";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Treasury clone creation failed. Check the implementation address and try again.";

  constructor() {
    super("TreasuryFactoryTreasuryCreationFailed()");
    Object.setPrototypeOf(this, TreasuryFactoryTreasuryCreationFailedError.prototype);
  }
}

export class TreasuryFactoryInvalidAddressError extends Error implements ContractErrorBase {
  readonly name = "TreasuryFactoryInvalidAddress";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "One or more provided addresses are invalid. Ensure all addresses are non-zero.";

  constructor() {
    super("TreasuryFactoryInvalidAddress()");
    Object.setPrototypeOf(this, TreasuryFactoryInvalidAddressError.prototype);
  }
}

export class TreasuryFactoryImplementationNotSetError extends Error implements ContractErrorBase {
  readonly name = "TreasuryFactoryImplementationNotSet";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "No implementation is registered for this platform and implementation ID. Register the implementation first.";

  constructor() {
    super("TreasuryFactoryImplementationNotSet()");
    Object.setPrototypeOf(this, TreasuryFactoryImplementationNotSetError.prototype);
  }
}

export class TreasuryFactoryImplementationNotSetOrApprovedError
  extends Error
  implements ContractErrorBase
{
  readonly name = "TreasuryFactoryImplementationNotSetOrApproved";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "The implementation is not registered or not approved. Register and approve the implementation before deploying.";

  constructor() {
    super("TreasuryFactoryImplementationNotSetOrApproved()");
    Object.setPrototypeOf(this, TreasuryFactoryImplementationNotSetOrApprovedError.prototype);
  }
}

export class TreasuryFactoryTreasuryInitializationFailedError
  extends Error
  implements ContractErrorBase
{
  readonly name = "TreasuryFactoryTreasuryInitializationFailed";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "Treasury initialization failed after cloning. Check the implementation and initialization parameters.";

  constructor() {
    super("TreasuryFactoryTreasuryInitializationFailed()");
    Object.setPrototypeOf(this, TreasuryFactoryTreasuryInitializationFailedError.prototype);
  }
}

export class TreasuryFactorySettingPlatformInfoFailedError
  extends Error
  implements ContractErrorBase
{
  readonly name = "TreasuryFactorySettingPlatformInfoFailed";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "Setting platform info on the deployed treasury failed. Check the treasury implementation and platform data.";

  constructor() {
    super("TreasuryFactorySettingPlatformInfoFailed()");
    Object.setPrototypeOf(this, TreasuryFactorySettingPlatformInfoFailedError.prototype);
  }
}

export type TreasuryFactoryError =
  | TreasuryFactoryUnauthorizedError
  | TreasuryFactoryInvalidKeyError
  | TreasuryFactoryTreasuryCreationFailedError
  | TreasuryFactoryInvalidAddressError
  | TreasuryFactoryImplementationNotSetError
  | TreasuryFactoryImplementationNotSetOrApprovedError
  | TreasuryFactoryTreasuryInitializationFailedError
  | TreasuryFactorySettingPlatformInfoFailedError;
