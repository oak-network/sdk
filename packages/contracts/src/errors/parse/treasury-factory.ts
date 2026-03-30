import type { Hex } from "../../lib";
import type { ContractErrorBase } from "../base";
import { TREASURY_FACTORY_ABI } from "../../contracts/treasury-factory/abi";
import {
  TreasuryFactoryErrorNames,
  TreasuryFactoryImplementationNotSetError,
  TreasuryFactoryImplementationNotSetOrApprovedError,
  TreasuryFactoryInvalidAddressError,
  TreasuryFactoryInvalidKeyError,
  TreasuryFactorySettingPlatformInfoFailedError,
  TreasuryFactoryTreasuryCreationFailedError,
  TreasuryFactoryTreasuryInitializationFailedError,
  TreasuryFactoryUnauthorizedError,
} from "../contracts/treasury-factory";
import type { ErrorAbiEntry } from "./shared";
import { toSharedContractError, tryDecodeContractError } from "./shared";

/**
 * Maps a decoded TreasuryFactory error name and args to a typed SDK error instance.
 * @param name - Decoded error name string
 * @param args - Decoded error arguments
 * @returns Typed TreasuryFactory error, or a shared/generic fallback
 */
function toTreasuryFactoryError(name: string, args: Record<string, unknown>): ContractErrorBase {
  switch (name) {
    case TreasuryFactoryErrorNames.Unauthorized:
      return new TreasuryFactoryUnauthorizedError();
    case TreasuryFactoryErrorNames.InvalidKey:
      return new TreasuryFactoryInvalidKeyError();
    case TreasuryFactoryErrorNames.TreasuryCreationFailed:
      return new TreasuryFactoryTreasuryCreationFailedError();
    case TreasuryFactoryErrorNames.InvalidAddress:
      return new TreasuryFactoryInvalidAddressError();
    case TreasuryFactoryErrorNames.ImplementationNotSet:
      return new TreasuryFactoryImplementationNotSetError();
    case TreasuryFactoryErrorNames.ImplementationNotSetOrApproved:
      return new TreasuryFactoryImplementationNotSetOrApprovedError();
    case TreasuryFactoryErrorNames.TreasuryInitializationFailed:
      return new TreasuryFactoryTreasuryInitializationFailedError();
    case TreasuryFactoryErrorNames.SettingPlatformInfoFailed:
      return new TreasuryFactorySettingPlatformInfoFailedError();
    default: {
      const shared = toSharedContractError(name, args);
      /* istanbul ignore next -- defensive fallback; all shared errors are recognised */
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
 * Decodes raw revert data from a TreasuryFactory contract call into a typed SDK error.
 * @param data - 0x-prefixed hex revert data
 * @returns Typed TreasuryFactory error instance, or null if the selector is not recognised
 */
export function parseTreasuryFactoryError(data: Hex): ContractErrorBase | null {
  return tryDecodeContractError(
    TREASURY_FACTORY_ABI as readonly ErrorAbiEntry[],
    data,
    toTreasuryFactoryError,
  );
}
