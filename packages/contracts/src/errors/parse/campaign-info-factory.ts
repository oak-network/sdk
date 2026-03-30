import type { Hex } from "../../lib";
import type { ContractErrorBase } from "../base";
import { CAMPAIGN_INFO_FACTORY_ABI } from "../../contracts/campaign-info-factory/abi";
import {
  CampaignInfoFactoryCampaignInitializationFailedError,
  CampaignInfoFactoryCampaignWithSameIdentifierExistsError,
  CampaignInfoFactoryErrorNames,
  CampaignInfoFactoryInvalidInputError,
  CampaignInfoFactoryPlatformNotListedError,
  CampaignInfoInvalidTokenListError,
} from "../contracts/campaign-info-factory";
import type { ErrorAbiEntry } from "./shared";
import { toSharedContractError, tryDecodeContractError } from "./shared";

/**
 * Maps a decoded CampaignInfoFactory error name and args to a typed SDK error instance.
 * @param name - Decoded error name string
 * @param args - Decoded error arguments
 * @returns Typed CampaignInfoFactory error, or a shared/generic fallback
 */
function toCampaignInfoFactoryError(
  name: string,
  args: Record<string, unknown>,
): ContractErrorBase {
  switch (name) {
    case CampaignInfoFactoryErrorNames.CampaignInitializationFailed:
      return new CampaignInfoFactoryCampaignInitializationFailedError();
    case CampaignInfoFactoryErrorNames.InvalidInput:
      return new CampaignInfoFactoryInvalidInputError();
    case CampaignInfoFactoryErrorNames.PlatformNotListed:
      return new CampaignInfoFactoryPlatformNotListedError({
        platformHash: args["platformHash"] as string,
      });
    case CampaignInfoFactoryErrorNames.CampaignWithSameIdentifierExists:
      return new CampaignInfoFactoryCampaignWithSameIdentifierExistsError({
        identifierHash: args["identifierHash"] as string,
        cloneExists: args["cloneExists"] as string,
      });
    case CampaignInfoFactoryErrorNames.CampaignInfoInvalidTokenList:
      return new CampaignInfoInvalidTokenListError();
    /* istanbul ignore next -- defensive fallback; all ABI errors are handled above */
    default:
      return (
        toSharedContractError(name, args) ??
        new (class extends Error implements ContractErrorBase {
          readonly name = name;
          readonly args = args;
        })(`${name}(${JSON.stringify(args)})`)
      );
  }
}

/**
 * Decodes raw revert data from a CampaignInfoFactory contract call into a typed SDK error.
 * @param data - 0x-prefixed hex revert data
 * @returns Typed CampaignInfoFactory error instance, or null if the selector is not recognised
 */
export function parseCampaignInfoFactoryError(data: Hex): ContractErrorBase | null {
  return tryDecodeContractError(
    CAMPAIGN_INFO_FACTORY_ABI as readonly ErrorAbiEntry[],
    data,
    toCampaignInfoFactoryError,
  );
}
