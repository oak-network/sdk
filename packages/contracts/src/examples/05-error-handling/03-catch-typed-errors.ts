/**
 * Step 3: Catch and Parse Typed Errors
 *
 * When a transaction reverts, the SDK decodes the raw revert data
 * into a typed error class with a human-readable recovery hint.
 *
 * Three patterns are shown:
 *   1. Check for specific error types with instanceof
 *   2. Match by error name using type-safe constants
 *   3. Parse unknown revert data with parseContractError
 */

import {
  createOakContractsClient,
  toHex,
  CHAIN_IDS,
  parseContractError,
  getRevertData,
  getRecoveryHint,
} from "@oaknetwork/contracts-sdk";

import {
  CampaignInfoUnauthorizedError,
  CampaignInfoErrorNames,
  SharedErrorNames,
} from "@oaknetwork/contracts-sdk/errors";

const oak = createOakContractsClient({
  chainId: CHAIN_IDS.CELO_TESTNET_SEPOLIA,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PRIVATE_KEY! as `0x${string}`,
});

const campaign = oak.campaignInfo(process.env.CAMPAIGN_INFO_ADDRESS! as `0x${string}`);

try {
  await campaign.cancelCampaign(toHex("cancelled by user", { size: 32 }));
} catch (error) {
  // Pattern 1: Check for specific error types with instanceof
  if (error instanceof CampaignInfoUnauthorizedError) {
    console.error("You are not the campaign owner.");
    console.error("Hint:", error.recoveryHint);
  } else {
    // Pattern 2: Parse revert data and match by error name constant
    const revertData = getRevertData(error);
    const parsed = revertData ? parseContractError(revertData) : null;

    if (parsed) {
      switch (parsed.name) {
        case CampaignInfoErrorNames.IsLocked:
          console.error("Campaign is locked — no further modifications allowed.");
          break;
        case SharedErrorNames.PausedError:
          console.error("Campaign is currently paused. Wait for it to be unpaused.");
          break;
        case SharedErrorNames.CancelledError:
          console.error("Campaign has already been cancelled.");
          break;
        default:
          // Pattern 3: Generic fallback for any other contract error
          console.error(`Contract error: ${parsed.name}`);
          console.error("Arguments:", parsed.args);
      }

      const hint = getRecoveryHint(parsed);
      if (hint) {
        console.error("Recovery hint:", hint);
      }
    } else {
      console.error("Unknown error:", (error as Error).message);
    }
  }
}
