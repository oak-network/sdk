import type { Hex } from "../../lib";
import type { ContractErrorBase } from "../base";
import { ITEM_REGISTRY_ABI } from "../../contracts/item-registry/abi";
import {
  ItemRegistryErrorNames,
  ItemRegistryMismatchedArraysLengthError,
} from "../contracts/item-registry";
import type { ErrorAbiEntry } from "./shared";
import { toSharedContractError, tryDecodeContractError } from "./shared";

/**
 * Maps a decoded ItemRegistry error name and args to a typed SDK error instance.
 * @param name - Decoded error name string
 * @param args - Decoded error arguments
 * @returns Typed ItemRegistry error, or a generic fallback
 */
function toItemRegistryError(name: string, args: Record<string, unknown>): ContractErrorBase {
  switch (name) {
    case ItemRegistryErrorNames.MismatchedArraysLength:
      return new ItemRegistryMismatchedArraysLengthError();
    /* istanbul ignore next -- defensive fallback; ItemRegistry ABI has no shared error selectors */
    default: {
      const shared = toSharedContractError(name, args);
      if (!shared) {
        return new (class extends Error implements ContractErrorBase {
          readonly name = name;
          readonly args = args;
        })(`${name}(${JSON.stringify(args)})`);
      }
      return shared;
    }
  }
}

/**
 * Decodes raw revert data from an ItemRegistry contract call into a typed SDK error.
 * @param data - 0x-prefixed hex revert data
 * @returns Typed ItemRegistry error instance, or null if the selector is not recognised
 */
export function parseItemRegistryError(data: Hex): ContractErrorBase | null {
  return tryDecodeContractError(
    ITEM_REGISTRY_ABI as readonly ErrorAbiEntry[],
    data,
    toItemRegistryError,
  );
}
