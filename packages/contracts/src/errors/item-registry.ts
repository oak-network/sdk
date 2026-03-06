import type { ContractErrorBase } from "./contract-error.js";

export class ItemRegistryMismatchedArraysLengthError extends Error implements ContractErrorBase {
  readonly name = "ItemRegistryMismatchedArraysLength";
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "The itemIds and items arrays must have the same length. Ensure both arrays are equal in size.";

  constructor() {
    super("ItemRegistryMismatchedArraysLength()");
    Object.setPrototypeOf(this, ItemRegistryMismatchedArraysLengthError.prototype);
  }
}

export type ItemRegistryError = ItemRegistryMismatchedArraysLengthError;
