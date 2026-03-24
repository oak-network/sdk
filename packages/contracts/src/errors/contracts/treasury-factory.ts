import type { ContractErrorBase } from "../base";

/** TreasuryFactory error name strings. */
export const TreasuryFactoryErrorNames = {
  Unauthorized: "TreasuryFactoryUnauthorized",
  InvalidKey: "TreasuryFactoryInvalidKey",
  TreasuryCreationFailed: "TreasuryFactoryTreasuryCreationFailed",
  InvalidAddress: "TreasuryFactoryInvalidAddress",
  ImplementationNotSet: "TreasuryFactoryImplementationNotSet",
  ImplementationNotSetOrApproved: "TreasuryFactoryImplementationNotSetOrApproved",
  TreasuryInitializationFailed: "TreasuryFactoryTreasuryInitializationFailed",
  SettingPlatformInfoFailed: "TreasuryFactorySettingPlatformInfoFailed",
} as const;

/** Thrown when the caller is not authorised for the attempted TreasuryFactory operation. */
export class TreasuryFactoryUnauthorizedError extends Error implements ContractErrorBase {
  readonly name = TreasuryFactoryErrorNames.Unauthorized;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Caller is not authorized for this operation on the TreasuryFactory.";

  constructor() {
    super("TreasuryFactoryUnauthorized()");
    Object.setPrototypeOf(this, TreasuryFactoryUnauthorizedError.prototype);
  }
}

/** Thrown when the platform hash and implementation ID combination does not resolve to a valid key. */
export class TreasuryFactoryInvalidKeyError extends Error implements ContractErrorBase {
  readonly name = TreasuryFactoryErrorNames.InvalidKey;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "The provided implementation key is invalid. Check the platform hash and implementation ID.";

  constructor() {
    super("TreasuryFactoryInvalidKey()");
    Object.setPrototypeOf(this, TreasuryFactoryInvalidKeyError.prototype);
  }
}

/** Thrown when the EIP-1167 minimal proxy clone deployment fails. */
export class TreasuryFactoryTreasuryCreationFailedError extends Error implements ContractErrorBase {
  readonly name = TreasuryFactoryErrorNames.TreasuryCreationFailed;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Treasury clone creation failed. Check the implementation address and try again.";

  constructor() {
    super("TreasuryFactoryTreasuryCreationFailed()");
    Object.setPrototypeOf(this, TreasuryFactoryTreasuryCreationFailedError.prototype);
  }
}

/** Thrown when one or more provided addresses are the zero address. */
export class TreasuryFactoryInvalidAddressError extends Error implements ContractErrorBase {
  readonly name = TreasuryFactoryErrorNames.InvalidAddress;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "One or more provided addresses are invalid. Ensure all addresses are non-zero.";

  constructor() {
    super("TreasuryFactoryInvalidAddress()");
    Object.setPrototypeOf(this, TreasuryFactoryInvalidAddressError.prototype);
  }
}

/** Thrown when deploy is called but no implementation is registered for the given platform and ID. */
export class TreasuryFactoryImplementationNotSetError extends Error implements ContractErrorBase {
  readonly name = TreasuryFactoryErrorNames.ImplementationNotSet;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "No implementation is registered for this platform and implementation ID. Register the implementation first.";

  constructor() {
    super("TreasuryFactoryImplementationNotSet()");
    Object.setPrototypeOf(this, TreasuryFactoryImplementationNotSetError.prototype);
  }
}

/** Thrown when deploy is called but the registered implementation has not been approved. */
export class TreasuryFactoryImplementationNotSetOrApprovedError
  extends Error
  implements ContractErrorBase
{
  readonly name = TreasuryFactoryErrorNames.ImplementationNotSetOrApproved;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "The implementation is not registered or not approved. Register and approve the implementation before deploying.";

  constructor() {
    super("TreasuryFactoryImplementationNotSetOrApproved()");
    Object.setPrototypeOf(this, TreasuryFactoryImplementationNotSetOrApprovedError.prototype);
  }
}

/** Thrown when the deployed treasury clone fails its initialise call. */
export class TreasuryFactoryTreasuryInitializationFailedError
  extends Error
  implements ContractErrorBase
{
  readonly name = TreasuryFactoryErrorNames.TreasuryInitializationFailed;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "Treasury initialization failed after cloning. Check the implementation and initialization parameters.";

  constructor() {
    super("TreasuryFactoryTreasuryInitializationFailed()");
    Object.setPrototypeOf(this, TreasuryFactoryTreasuryInitializationFailedError.prototype);
  }
}

/** Thrown when setting platform info on the newly deployed treasury clone fails. */
export class TreasuryFactorySettingPlatformInfoFailedError
  extends Error
  implements ContractErrorBase
{
  readonly name = TreasuryFactoryErrorNames.SettingPlatformInfoFailed;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "Setting platform info on the deployed treasury failed. Check the treasury implementation and platform data.";

  constructor() {
    super("TreasuryFactorySettingPlatformInfoFailed()");
    Object.setPrototypeOf(this, TreasuryFactorySettingPlatformInfoFailedError.prototype);
  }
}

/** Union of all typed errors that can be thrown by TreasuryFactory contract calls. */
export type TreasuryFactoryError =
  | TreasuryFactoryUnauthorizedError
  | TreasuryFactoryInvalidKeyError
  | TreasuryFactoryTreasuryCreationFailedError
  | TreasuryFactoryInvalidAddressError
  | TreasuryFactoryImplementationNotSetError
  | TreasuryFactoryImplementationNotSetOrApprovedError
  | TreasuryFactoryTreasuryInitializationFailedError
  | TreasuryFactorySettingPlatformInfoFailedError;
