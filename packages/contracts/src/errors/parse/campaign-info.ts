import type { Hex } from "../../lib";
import type { ContractErrorBase } from "../base";
import { CAMPAIGN_INFO_ABI } from "../../contracts/campaign-info/abi";
import {
  CampaignInfoErrorNames,
  CampaignInfoInvalidInputError,
  CampaignInfoInvalidPlatformUpdateError,
  CampaignInfoIsLockedError,
  CampaignInfoPlatformAlreadyApprovedError,
  CampaignInfoPlatformNotSelectedError,
  CampaignInfoUnauthorizedError,
} from "../contracts/campaign-info";
import type { ErrorAbiEntry } from "./shared";
import { toSharedContractError, tryDecodeContractError } from "./shared";

/**
 * Maps a decoded CampaignInfo error name and args to a typed SDK error instance.
 * @param name - Decoded error name string
 * @param args - Decoded error arguments
 * @returns Typed CampaignInfo error, or a shared/generic fallback
 */
function toCampaignInfoError(name: string, args: Record<string, unknown>): ContractErrorBase {
  switch (name) {
    case CampaignInfoErrorNames.InvalidInput:
      return new CampaignInfoInvalidInputError();
    case CampaignInfoErrorNames.InvalidPlatformUpdate:
      return new CampaignInfoInvalidPlatformUpdateError({
        platformBytes: args["platformBytes"] as string,
        selection: args["selection"] as boolean,
      });
    case CampaignInfoErrorNames.PlatformNotSelected:
      return new CampaignInfoPlatformNotSelectedError({
        platformBytes: args["platformBytes"] as string,
      });
    case CampaignInfoErrorNames.PlatformAlreadyApproved:
      return new CampaignInfoPlatformAlreadyApprovedError({
        platformHash: args["platformHash"] as string,
      });
    case CampaignInfoErrorNames.Unauthorized:
      return new CampaignInfoUnauthorizedError();
    case CampaignInfoErrorNames.IsLocked:
      return new CampaignInfoIsLockedError();
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
 * Decodes raw revert data from a CampaignInfo contract call into a typed SDK error.
 * @param data - 0x-prefixed hex revert data
 * @returns Typed CampaignInfo error instance, or null if the selector is not recognised
 */
export function parseCampaignInfoError(data: Hex): ContractErrorBase | null {
  return tryDecodeContractError(
    CAMPAIGN_INFO_ABI as readonly ErrorAbiEntry[],
    data,
    toCampaignInfoError,
  );
}
