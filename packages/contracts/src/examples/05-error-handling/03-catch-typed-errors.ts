/**
 * Step 3: Catch and Parse Typed Errors
 *
 * When a transaction reverts, the SDK decodes the raw revert data
 * into a typed error class with a human-readable recovery hint.
 *
 * Two patterns are shown:
 *   1. Check for specific error types with instanceof
 *   2. Parse unknown revert data with parseContractError
 */

import {
  createOakContractsClient,
  keccak256,
  toHex,
  CHAIN_IDS,
  parseContractError,
  getRevertData,
  getRecoveryHint,
} from "@oaknetwork/contracts-sdk";

import {
  CampaignInfoUnauthorizedError,
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
  // Pattern 1: Check for specific error types
  if (error instanceof CampaignInfoUnauthorizedError) {
    console.error("You are not the campaign owner.");
    console.error("Hint:", error.recoveryHint);
    // return;
  }

  // Pattern 2: Parse unknown revert data
  const revertData = getRevertData(error);
  if (revertData) {
    const parsed = parseContractError(revertData);
    if (parsed) {
      console.error(`Contract error: ${parsed.name}`);
      console.error("Arguments:", parsed.args);

      const hint = getRecoveryHint(parsed);
      if (hint) {
        console.error("Recovery hint:", hint);
      }
      // return;
    }
  }

  // Unknown error
  console.error("Unknown error:", (error as Error).message);
}
