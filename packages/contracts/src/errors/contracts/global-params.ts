import type { ContractErrorBase } from "../base";

/** GlobalParams error name strings. */
export const GlobalParamsErrorNames = {
  InvalidInput: "GlobalParamsInvalidInput",
  PlatformAdminNotSet: "GlobalParamsPlatformAdminNotSet",
  PlatformAlreadyListed: "GlobalParamsPlatformAlreadyListed",
  PlatformDataAlreadySet: "GlobalParamsPlatformDataAlreadySet",
  PlatformDataNotSet: "GlobalParamsPlatformDataNotSet",
  PlatformDataSlotTaken: "GlobalParamsPlatformDataSlotTaken",
  PlatformFeePercentIsZero: "GlobalParamsPlatformFeePercentIsZero",
  PlatformNotListed: "GlobalParamsPlatformNotListed",
  Unauthorized: "GlobalParamsUnauthorized",
  CurrencyTokenLengthMismatch: "GlobalParamsCurrencyTokenLengthMismatch",
  CurrencyHasNoTokens: "GlobalParamsCurrencyHasNoTokens",
  TokenNotInCurrency: "GlobalParamsTokenNotInCurrency",
  PlatformLineItemTypeNotFound: "GlobalParamsPlatformLineItemTypeNotFound",
} as const;

/** Thrown when one or more inputs (address, fee, or bytes) are invalid. */
export class GlobalParamsInvalidInputError extends Error implements ContractErrorBase {
  readonly name = GlobalParamsErrorNames.InvalidInput;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "One or more inputs are invalid. Check addresses, fee percent, and platform bytes.";

  constructor() {
    super("GlobalParamsInvalidInput()");
    Object.setPrototypeOf(this, GlobalParamsInvalidInputError.prototype);
  }
}

/** Thrown when an operation requires a platform admin that has not been set. */
export class GlobalParamsPlatformAdminNotSetError extends Error implements ContractErrorBase {
  readonly name = GlobalParamsErrorNames.PlatformAdminNotSet;
  readonly args: { platformBytes: string };
  readonly recoveryHint = "Set the platform admin address before performing this operation.";

  constructor(args: { platformBytes: string }) {
    super(`GlobalParamsPlatformAdminNotSet(platformBytes: ${args.platformBytes})`);
    this.args = args;
    Object.setPrototypeOf(this, GlobalParamsPlatformAdminNotSetError.prototype);
  }
}

/** Thrown when enlistPlatform is called for a platform that is already listed. */
export class GlobalParamsPlatformAlreadyListedError extends Error implements ContractErrorBase {
  readonly name = GlobalParamsErrorNames.PlatformAlreadyListed;
  readonly args: { platformBytes: string };
  readonly recoveryHint =
    "Platform is already listed. Use a different platform hash or update the existing platform.";

  constructor(args: { platformBytes: string }) {
    super(`GlobalParamsPlatformAlreadyListed(platformBytes: ${args.platformBytes})`);
    this.args = args;
    Object.setPrototypeOf(this, GlobalParamsPlatformAlreadyListedError.prototype);
  }
}

/** Thrown when a platform data key is added that already exists. */
export class GlobalParamsPlatformDataAlreadySetError extends Error implements ContractErrorBase {
  readonly name = GlobalParamsErrorNames.PlatformDataAlreadySet;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Platform data for this key is already set. Use a different key or update.";

  constructor() {
    super("GlobalParamsPlatformDataAlreadySet()");
    Object.setPrototypeOf(this, GlobalParamsPlatformDataAlreadySetError.prototype);
  }
}

/** Thrown when an operation references a platform data key that has not been set. */
export class GlobalParamsPlatformDataNotSetError extends Error implements ContractErrorBase {
  readonly name = GlobalParamsErrorNames.PlatformDataNotSet;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Platform data is not set. Add platform data first.";

  constructor() {
    super("GlobalParamsPlatformDataNotSet()");
    Object.setPrototypeOf(this, GlobalParamsPlatformDataNotSetError.prototype);
  }
}

/** Thrown when a platform data slot is already occupied by another key. */
export class GlobalParamsPlatformDataSlotTakenError extends Error implements ContractErrorBase {
  readonly name = GlobalParamsErrorNames.PlatformDataSlotTaken;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "This platform data slot is already taken. Use a different key.";

  constructor() {
    super("GlobalParamsPlatformDataSlotTaken()");
    Object.setPrototypeOf(this, GlobalParamsPlatformDataSlotTakenError.prototype);
  }
}

/** Thrown when a platform fee percent of zero is provided. */
export class GlobalParamsPlatformFeePercentIsZeroError extends Error implements ContractErrorBase {
  readonly name = GlobalParamsErrorNames.PlatformFeePercentIsZero;
  readonly args: { platformBytes: string };
  readonly recoveryHint = "Platform fee percent must be greater than zero.";

