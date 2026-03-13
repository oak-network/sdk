import type { ContractErrorBase } from "../base";

/** ItemRegistry error name strings. */
export const ItemRegistryErrorNames = {
  MismatchedArraysLength: "ItemRegistryMismatchedArraysLength",
} as const;

/** Thrown when itemIds and items arrays passed to addItemsBatch have different lengths. */
export class ItemRegistryMismatchedArraysLengthError extends Error implements ContractErrorBase {
  readonly name = ItemRegistryErrorNames.MismatchedArraysLength;
  readonly args: Record<string, unknown> = {};
  readonly recoveryHint =
    "The itemIds and items arrays must have the same length. Ensure both arrays are equal in size.";

  constructor() {
    super("ItemRegistryMismatchedArraysLength()");
    Object.setPrototypeOf(this, ItemRegistryMismatchedArraysLengthError.prototype);
  }
}

/** Union of all typed errors that can be thrown by ItemRegistry contract calls. */
export type ItemRegistryError = ItemRegistryMismatchedArraysLengthError;
