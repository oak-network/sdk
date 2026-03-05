export type { ContractErrorBase } from "./contract-error.js";
export { parseContractError } from "./parse-contract-error.js";
export {
  GlobalParamsCurrencyHasNoTokensError,
  GlobalParamsCurrencyTokenLengthMismatchError,
  GlobalParamsInvalidInputError,
  GlobalParamsPlatformAdminNotSetError,
  GlobalParamsPlatformAlreadyListedError,
  GlobalParamsPlatformDataAlreadySetError,
  GlobalParamsPlatformDataNotSetError,
  GlobalParamsPlatformDataSlotTakenError,
  GlobalParamsPlatformFeePercentIsZeroError,
  GlobalParamsPlatformLineItemTypeNotFoundError,
  GlobalParamsPlatformNotListedError,
  GlobalParamsTokenNotInCurrencyError,
  GlobalParamsUnauthorizedError,
} from "./global-params.js";
export type { GlobalParamsError } from "./global-params.js";
export {
  CampaignInfoFactoryCampaignInitializationFailedError,
  CampaignInfoFactoryCampaignWithSameIdentifierExistsError,
  CampaignInfoFactoryInvalidInputError,
  CampaignInfoFactoryPlatformNotListedError,
  CampaignInfoInvalidTokenListError,
} from "./campaign-info-factory.js";
export type { CampaignInfoFactoryError } from "./campaign-info-factory.js";

import type { ContractErrorBase } from "./contract-error.js";

/**
 * Returns a human-readable recovery suggestion for a typed contract error, if available.
 */
export function getRecoveryHint(error: ContractErrorBase): string | undefined {
  return error.recoveryHint;
}