  constructor(args: { platformBytes: string }) {
    super(`GlobalParamsPlatformFeePercentIsZero(platformBytes: ${args.platformBytes})`);
    this.args = args;
    Object.setPrototypeOf(this, GlobalParamsPlatformFeePercentIsZeroError.prototype);
  }
}

/** Thrown when an operation targets a platform that is not enlisted. */
export class GlobalParamsPlatformNotListedError extends Error implements ContractErrorBase {
  readonly name = GlobalParamsErrorNames.PlatformNotListed;
  readonly args: { platformBytes: string };
  readonly recoveryHint =
    "Platform is not enlisted in GlobalParams. Enlist the platform first.";

  constructor(args: { platformBytes: string }) {
    super(`GlobalParamsPlatformNotListed(platformBytes: ${args.platformBytes})`);
    this.args = args;
    Object.setPrototypeOf(this, GlobalParamsPlatformNotListedError.prototype);
  }
}

/** Thrown when the caller is not the protocol admin. */
export class GlobalParamsUnauthorizedError extends Error implements ContractErrorBase {
  readonly name = GlobalParamsErrorNames.Unauthorized;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Caller is not authorized for this operation.";

  constructor() {
    super("GlobalParamsUnauthorized()");
    Object.setPrototypeOf(this, GlobalParamsUnauthorizedError.prototype);
  }
}

/** Thrown when the currencies and tokensPerCurrency arrays have different lengths during initialisation. */
export class GlobalParamsCurrencyTokenLengthMismatchError extends Error implements ContractErrorBase {
  readonly name = GlobalParamsErrorNames.CurrencyTokenLengthMismatch;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "Length of currencies array must match length of tokensPerCurrency. Check initialize or currency config.";

  constructor() {
    super("GlobalParamsCurrencyTokenLengthMismatch()");
    Object.setPrototypeOf(this, GlobalParamsCurrencyTokenLengthMismatchError.prototype);
  }
}

/** Thrown when an operation requires accepted tokens for a currency that has none registered. */
export class GlobalParamsCurrencyHasNoTokensError extends Error implements ContractErrorBase {
  readonly name = GlobalParamsErrorNames.CurrencyHasNoTokens;
  readonly args: { currency: string };
  readonly recoveryHint = "This currency has no accepted tokens. Add at least one token for the currency.";

  constructor(args: { currency: string }) {
    super(`GlobalParamsCurrencyHasNoTokens(currency: ${args.currency})`);
    this.args = args;
    Object.setPrototypeOf(this, GlobalParamsCurrencyHasNoTokensError.prototype);
  }
}

/** Thrown when a token is not in the accepted list for the given currency. */
export class GlobalParamsTokenNotInCurrencyError extends Error implements ContractErrorBase {
  readonly name = GlobalParamsErrorNames.TokenNotInCurrency;
  readonly args: { currency: string; token: string };
  readonly recoveryHint =
    "The given token is not in the accepted list for this currency. Use an approved token.";

  constructor(args: { currency: string; token: string }) {
    super(`GlobalParamsTokenNotInCurrency(currency: ${args.currency}, token: ${args.token})`);
    this.args = args;
    Object.setPrototypeOf(this, GlobalParamsTokenNotInCurrencyError.prototype);
  }
}

/** Thrown when a line item type is not registered for the given platform and type ID. */
export class GlobalParamsPlatformLineItemTypeNotFoundError extends Error implements ContractErrorBase {
  readonly name = GlobalParamsErrorNames.PlatformLineItemTypeNotFound;
  readonly args: { platformHash: string; typeId: string };
  readonly recoveryHint =
    "Platform line item type not found. Register the line item type for this platform first.";

  constructor(args: { platformHash: string; typeId: string }) {
    super(
      `GlobalParamsPlatformLineItemTypeNotFound(platformHash: ${args.platformHash}, typeId: ${args.typeId})`,
    );
    this.args = args;
    Object.setPrototypeOf(this, GlobalParamsPlatformLineItemTypeNotFoundError.prototype);
  }
}

/** Union of all typed errors that can be thrown by GlobalParams contract calls. */
export type GlobalParamsError =
  | GlobalParamsInvalidInputError
  | GlobalParamsPlatformAdminNotSetError
  | GlobalParamsPlatformAlreadyListedError
  | GlobalParamsPlatformDataAlreadySetError
  | GlobalParamsPlatformDataNotSetError
  | GlobalParamsPlatformDataSlotTakenError
  | GlobalParamsPlatformFeePercentIsZeroError
  | GlobalParamsPlatformNotListedError
  | GlobalParamsUnauthorizedError
  | GlobalParamsCurrencyTokenLengthMismatchError
  | GlobalParamsCurrencyHasNoTokensError
  | GlobalParamsTokenNotInCurrencyError
  | GlobalParamsPlatformLineItemTypeNotFoundError;
