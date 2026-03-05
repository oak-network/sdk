import type { ContractErrorBase } from "./contract-error.js";

export class GlobalParamsInvalidInputError extends Error implements ContractErrorBase {
  readonly name = "GlobalParamsInvalidInput";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "One or more inputs are invalid. Check addresses, fee percent, and platform bytes.";

  constructor() {
    super("GlobalParamsInvalidInput()");
    Object.setPrototypeOf(this, GlobalParamsInvalidInputError.prototype);
  }
}

export class GlobalParamsPlatformAdminNotSetError extends Error implements ContractErrorBase {
  readonly name = "GlobalParamsPlatformAdminNotSet";
  readonly args: { platformBytes: string };
  readonly recoveryHint = "Set the platform admin address before performing this operation.";

  constructor(args: { platformBytes: string }) {
    super(`GlobalParamsPlatformAdminNotSet(platformBytes: ${args.platformBytes})`);
    this.args = args;
    Object.setPrototypeOf(this, GlobalParamsPlatformAdminNotSetError.prototype);
  }
}

export class GlobalParamsPlatformAlreadyListedError extends Error implements ContractErrorBase {
  readonly name = "GlobalParamsPlatformAlreadyListed";
  readonly args: { platformBytes: string };
  readonly recoveryHint =
    "Platform is already listed. Use a different platform hash or update the existing platform.";

  constructor(args: { platformBytes: string }) {
    super(`GlobalParamsPlatformAlreadyListed(platformBytes: ${args.platformBytes})`);
    this.args = args;
    Object.setPrototypeOf(this, GlobalParamsPlatformAlreadyListedError.prototype);
  }
}

export class GlobalParamsPlatformDataAlreadySetError extends Error implements ContractErrorBase {
  readonly name = "GlobalParamsPlatformDataAlreadySet";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Platform data for this key is already set. Use a different key or update.";

  constructor() {
    super("GlobalParamsPlatformDataAlreadySet()");
    Object.setPrototypeOf(this, GlobalParamsPlatformDataAlreadySetError.prototype);
  }
}

export class GlobalParamsPlatformDataNotSetError extends Error implements ContractErrorBase {
  readonly name = "GlobalParamsPlatformDataNotSet";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Platform data is not set. Add platform data first.";

  constructor() {
    super("GlobalParamsPlatformDataNotSet()");
    Object.setPrototypeOf(this, GlobalParamsPlatformDataNotSetError.prototype);
  }
}

export class GlobalParamsPlatformDataSlotTakenError extends Error implements ContractErrorBase {
  readonly name = "GlobalParamsPlatformDataSlotTaken";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "This platform data slot is already taken. Use a different key.";

  constructor() {
    super("GlobalParamsPlatformDataSlotTaken()");
    Object.setPrototypeOf(this, GlobalParamsPlatformDataSlotTakenError.prototype);
  }
}

export class GlobalParamsPlatformFeePercentIsZeroError extends Error implements ContractErrorBase {
  readonly name = "GlobalParamsPlatformFeePercentIsZero";
  readonly args: { platformBytes: string };
  readonly recoveryHint = "Platform fee percent must be greater than zero.";

  constructor(args: { platformBytes: string }) {
    super(`GlobalParamsPlatformFeePercentIsZero(platformBytes: ${args.platformBytes})`);
    this.args = args;
    Object.setPrototypeOf(this, GlobalParamsPlatformFeePercentIsZeroError.prototype);
  }
}

export class GlobalParamsPlatformNotListedError extends Error implements ContractErrorBase {
  readonly name = "GlobalParamsPlatformNotListed";
  readonly args: { platformBytes: string; platformAdminAddress: string };
  readonly recoveryHint =
    "Platform is not enlisted in GlobalParams. Enlist the platform first.";

  constructor(args: { platformBytes: string; platformAdminAddress: string }) {
    super(
      `GlobalParamsPlatformNotListed(platformBytes: ${args.platformBytes}, platformAdminAddress: ${args.platformAdminAddress})`,
    );
    this.args = args;
    Object.setPrototypeOf(this, GlobalParamsPlatformNotListedError.prototype);
  }
}

export class GlobalParamsUnauthorizedError extends Error implements ContractErrorBase {
  readonly name = "GlobalParamsUnauthorized";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint = "Caller is not authorized for this operation.";

  constructor() {
    super("GlobalParamsUnauthorized()");
    Object.setPrototypeOf(this, GlobalParamsUnauthorizedError.prototype);
  }
}

export class GlobalParamsCurrencyTokenLengthMismatchError extends Error implements ContractErrorBase {
  readonly name = "GlobalParamsCurrencyTokenLengthMismatch";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "Length of currencies array must match length of tokensPerCurrency. Check initialize or currency config.";

  constructor() {
    super("GlobalParamsCurrencyTokenLengthMismatch()");
    Object.setPrototypeOf(this, GlobalParamsCurrencyTokenLengthMismatchError.prototype);
  }
}

export class GlobalParamsCurrencyHasNoTokensError extends Error implements ContractErrorBase {
  readonly name = "GlobalParamsCurrencyHasNoTokens";
  readonly args: { currency: string };
  readonly recoveryHint = "This currency has no accepted tokens. Add at least one token for the currency.";

  constructor(args: { currency: string }) {
    super(`GlobalParamsCurrencyHasNoTokens(currency: ${args.currency})`);
    this.args = args;
    Object.setPrototypeOf(this, GlobalParamsCurrencyHasNoTokensError.prototype);
  }
}

export class GlobalParamsTokenNotInCurrencyError extends Error implements ContractErrorBase {
  readonly name = "GlobalParamsTokenNotInCurrency";
  readonly args: { currency: string; token: string };
  readonly recoveryHint =
    "The given token is not in the accepted list for this currency. Use an approved token.";

  constructor(args: { currency: string; token: string }) {
    super(`GlobalParamsTokenNotInCurrency(currency: ${args.currency}, token: ${args.token})`);
    this.args = args;
    Object.setPrototypeOf(this, GlobalParamsTokenNotInCurrencyError.prototype);
  }
}

export class GlobalParamsPlatformLineItemTypeNotFoundError extends Error implements ContractErrorBase {
  readonly name = "GlobalParamsPlatformLineItemTypeNotFound";
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
